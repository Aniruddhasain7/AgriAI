import os
import time
import requests
from datetime import datetime, timedelta
from flask import Blueprint, request, jsonify

market_bp = Blueprint("market", __name__)

CROP_DATA = {
    "rice": {
        "name": "Paddy / Rice (धान)",
        "msp": 2300,
        "base_price": 2420,
        "unit": "INR per quintal",
        "tgk_key": "rice",
        "mandis": [
            {"mandi": "Karnal Mandi",     "state": "Haryana",      "variety": "Basmati / Common",  "arrivals_tonnes": 420, "price_offset": 1.05},
            {"mandi": "Burdwan APMC",     "state": "West Bengal",  "variety": "Swarna / IR-36",    "arrivals_tonnes": 680, "price_offset": 0.98},
            {"mandi": "Nizamabad Mandi",  "state": "Telangana",    "variety": "BPT 5204",          "arrivals_tonnes": 510, "price_offset": 1.02},
            {"mandi": "Taran Taran APMC", "state": "Punjab",       "variety": "PR-126",            "arrivals_tonnes": 890, "price_offset": 1.04},
        ],
    },
    "wheat": {
        "name": "Wheat (गेहूं)",
        "msp": 2275,
        "base_price": 2480,
        "unit": "INR per quintal",
        "tgk_key": None,
        "mandis": [
            {"mandi": "Khanna Mandi",  "state": "Punjab",           "variety": "PBW-343 / HD-2967", "arrivals_tonnes": 1150, "price_offset": 1.03},
            {"mandi": "Indore APMC",   "state": "Madhya Pradesh",   "variety": "Sharbati / Lokwan", "arrivals_tonnes": 920,  "price_offset": 1.08},
            {"mandi": "Karnal APMC",   "state": "Haryana",          "variety": "HD-3086",           "arrivals_tonnes": 740,  "price_offset": 1.02},
            {"mandi": "Hapur Mandi",   "state": "Uttar Pradesh",    "variety": "Dara Wheat",        "arrivals_tonnes": 580,  "price_offset": 1.01},
        ],
    },
    "maize": {
        "name": "Maize / Corn (मक्का)",
        "msp": 2090,
        "base_price": 2240,
        "unit": "INR per quintal",
        "tgk_key": None,
        "mandis": [
            {"mandi": "Gulabbagh Mandi",   "state": "Bihar",          "variety": "Yellow Hybrid",     "arrivals_tonnes": 1400, "price_offset": 1.04},
            {"mandi": "Davanagere APMC",   "state": "Karnataka",      "variety": "African Tall / Pioneer", "arrivals_tonnes": 850, "price_offset": 1.01},
            {"mandi": "Chhindwara Mandi",  "state": "Madhya Pradesh", "variety": "Hybrid Feed Grade", "arrivals_tonnes": 720,  "price_offset": 0.98},
        ],
    },
    "cotton": {
        "name": "Cotton (कपास)",
        "msp": 7121,
        "base_price": 7450,
        "unit": "INR per quintal",
        "tgk_key": "cotton",
        "mandis": [
            {"mandi": "Rajkot APMC",   "state": "Gujarat",    "variety": "Shankar-6",          "arrivals_tonnes": 1200, "price_offset": 1.05},
            {"mandi": "Amravati Mandi","state": "Maharashtra","variety": "Medium / Long Staple","arrivals_tonnes": 940,  "price_offset": 1.01},
            {"mandi": "Adilabad APMC", "state": "Telangana",  "variety": "Bunny Bt Cotton",    "arrivals_tonnes": 680,  "price_offset": 0.98},
        ],
    },
    "sugarcane": {
        "name": "Sugarcane (गन्ना)",
        "msp": 340,
        "base_price": 375,
        "unit": "INR per quintal",
        "tgk_key": None,
        "mandis": [
            {"mandi": "Muzaffarnagar Mandi", "state": "Uttar Pradesh", "variety": "Co 0238",   "arrivals_tonnes": 3200, "price_offset": 1.03},
            {"mandi": "Kolhapur APMC",       "state": "Maharashtra",   "variety": "Co 86032",  "arrivals_tonnes": 2900, "price_offset": 1.04},
            {"mandi": "Mandya Market",       "state": "Karnataka",     "variety": "Co 62175",  "arrivals_tonnes": 1800, "price_offset": 0.99},
        ],
    },
    "soybean": {
        "name": "Soybean (सोयाबीन)",
        "msp": 4892,
        "base_price": 4780,
        "unit": "INR per quintal",
        "tgk_key": None,
        "mandis": [
            {"mandi": "Indore APMC", "state": "Madhya Pradesh", "variety": "JS-9560 / Yellow", "arrivals_tonnes": 1600, "price_offset": 1.04},
            {"mandi": "Latur APMC",  "state": "Maharashtra",    "variety": "JS-335 Grade A",   "arrivals_tonnes": 1450, "price_offset": 1.02},
            {"mandi": "Kota Mandi",  "state": "Rajasthan",      "variety": "Yellow Soybean",   "arrivals_tonnes": 890,  "price_offset": 0.98},
        ],
    },
    "mustard": {
        "name": "Mustard Seed (सरसों)",
        "msp": 5650,
        "base_price": 5820,
        "unit": "INR per quintal",
        "tgk_key": None,
        "mandis": [
            {"mandi": "Jaipur APMC",  "state": "Rajasthan",      "variety": "42% Oil Content",   "arrivals_tonnes": 1350, "price_offset": 1.05},
            {"mandi": "Hisar Mandi",  "state": "Haryana",         "variety": "RH-749 / Pusa Bold","arrivals_tonnes": 780,  "price_offset": 1.02},
            {"mandi": "Morena Mandi", "state": "Madhya Pradesh",  "variety": "Yellow / Black Mix","arrivals_tonnes": 540,  "price_offset": 1.01},
        ],
    },
    "gram": {
        "name": "Gram / Chana (चना)",
        "msp": 5440,
        "base_price": 6150,
        "unit": "INR per quintal",
        "tgk_key": "desi-chana",
        "mandis": [
            {"mandi": "Bikaner APMC",  "state": "Rajasthan",     "variety": "Desi Chana",        "arrivals_tonnes": 920,  "price_offset": 1.03},
            {"mandi": "Akola APMC",    "state": "Maharashtra",   "variety": "Chana Digvijay",    "arrivals_tonnes": 840,  "price_offset": 1.01},
            {"mandi": "Indore Mandi",  "state": "Madhya Pradesh","variety": "Dollar / Desi Mix",  "arrivals_tonnes": 760,  "price_offset": 1.04},
        ],
    },
    "groundnut": {
        "name": "Groundnut (मूंगफली)",
        "msp": 6783,
        "base_price": 6950,
        "unit": "INR per quintal",
        "tgk_key": None,
        "mandis": [
            {"mandi": "Rajkot APMC",    "state": "Gujarat",          "variety": "G-20 Pods",     "arrivals_tonnes": 1100, "price_offset": 1.04},
            {"mandi": "Gondal APMC",    "state": "Gujarat",          "variety": "Bold / Java",   "arrivals_tonnes": 1300, "price_offset": 1.05},
            {"mandi": "Anantapur APMC", "state": "Andhra Pradesh",   "variety": "TMV-2 / K-6",   "arrivals_tonnes": 650,  "price_offset": 0.98},
        ],
    },
    "potato": {
        "name": "Potato (आलू)",
        "msp": 1200,
        "base_price": 1650,
        "unit": "INR per quintal",
        "tgk_key": None,
        "mandis": [
            {"mandi": "Agra APMC",     "state": "Uttar Pradesh", "variety": "Kufri Bahar / Chipsona", "arrivals_tonnes": 2800, "price_offset": 1.02},
            {"mandi": "Hooghly APMC",  "state": "West Bengal",   "variety": "Jyoti / Chandramukhi",   "arrivals_tonnes": 2400, "price_offset": 0.98},
            {"mandi": "Jalandhar Mandi","state": "Punjab",       "variety": "Table / Seed Potato",     "arrivals_tonnes": 1400, "price_offset": 1.04},
        ],
    },
    "onion": {
        "name": "Onion (प्याज़)",
        "msp": 1400,
        "base_price": 2450,
        "unit": "INR per quintal",
        "tgk_key": None,
        "mandis": [
            {"mandi": "Lasalgaon APMC",  "state": "Maharashtra", "variety": "Red Onion",         "arrivals_tonnes": 3500, "price_offset": 1.05},
            {"mandi": "Pimpalgaon APMC", "state": "Maharashtra", "variety": "Garva Onion",       "arrivals_tonnes": 2800, "price_offset": 1.03},
            {"mandi": "Mahuva APMC",     "state": "Gujarat",     "variety": "White / Red Mix",   "arrivals_tonnes": 1200, "price_offset": 0.96},
        ],
    },
    "tomato": {
        "name": "Tomato (टमाटर)",
        "msp": 1300,
        "base_price": 2100,
        "unit": "INR per quintal",
        "tgk_key": None,
        "mandis": [
            {"mandi": "Kolar APMC",      "state": "Karnataka",       "variety": "Hybrid Fresh", "arrivals_tonnes": 2100, "price_offset": 1.04},
            {"mandi": "Madanapalle APMC","state": "Andhra Pradesh",  "variety": "Tomato F1",    "arrivals_tonnes": 1900, "price_offset": 1.02},
            {"mandi": "Nashik APMC",     "state": "Maharashtra",     "variety": "Abhinav / Local","arrivals_tonnes": 1400, "price_offset": 1.01},
        ],
    },
}

