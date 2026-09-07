import os
import io
import json
import hashlib
import numpy as np
from PIL import Image
from flask import Blueprint, request, jsonify
from werkzeug.utils import secure_filename
from models_db import db, DiseaseHistory

disease_bp = Blueprint("disease", __name__)

ALLOWED_EXTENSIONS = {"png", "jpg", "jpeg", "webp"}
MODEL_DIR = os.path.join(os.path.dirname(__file__), "..", "models")
TFLITE_MODEL_PATH = os.path.join(MODEL_DIR, "disease_model.tflite")
CLASS_INDEX_PATH = os.path.join(MODEL_DIR, "class_indices.json")

_tflite_interpreter = None
_tflite_input_details = None
_tflite_output_details = None
_idx_to_label = {}

DISEASE_ADVICE_MAP = {
    "Pepper__bell___Bacterial_spot": "Apply copper-maneb bactericide spray; avoid overhead irrigation; rotate crops on a 2–3 year cycle.",
    "Pepper__bell___healthy": "Bell pepper plant is healthy! Maintain consistent soil moisture and inspect regularly for aphids.",
    "Potato___Early_blight": "Apply chlorothalonil, mancozeb, or copper fungicide; remove infected lower foliage and practice crop rotation.",
    "Potato___Late_blight": "Apply systemic fungicide (mancozeb/cymoxanil/copper); destroy infected tubers and vines to prevent rapid field spread.",
    "Potato___healthy": "Potato crop is healthy! Maintain good soil hilling and avoid waterlogging.",
    "Tomato_Bacterial_spot": "Apply copper bactericide mixed with mancozeb; avoid working in fields when plants are wet.",
    "Tomato_Early_blight": "Apply copper or chlorothalonil fungicide; prune lower leaf suckers; apply mulch around base.",
    "Tomato_Late_blight": "Apply systemic copper or mancozeb fungicide immediately; destroy heavily infected foliage to stop outbreak.",
    "Tomato_Leaf_Mold": "Enhance greenhouse ventilation and lower humidity; avoid foliage wetting; apply copper fungicide.",
    "Tomato_Septoria_leaf_spot": "Remove infected lower leaves; apply preventative chlorothalonil or copper spray; keep garden weed-free.",
    "Tomato_Spider_mites_Two_spotted_spider_mite": "Spray with neem oil, insecticidal soap, or miticide; increase humidity; release predatory mites.",
    "Tomato__Target_Spot": "Apply chlorothalonil or azoxystrobin fungicide; prune lower branches for canopy airflow.",
    "Tomato__Tomato_YellowLeaf__Curl_Virus": "Control whitefly vector with sticky traps or insecticidal soap; remove and isolate infected plants.",
    "Tomato__Tomato_mosaic_virus": "Remove and burn infected plants; disinfect tools and hands; control aphid and leafhopper vectors.",
    "Tomato_healthy": "Tomato plant is healthy! Continue regular staking, pruning, and consistent drip irrigation.",
    "healthy": "Plant appears healthy! No treatment required. Continue regular monitoring and optimal crop care."
}


def get_advice_for_label(label: str) -> str:
    if not label:
        return "Consult a local agronomist or agricultural extension service for detailed treatment recommendations."

    if label in DISEASE_ADVICE_MAP:
        return DISEASE_ADVICE_MAP[label]

    clean_label = label.lower().replace(" ", "_")
    for key, advice in DISEASE_ADVICE_MAP.items():
        if key.lower().replace(" ", "_") == clean_label:
            return advice

    for key, advice in DISEASE_ADVICE_MAP.items():
        key_clean = key.lower().replace(" ", "_")
        if key_clean in clean_label or clean_label in key_clean:
            return advice

    if "healthy" in label.lower():
        return "Plant appears healthy! No treatment required. Continue regular monitoring and optimal crop care."

    return "Consult a local agronomist or agricultural extension service for detailed treatment recommendations."


def get_user_id_from_header():
    auth_header = request.headers.get("Authorization", "")
    if auth_header.startswith("Bearer agriai_token_"):
        try:
            return int(auth_header.replace("Bearer agriai_token_", "").strip())
        except (ValueError, TypeError):
            return None
    return None


