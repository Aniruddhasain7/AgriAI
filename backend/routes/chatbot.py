import os
from groq import Groq
from flask import Blueprint, request, jsonify

chatbot_bp = Blueprint("chatbot", __name__)

_client = None

def _get_client():
    global _client
    api_key = os.environ.get("GROQ_API_KEY")
    if _client is None and api_key:
        _client = Groq(api_key=api_key)
    return _client

SYSTEM_INSTRUCTION = (
    "You are AgriAI, an expert agricultural assistant helping farmers with practical advice on crops, "
    "plant diseases, fertilizers, soil management, irrigation, pest control, weather protection, and market decisions.\n\n"
    "Formatting Guidelines:\n"
    "1. Structure your answers cleanly using Markdown headings (###), bullet points, and bold text for keywords.\n"
    "2. Prefer clean bullet points and step-by-step lists over complex wide ASCII tables so the response is easy to read on mobile and desktop.\n"
    "3. Never output raw HTML tags (do not use <br>, <table>, etc.). Use pure Markdown.\n"
    "4. Keep explanations practical, farmer-friendly, and actionable in the field.\n"
    "5. If a question is unrelated to agriculture, politely redirect to farming topics."
)

sessions: dict[str, list] = {}


MODELS = [
    "openai/gpt-oss-120b",
    "openai/gpt-oss-20b",
]

@chatbot_bp.route("/message", methods=["POST"])
def chat():
    data = request.get_json(silent=True) or {}
    message = data.get("message", "").strip()
    session_id = data.get("session_id", "default")
    lang = data.get("lang", "English")

    if not message:
        return jsonify({"error": "Field 'message' is required."}), 400

    api_key = os.environ.get("GROQ_API_KEY")
    if not api_key:
        return jsonify({"error": "GROQ_API_KEY not configured on the server."}), 500

    client = _get_client()
    if not client:
        return jsonify({"error": "Failed to initialize Groq client. Please check GROQ_API_KEY."}), 500

    if session_id not in sessions:
        sessions[session_id] = [
            {"role": "system", "content": SYSTEM_INSTRUCTION}
        ]

    history = sessions[session_id]
    prompt = f"Respond in {lang}. Farmer's question: {message}"
    messages_payload = history + [{"role": "user", "content": prompt}]

    reply = None
    last_error = None

    for model in MODELS:
        try:
            chat_completion = client.chat.completions.create(
                model=model,
                messages=messages_payload,
                temperature=0.6,
            )
            reply = chat_completion.choices[0].message.content or ""
            break
        except Exception as e:
            last_error = str(e)
            continue

    if reply is None:
        return jsonify({"error": f"Groq API error: {last_error}"}), 502

    history.append({"role": "user", "content": prompt})
    history.append({"role": "assistant", "content": reply})

    if len(history) > 21:
        sessions[session_id] = [history[0]] + history[-20:]

    return jsonify({"reply": reply, "session_id": session_id})