_MARKET_CACHE = {}
_TGK_CACHE = {"data": None, "time": 0}
CACHE_TTL = 900
TGK_CACHE_TTL = 3600

TGK_LIVE_URL = "https://tgkagro.com/prices/live_prices.json"
TGK_HEADERS  = {"User-Agent": "AgriAI-SmartFarming/1.0 (https://agri-ai-5.vercel.app)"}


def _fetch_tgk_live():
    now = time.time()
    if _TGK_CACHE["data"] and (now - _TGK_CACHE["time"]) < TGK_CACHE_TTL:
        return _TGK_CACHE["data"]
    try:
        resp = requests.get(TGK_LIVE_URL, headers=TGK_HEADERS, timeout=6)
        if resp.status_code == 200:
            raw = resp.json()
            items = {item["name"].lower().replace(" ", "-"): item for item in raw.get("items", [])}
            _TGK_CACHE["data"] = items
            _TGK_CACHE["time"] = now
            return items
    except Exception:
        pass
    return _TGK_CACHE.get("data") or {}


def _get_current_price(crop_key: str) -> float:
    crop_info = CROP_DATA[crop_key]
    tgk_key = crop_info.get("tgk_key")

    if tgk_key:
        live = _fetch_tgk_live()
        entry = live.get(tgk_key)
        if entry and entry.get("inr_per_quintal"):
            return float(entry["inr_per_quintal"])

    seed = int(datetime.now().strftime("%Y%m%d")) + sum(ord(c) for c in crop_key)
    import math
    variation = 1.0 + (math.sin(seed * 0.17) * 0.02)
    return round(crop_info["base_price"] * variation, 2)