def load_tflite_interpreter(model_path: str):
    if not os.path.exists(model_path):
        return None, None, None

    for mod_name, attr_name in [
        ("ai_edge_litert.interpreter", "Interpreter"),
        ("tflite_runtime.interpreter", "Interpreter"),
        ("tensorflow.lite", "Interpreter"),
    ]:
        try:
            import importlib
            mod = importlib.import_module(mod_name)
            Interpreter = getattr(mod, attr_name, None)
            if Interpreter is not None:
                interp = Interpreter(model_path=model_path)
                interp.allocate_tensors()
                in_details = interp.get_input_details()
                out_details = interp.get_output_details()
                print(f"Disease Detection: Successfully loaded TFLite model from {model_path} via {mod_name}")
                return interp, in_details, out_details
        except Exception:
            continue

    print(f"Warning: Could not initialize TFLite interpreter for {model_path}")
    return None, None, None


if os.path.exists(CLASS_INDEX_PATH):
    try:
        with open(CLASS_INDEX_PATH, "r") as f:
            class_indices = json.load(f)
        for k, v in class_indices.items():
            if isinstance(v, int) or (isinstance(v, str) and v.isdigit()):
                _idx_to_label[int(v)] = str(k)
            elif isinstance(k, int) or (isinstance(k, str) and k.isdigit()):
                _idx_to_label[int(k)] = str(v)
    except Exception as e:
        print("Warning: Could not parse class_indices.json:", e)

_tflite_interpreter, _tflite_input_details, _tflite_output_details = load_tflite_interpreter(TFLITE_MODEL_PATH)

MOCK_CLASSES = [
    {"label": "Pepper__bell___Bacterial_spot", "advice": "Apply copper-maneb bactericide spray; avoid overhead irrigation; rotate crops on a 2–3 year cycle."},
    {"label": "Pepper__bell___healthy", "advice": "Bell pepper plant is healthy! Maintain consistent soil moisture and inspect regularly for aphids."},
    {"label": "Potato___Early_blight", "advice": "Apply chlorothalonil, mancozeb, or copper fungicide; remove infected lower foliage and practice crop rotation."},
    {"label": "Potato___Late_blight", "advice": "Apply systemic fungicide (mancozeb/cymoxanil/copper); destroy infected tubers and vines to prevent rapid field spread."},
    {"label": "Potato___healthy", "advice": "Potato crop is healthy! Maintain good soil hilling and avoid waterlogging."},
    {"label": "Tomato_Bacterial_spot", "advice": "Apply copper bactericide mixed with mancozeb; avoid working in fields when plants are wet."},
    {"label": "Tomato_Early_blight", "advice": "Apply copper or chlorothalonil fungicide; prune lower leaf suckers; apply mulch around base."},
    {"label": "Tomato_Late_blight", "advice": "Apply systemic copper or mancozeb fungicide immediately; destroy heavily infected foliage to stop outbreak."},
    {"label": "Tomato_Leaf_Mold", "advice": "Enhance greenhouse ventilation and lower humidity; avoid foliage wetting; apply copper fungicide."},
    {"label": "Tomato_Septoria_leaf_spot", "advice": "Remove infected lower leaves; apply preventative chlorothalonil or copper spray; keep garden weed-free."},
    {"label": "Tomato_Spider_mites_Two_spotted_spider_mite", "advice": "Spray with neem oil, insecticidal soap, or miticide; increase humidity; release predatory mites."},
    {"label": "Tomato__Target_Spot", "advice": "Apply chlorothalonil or azoxystrobin fungicide; prune lower branches for canopy airflow."},
    {"label": "Tomato__Tomato_YellowLeaf__Curl_Virus", "advice": "Control whitefly vector with sticky traps or insecticidal soap; remove and isolate infected plants."},
    {"label": "Tomato__Tomato_mosaic_virus", "advice": "Remove and burn infected plants; disinfect tools and hands; control aphid and leafhopper vectors."},
    {"label": "Tomato_healthy", "advice": "Tomato plant is healthy! Continue regular staking, pruning, and consistent drip irrigation."}
]