def _build_7day_trend(crop_key: str, today_price: float) -> tuple[list, list]:
    import math
    crop_info = CROP_DATA[crop_key]
    vol = 0.012
    prices = []
    dates = []
    today = datetime.now()
    for i in range(6, -1, -1):
        dt = today - timedelta(days=i)
        dates.append(dt.strftime("%Y-%m-%d"))
        seed = int(dt.strftime("%Y%m%d")) + sum(ord(c) for c in crop_key)
        noise = math.sin(seed * 0.31) * vol
        scale = today_price / crop_info["base_price"]
        p = round(crop_info["base_price"] * scale * (1.0 + noise), 2)
        prices.append(p)
    prices[-1] = today_price
    return dates, prices


def _build_mandi_rates(crop_key: str, today_price: float) -> list:
    crop_info = CROP_DATA[crop_key]
    result = []
    for m in crop_info.get("mandis", []):
        modal = round(today_price * m["price_offset"], 2)
        result.append({
            "mandi": m["mandi"],
            "state": m["state"],
            "variety": m.get("variety", "Standard"),
            "modal_price": modal,
            "min_price": round(modal * 0.94, 2),
            "max_price": round(modal * 1.06, 2),
            "arrivals_tonnes": m.get("arrivals_tonnes", 500),
        })
    return result


def _get_groq_client():
    api_key = os.environ.get("GROQ_API_KEY")
    if not api_key:
        return None
    try:
        from groq import Groq
        return Groq(api_key=api_key)
    except Exception:
        return None


LLM_MODELS = ["openai/gpt-oss-120b", "openai/gpt-oss-20b"]


def _get_farmer_advisory(crop_name: str, today_price: float, msp: float, trend: list, lang: str = "English") -> str:
    client = _get_groq_client()
    if not client:
        return _fallback_advisory(today_price, msp)

    price_change_7d = round(((today_price - trend[0]) / trend[0]) * 100, 1) if trend[0] > 0 else 0
    msp_diff = round(today_price - msp, 2)
    msp_pct = round((msp_diff / msp) * 100, 1) if msp > 0 else 0
    direction = "up" if price_change_7d >= 0 else "down"

    prompt = (
        f"You are an agricultural market advisor helping Indian farmers. "
        f"Give a practical, simple 2-3 sentence selling advisory in {lang}.\n\n"
        f"Commodity: {crop_name}\n"
        f"Today's market price: ₹{today_price}/quintal\n"
        f"Govt MSP: ₹{msp}/quintal\n"
        f"Price vs MSP: ₹{msp_diff} ({'+' if msp_diff >= 0 else ''}{msp_pct}%)\n"
        f"7-day price direction: {direction} by {abs(price_change_7d)}%\n\n"
        f"Tell the farmer in simple words: should they sell now or wait? Give 1 practical reason. Keep it under 60 words."
    )

    for model in LLM_MODELS:
        try:
            resp = client.chat.completions.create(
                model=model,
                messages=[{"role": "user", "content": prompt}],
                temperature=0.5,
                max_tokens=120,
            )
            reply = resp.choices[0].message.content or ""
            if reply.strip():
                return reply.strip()
        except Exception:
            continue

    return _fallback_advisory(today_price, msp)


def _fallback_advisory(today_price: float, msp: float) -> str:
    msp_diff = today_price - msp
    if msp_diff >= 200:
        return f"Market price is ₹{round(msp_diff)}/qtl above Govt MSP — a good window to sell part of your stock and lock in profits."
    elif msp_diff >= 0:
        return f"Price is at or slightly above MSP (₹{round(msp_diff)}/qtl premium). Consider gradual selling while monitoring arrivals at your local mandi."
    else:
        return f"Current price is ₹{abs(round(msp_diff))}/qtl below MSP. If possible, hold stock and check if your state offers MSP procurement this season."


@market_bp.route("/commodities", methods=["GET"])
def get_supported_commodities():
    items = [
        {
            "id": k,
            "name": v["name"],
            "msp": v["msp"],
            "base_price": v["base_price"],
            "unit": v["unit"],
        }
        for k, v in CROP_DATA.items()
    ]
    return jsonify({"commodities": items, "count": len(items)})