def allowed_file(filename):
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS


def mock_predict(image_bytes: bytes):
    digest = hashlib.sha256(image_bytes).hexdigest()
    idx = int(digest, 16) % len(MOCK_CLASSES)
    confidence = 70 + (int(digest[:4], 16) % 30)
    result = MOCK_CLASSES[idx]
    return {"label": result["label"], "confidence": float(confidence), "advice": result["advice"]}


def predict_tflite(image_bytes: bytes):
    img = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    img = img.resize((224, 224), Image.BILINEAR)
    arr = np.array(img, dtype=np.float32)
    if arr.max() > 1.0:
        arr = arr / 255.0
    input_tensor = arr[np.newaxis, ...]

    _tflite_interpreter.set_tensor(_tflite_input_details[0]["index"], input_tensor)
    _tflite_interpreter.invoke()
    probabilities = _tflite_interpreter.get_tensor(_tflite_output_details[0]["index"])[0]

    top_indices = np.argsort(probabilities)[::-1][:3]
    top_idx = int(top_indices[0])
    confidence = float(probabilities[top_idx]) * 100.0
    label = _idx_to_label.get(top_idx, f"Class_{top_idx}")
    advice = get_advice_for_label(label)

    top_3 = []
    for idx in top_indices:
        i = int(idx)
        top_3.append({
            "label": _idx_to_label.get(i, f"Class_{i}"),
            "confidence_percent": round(float(probabilities[i]) * 100.0, 2)
        })

    return {
        "label": label,
        "confidence": round(confidence, 2),
        "advice": advice,
        "top_3": top_3,
    }


@disease_bp.route("/predict", methods=["POST"])
def predict_disease():
    if "image" not in request.files:
        return jsonify({"error": "No image file provided. Use form field name 'image'."}), 400

    file = request.files["image"]
    if file.filename == "":
        return jsonify({"error": "Empty filename."}), 400
    if not allowed_file(file.filename):
        return jsonify({"error": f"Unsupported file type. Allowed: {ALLOWED_EXTENSIONS}"}), 400

    filename = secure_filename(file.filename)
    image_bytes = file.read()

    if _tflite_interpreter is not None:
        try:
            prediction = predict_tflite(image_bytes)
            source = "tflite_model"
        except Exception as err:
            print("Error during TFLite inference, falling back:", err)
            prediction = mock_predict(image_bytes)
            source = "mock_fallback"
    else:
        prediction = mock_predict(image_bytes)
        source = "mock"

    rec_action = prediction.get("advice") or "Consult local agronomist for detailed treatment."

    user_id = get_user_id_from_header()
    try:
        log_entry = DiseaseHistory(
            user_id=user_id,
            filename=filename,
            prediction=prediction["label"],
            confidence_percent=prediction["confidence"],
            recommended_action=rec_action
        )
        db.session.add(log_entry)
        db.session.commit()
    except Exception as err:
        db.session.rollback()
        print("Failed to save disease detection log to database:", err)

    return jsonify({
        "filename": filename,
        "prediction": prediction["label"],
        "class_name": prediction["label"],
        "confidence_percent": prediction["confidence"],
        "recommended_action": rec_action,
        "top_3": prediction.get("top_3", []),
        "source": source,
    })


@disease_bp.route("/history", methods=["GET"])
def get_disease_history():
    user_id = get_user_id_from_header()
    try:
        query = DiseaseHistory.query
        if user_id:
            query = query.filter_by(user_id=user_id)
        logs = query.order_by(DiseaseHistory.created_at.desc()).limit(20).all()
        history_list = []
        for log in logs:
            item = log.to_dict()
            rec = item.get("recommended_action") or ""
            if not rec or rec.startswith("Consult a local agronomist"):
                item["recommended_action"] = get_advice_for_label(log.prediction)
            history_list.append(item)
        return jsonify({"history": history_list})
    except Exception as err:
        return jsonify({"history": [], "error": str(err)}), 500