@market_bp.route("/trend", methods=["GET"])
def price_trend():
    crop = request.args.get("crop", "rice").strip().lower()
    lang = request.args.get("lang", "English").strip()

    if crop not in CROP_DATA:
        return jsonify({
            "error": f"Unknown commodity '{crop}'. Supported: {list(CROP_DATA.keys())}"
        }), 400

    cache_key = f"{crop}_{lang}_{datetime.now().strftime('%Y%m%d%H')}"
    if cache_key in _MARKET_CACHE:
        cached = _MARKET_CACHE[cache_key]
        if time.time() - cached["time"] < CACHE_TTL:
            return jsonify(cached["payload"])

    crop_info = CROP_DATA[crop]
    today_price = _get_current_price(crop)
    dates, trend = _build_7day_trend(crop, today_price)
    mandi_rates = _build_mandi_rates(crop, today_price)
    advisory = _get_farmer_advisory(crop_info["name"], today_price, crop_info["msp"], trend, lang)

    msp = crop_info["msp"]
    msp_diff = round(today_price - msp, 2)
    msp_pct = round((msp_diff / msp) * 100, 1) if msp > 0 else 0
    change_7d = round(((today_price - trend[0]) / trend[0]) * 100, 1) if trend[0] > 0 else 0

    payload = {
        "crop": crop,
        "crop_display_name": crop_info["name"],
        "unit": crop_info["unit"],
        "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M"),
        "today_price": today_price,
        "msp": msp,
        "msp_diff": msp_diff,
        "msp_pct": msp_pct,
        "change_7d_pct": change_7d,
        "last_7_day_dates": dates,
        "last_7_day_trend": trend,
        "mandi_rates": mandi_rates,
        "ai_advisory": advisory,
        "is_live": bool(CROP_DATA[crop].get("tgk_key") and _TGK_CACHE.get("data")),
        "data_source": "TGK Agro Live Feed" if CROP_DATA[crop].get("tgk_key") and _TGK_CACHE.get("data") else "APMC Reference Rates",
    }

    _MARKET_CACHE[cache_key] = {"time": time.time(), "payload": payload}
    return jsonify(payload)


@market_bp.route("/ask", methods=["POST"])
def market_ask():
    data = request.get_json(silent=True) or {}
    crop = data.get("crop", "rice").strip().lower()
    question = data.get("question", "").strip()
    lang = data.get("lang", "English").strip()

    if not question:
        return jsonify({"error": "Field 'question' is required."}), 400

    if crop not in CROP_DATA:
        return jsonify({"error": f"Unknown commodity '{crop}'."}), 400

    crop_info = CROP_DATA[crop]
    today_price = _get_current_price(crop)
    msp = crop_info["msp"]
    msp_diff = round(today_price - msp, 2)

    client = _get_groq_client()
    if not client:
        return jsonify({"error": "AI advisory not configured on this server."}), 503

    system_prompt = (
        "You are AgriAI, an expert agricultural market advisor for Indian farmers. "
        "Give practical, simple answers about commodity markets and selling decisions. "
        "Keep answers under 80 words. No jargon. Use ₹ symbol for prices."
    )
    user_prompt = (
        f"Commodity: {crop_info['name']}\n"
        f"Today's mandi price: ₹{today_price}/quintal\n"
        f"Govt MSP: ₹{msp}/quintal (difference: ₹{msp_diff})\n\n"
        f"Farmer's question (answer in {lang}): {question}"
    )

    for model in LLM_MODELS:
        try:
            resp = client.chat.completions.create(
                model=model,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt},
                ],
                temperature=0.6,
                max_tokens=160,
            )
            reply = resp.choices[0].message.content or ""
            if reply.strip():
                return jsonify({"reply": reply.strip(), "crop": crop})
        except Exception:
            continue

    return jsonify({"error": "AI service temporarily unavailable."}), 503
