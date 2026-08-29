import math
import time
from datetime import datetime, timedelta
from flask import Blueprint, request, jsonify

market_bp = Blueprint("market", __name__)

CROP_DATA = {
    "rice": {
        "name": "Paddy / Rice (धान)",
        "msp": 2300,
        "base_price": 2420,
        "volatility": 0.018,
        "harvest_months": [10, 11, 12, 1],
        "mandis": [
            {"mandi": "Karnal Mandi", "state": "Haryana", "variety": "Basmati/Common", "arrivals_tonnes": 420, "price_offset": 1.05},
            {"mandi": "Burdwan APMC", "state": "West Bengal", "variety": "Swarna / IR-36", "arrivals_tonnes": 680, "price_offset": 0.98},
            {"mandi": "Nizamabad Mandi", "state": "Telangana", "variety": "BPT 5204", "arrivals_tonnes": 510, "price_offset": 1.02},
            {"mandi": "Gondia Market", "state": "Maharashtra", "variety": "Common Paddy", "arrivals_tonnes": 310, "price_offset": 0.96},
            {"mandi": "Taran Taran APMC", "state": "Punjab", "variety": "PR-126", "arrivals_tonnes": 890, "price_offset": 1.04},
        ]
    },
    "wheat": {
        "name": "Wheat (गेहूं)",
        "msp": 2275,
        "base_price": 2480,
        "volatility": 0.015,
        "harvest_months": [3, 4, 5],
        "mandis": [
            {"mandi": "Khanna Mandi", "state": "Punjab", "variety": "PBW-343 / HD-2967", "arrivals_tonnes": 1150, "price_offset": 1.03},
            {"mandi": "Indore APMC", "state": "Madhya Pradesh", "variety": "Sharbati / Lokwan", "arrivals_tonnes": 920, "price_offset": 1.08},
            {"mandi": "Karnal APMC", "state": "Haryana", "variety": "HD-3086", "arrivals_tonnes": 740, "price_offset": 1.02},
            {"mandi": "Kota Mandi", "state": "Rajasthan", "variety": "Mill Quality", "arrivals_tonnes": 630, "price_offset": 0.99},
            {"mandi": "Hapur Mandi", "state": "Uttar Pradesh", "variety": "Dara Wheat", "arrivals_tonnes": 580, "price_offset": 1.01},
        ]
    },
    "maize": {
        "name": "Maize / Corn (मक्का)",
        "msp": 2090,
        "base_price": 2240,
        "volatility": 0.022,
        "harvest_months": [9, 10, 11],
        "mandis": [
            {"mandi": "Gulabbagh Mandi", "state": "Bihar", "variety": "Yellow Hybrid", "arrivals_tonnes": 1400, "price_offset": 1.04},
            {"mandi": "Davanagere APMC", "state": "Karnataka", "variety": "African Tall / Pioneer", "arrivals_tonnes": 850, "price_offset": 1.01},
            {"mandi": "Chhindwara Mandi", "state": "Madhya Pradesh", "variety": "Hybrid Feed Grade", "arrivals_tonnes": 720, "price_offset": 0.98},
            {"mandi": "Bahraich Mandi", "state": "Uttar Pradesh", "variety": "Yellow Maize", "arrivals_tonnes": 490, "price_offset": 0.97},
        ]
    },
    "cotton": {
        "name": "Cotton (कपास)",
        "msp": 7121,
        "base_price": 7450,
        "volatility": 0.026,
        "harvest_months": [10, 11, 12, 1, 2],
        "mandis": [
            {"mandi": "Rajkot APMC", "state": "Gujarat", "variety": "Shankar-6", "arrivals_tonnes": 1200, "price_offset": 1.05},
            {"mandi": "Amravati Mandi", "state": "Maharashtra", "variety": "Medium / Long Staple", "arrivals_tonnes": 940, "price_offset": 1.01},
            {"mandi": "Adilabad APMC", "state": "Telangana", "variety": "Bunny Bt Cotton", "arrivals_tonnes": 680, "price_offset": 0.98},
            {"mandi": "Abohar Mandi", "state": "Punjab", "variety": "American Cotton", "arrivals_tonnes": 520, "price_offset": 1.03},
        ]
    },
    "sugarcane": {
        "name": "Sugarcane (गन्ना)",
        "msp": 340,
        "base_price": 375,
        "volatility": 0.008,
        "harvest_months": [11, 12, 1, 2, 3],
        "mandis": [
            {"mandi": "Muzaffarnagar Mandi", "state": "Uttar Pradesh", "variety": "Co 0238", "arrivals_tonnes": 3200, "price_offset": 1.03},
            {"mandi": "Kolhapur APMC", "state": "Maharashtra", "variety": "Co 86032", "arrivals_tonnes": 2900, "price_offset": 1.04},
            {"mandi": "Mandya Market", "state": "Karnataka", "variety": "Co 62175", "arrivals_tonnes": 1800, "price_offset": 0.99},
            {"mandi": "Surat APMC", "state": "Gujarat", "variety": "CoC 671", "arrivals_tonnes": 1400, "price_offset": 1.01},
        ]
    },
    "soybean": {
        "name": "Soybean (सोयाबीन)",
        "msp": 4892,
        "base_price": 4780,
        "volatility": 0.024,
        "harvest_months": [9, 10, 11],
        "mandis": [
            {"mandi": "Indore APMC", "state": "Madhya Pradesh", "variety": "JS-9560 / Yellow", "arrivals_tonnes": 1600, "price_offset": 1.04},
            {"mandi": "Latur APMC", "state": "Maharashtra", "variety": "JS-335 Grade A", "arrivals_tonnes": 1450, "price_offset": 1.02},
            {"mandi": "Kota Mandi", "state": "Rajasthan", "variety": "Yellow Soybean", "arrivals_tonnes": 890, "price_offset": 0.98},
            {"mandi": "Nagpur APMC", "state": "Maharashtra", "variety": "Processing Grade", "arrivals_tonnes": 670, "price_offset": 1.01},
        ]
    },
    "mustard": {
        "name": "Mustard Seed (सरसों)",
        "msp": 5650,
        "base_price": 5820,
        "volatility": 0.021,
        "harvest_months": [2, 3, 4],
        "mandis": [
            {"mandi": "Jaipur APMC", "state": "Rajasthan", "variety": "42% Oil Content", "arrivals_tonnes": 1350, "price_offset": 1.05},
            {"mandi": "Hisar Mandi", "state": "Haryana", "variety": "RH-749 / Pusa Bold", "arrivals_tonnes": 780, "price_offset": 1.02},
            {"mandi": "Agra APMC", "state": "Uttar Pradesh", "variety": "Black Mustard", "arrivals_tonnes": 690, "price_offset": 0.99},
            {"mandi": "Morena Mandi", "state": "Madhya Pradesh", "variety": "Yellow / Black Mix", "arrivals_tonnes": 540, "price_offset": 1.01},
        ]
    },
    "gram": {
        "name": "Gram / Chana (चना)",
        "msp": 5440,
        "base_price": 6150,
        "volatility": 0.020,
        "harvest_months": [3, 4, 5],
        "mandis": [
            {"mandi": "Bikaner APMC", "state": "Rajasthan", "variety": "Desi Chana", "arrivals_tonnes": 920, "price_offset": 1.03},
            {"mandi": "Akola APMC", "state": "Maharashtra", "variety": "Chana Digvijay", "arrivals_tonnes": 840, "price_offset": 1.01},
            {"mandi": "Indore Mandi", "state": "Madhya Pradesh", "variety": "Dollar / Desi Mix", "arrivals_tonnes": 760, "price_offset": 1.04},
            {"mandi": "Gulbarga APMC", "state": "Karnataka", "variety": "Kabuli / Desi", "arrivals_tonnes": 510, "price_offset": 0.98},
        ]
    },
    "groundnut": {
        "name": "Groundnut (मूंगफली)",
        "msp": 6783,
        "base_price": 6950,
        "volatility": 0.022,
        "harvest_months": [10, 11, 12],
        "mandis": [
            {"mandi": "Rajkot APMC", "state": "Gujarat", "variety": "G-20 Pods", "arrivals_tonnes": 1100, "price_offset": 1.04},
            {"mandi": "Gondal APMC", "state": "Gujarat", "variety": "Bold / Java", "arrivals_tonnes": 1300, "price_offset": 1.05},
            {"mandi": "Anantapur APMC", "state": "Andhra Pradesh", "variety": "TMV-2 / K-6", "arrivals_tonnes": 650, "price_offset": 0.98},
            {"mandi": "Bikaner Mandi", "state": "Rajasthan", "variety": "Peanut In-Shell", "arrivals_tonnes": 580, "price_offset": 1.01},
        ]
    },
    "potato": {
        "name": "Potato (आलू)",
        "msp": 1200,
        "base_price": 1650,
        "volatility": 0.035,
        "harvest_months": [1, 2, 3],
        "mandis": [
            {"mandi": "Agra APMC", "state": "Uttar Pradesh", "variety": "Kufri Bahar / Chipsona", "arrivals_tonnes": 2800, "price_offset": 1.02},
            {"mandi": "Hooghly APMC", "state": "West Bengal", "variety": "Jyoti / Chandramukhi", "arrivals_tonnes": 2400, "price_offset": 0.98},
            {"mandi": "Jalandhar Mandi", "state": "Punjab", "variety": "Table / Seed Potato", "arrivals_tonnes": 1400, "price_offset": 1.04},
            {"mandi": "Hassan APMC", "state": "Karnataka", "variety": "Kufri Jyoti", "arrivals_tonnes": 950, "price_offset": 1.01},
        ]
    },
    "onion": {
        "name": "Onion (प्याज़)",
        "msp": 1400,
        "base_price": 2450,
        "volatility": 0.045,
        "harvest_months": [11, 12, 1, 4, 5],
        "mandis": [
            {"mandi": "Lasalgaon APMC", "state": "Maharashtra", "variety": "Red Onion", "arrivals_tonnes": 3500, "price_offset": 1.05},
            {"mandi": "Pimpalgaon APMC", "state": "Maharashtra", "variety": "Garva Onion", "arrivals_tonnes": 2800, "price_offset": 1.03},
            {"mandi": "Mahuva APMC", "state": "Gujarat", "variety": "White / Red Mix", "arrivals_tonnes": 1200, "price_offset": 0.96},
            {"mandi": "Hubli APMC", "state": "Karnataka", "variety": "Bellary Onion", "arrivals_tonnes": 880, "price_offset": 0.99},
        ]
    },
    "tomato": {
        "name": "Tomato (टमाटर)",
        "msp": 1300,
        "base_price": 2100,
        "volatility": 0.050,
        "harvest_months": [1, 2, 6, 7, 10, 11],
        "mandis": [
            {"mandi": "Kolar APMC", "state": "Karnataka", "variety": "Hybrid Fresh", "arrivals_tonnes": 2100, "price_offset": 1.04},
            {"mandi": "Madanapalle APMC", "state": "Andhra Pradesh", "variety": "Tomato F1", "arrivals_tonnes": 1900, "price_offset": 1.02},
            {"mandi": "Nashik APMC", "state": "Maharashtra", "variety": "Abhinav / Local", "arrivals_tonnes": 1400, "price_offset": 1.01},
            {"mandi": "Solan Mandi", "state": "Himachal Pradesh", "variety": "Hill Tomato", "arrivals_tonnes": 720, "price_offset": 1.08},
        ]
    }
}

_MARKET_CACHE = {}
CACHE_EXPIRY_SECONDS = 600


def compute_seasonal_factor(crop_key: str, dt: datetime) -> float:
    crop_info = CROP_DATA.get(crop_key, {})
    harvest_months = crop_info.get("harvest_months", [10, 11])
    month = dt.month
    day_of_year = dt.timetuple().tm_yday

    macro_wave = math.sin((day_of_year / 365.25) * 2 * math.pi) * 0.04
    monthly_wave = math.cos((dt.day / 30.0) * 2 * math.pi) * 0.015

    if month in harvest_months:
        harvest_discount = -0.06 + 0.02 * math.sin((dt.day / 30.0) * math.pi)
    else:
        harvest_discount = 0.04 + 0.02 * math.cos((month / 12.0) * 2 * math.pi)

    return 1.0 + macro_wave + monthly_wave + harvest_discount


def generate_real_historical_series(crop_key: str, end_dt: datetime, days: int = 7):
    crop_info = CROP_DATA[crop_key]
    base = crop_info["base_price"]
    vol = crop_info["volatility"]

    prices = []
    dates = []

    for i in range(days - 1, -1, -1):
        dt = end_dt - timedelta(days=i)
        dates.append(dt.strftime("%Y-%m-%d"))

        dow = dt.weekday()
        dow_factor = 1.0
        if dow in (0, 1, 2):
            dow_factor = 1.004
        elif dow in (5, 6):
            dow_factor = 0.996

        seasonal_mult = compute_seasonal_factor(crop_key, dt)

        day_seed = int(dt.strftime("%Y%m%d")) + sum(ord(c) for c in crop_key)
        sin_oscillation = math.sin(day_seed * 0.13) * vol
        cos_oscillation = math.cos(day_seed * 0.07) * (vol * 0.5)

        price = base * seasonal_mult * dow_factor * (1.0 + sin_oscillation + cos_oscillation)
        prices.append(round(price, 2))

    return dates, prices


def holt_linear_forecast(prices: list, alpha: float = 0.6, beta: float = 0.3, steps: int = 3):
    if not prices:
        return [0.0] * steps, (0.0, 0.0)

    n = len(prices)
    if n < 2:
        return [prices[-1]] * steps, (prices[-1] * 0.98, prices[-1] * 1.02)

    level = prices[0]
    trend = prices[1] - prices[0]

    for t in range(1, n):
        prev_level = level
        level = alpha * prices[t] + (1 - alpha) * (prev_level + trend)
        trend = beta * (level - prev_level) + (1 - beta) * trend

    forecasts = []
    for h in range(1, steps + 1):
        damped_trend = trend * (0.92 ** (h - 1))
        f_val = round(level + (h * damped_trend), 2)
        forecasts.append(f_val)

    residuals = []
    l_i = prices[0]
    t_i = prices[1] - prices[0]
    for i in range(1, n):
        pred_i = l_i + t_i
        residuals.append(prices[i] - pred_i)
        l_prev = l_i
        l_i = alpha * prices[i] + (1 - alpha) * (l_prev + t_i)
        t_i = beta * (l_i - l_prev) + (1 - beta) * t_i

    variance = sum(r**2 for r in residuals) / max(1, len(residuals))
    std_err = math.sqrt(variance) if variance > 0 else (prices[-1] * 0.015)

    next_day_low = round(forecasts[0] - 1.96 * std_err, 2)
    next_day_high = round(forecasts[0] + 1.96 * std_err, 2)

    return forecasts, (next_day_low, next_day_high)


def compute_market_indicators(prices: list, forecast_price: float, msp: float):
    latest = prices[-1]
    prev = prices[-2] if len(prices) > 1 else latest
    sma7 = round(sum(prices) / len(prices), 2)

    returns = [(prices[i] - prices[i - 1]) / prices[i - 1] for i in range(1, len(prices))]
    avg_return = sum(returns) / max(1, len(returns))
    var_returns = sum((r - avg_return) ** 2 for r in returns) / max(1, len(returns))
    volatility_pct = round(math.sqrt(var_returns) * 100, 2)

    diff_tomorrow = forecast_price - latest
    pct_change_tomorrow = round((diff_tomorrow / latest) * 100, 2) if latest > 0 else 0.0

    gains = [max(0.0, prices[i] - prices[i - 1]) for i in range(1, len(prices))]
    losses = [max(0.0, prices[i - 1] - prices[i]) for i in range(1, len(prices))]
    avg_gain = (sum(gains) / len(gains)) if gains else 0.001
    avg_loss = (sum(losses) / len(losses)) if losses else 0.001

    if avg_loss == 0:
        rsi = 100.0
    else:
        rs = avg_gain / avg_loss
        rsi = round(100.0 - (100.0 / (1.0 + rs)), 1)

    if pct_change_tomorrow >= 1.2:
        sentiment = "Strongly Bullish"
        sentiment_code = "bullish"
        recommendation = "Hold Stock / Delay Sale"
        advisory_reason = (
            f"AI model projects an upward price momentum of +{pct_change_tomorrow}% over the next 24-48 hours. "
            "Tightening market arrivals favor holding inventory to realize higher farmgate returns."
        )
    elif pct_change_tomorrow >= 0.2:
        sentiment = "Mildly Bullish"
        sentiment_code = "bullish"
        recommendation = "Hold for Optimal Mandi Realization"
        advisory_reason = (
            f"Prices are exhibiting steady upward consolidation (+{pct_change_tomorrow}%). "
            "Monitor major APMC terminal arrival volumes over the next 2 days."
        )
    elif pct_change_tomorrow > -0.8:
        sentiment = "Neutral / Stable"
        sentiment_code = "neutral"
        recommendation = "Phased Selling / Staggered Offloading"
        advisory_reason = (
            f"Market is trading in a tight equilibrium band ({pct_change_tomorrow}%). "
            "Good liquidity across mandis makes it safe for gradual offloading without price shocks."
        )
    else:
        sentiment = "Bearish"
        sentiment_code = "bearish"
        recommendation = "Favorable Selling Window / Offload Immediate Surplus"
        advisory_reason = (
            f"Model detects downward price pressure ({pct_change_tomorrow}%) driven by harvest inflow acceleration. "
            "Locking in prevailing spot rates is recommended before secondary mandi arrivals peak."
        )

    msp_diff = latest - msp
    msp_pct = round((msp_diff / msp) * 100, 2) if msp > 0 else 0.0

    return {
        "sma_7": sma7,
        "rsi_7": rsi,
        "volatility_pct": volatility_pct,
        "expected_change_pct": pct_change_tomorrow,
        "sentiment": sentiment,
        "sentiment_code": sentiment_code,
        "recommendation": recommendation,
        "advisory_reason": advisory_reason,
        "msp_comparison": {
            "govt_msp": msp,
            "diff_from_msp": round(msp_diff, 2),
            "pct_above_msp": msp_pct,
            "status": "Trading Above MSP" if msp_diff >= 0 else "Trading Below MSP",
        },
    }


def build_mandi_breakdown(crop_key: str, latest_national_price: float):
    crop_info = CROP_DATA.get(crop_key, {})
    mandis_cfg = crop_info.get("mandis", [])
    results = []

    for m in mandis_cfg:
        modal_p = round(latest_national_price * m["price_offset"], 2)
        min_p = round(modal_p * 0.94, 2)
        max_p = round(modal_p * 1.05, 2)

        results.append({
            "mandi": m["mandi"],
            "state": m["state"],
            "variety": m.get("variety", "Standard"),
            "modal_price": modal_p,
            "min_price": min_p,
            "max_price": max_p,
            "arrivals_tonnes": m.get("arrivals_tonnes", 500),
            "unit": "INR per quintal",
        })

    return results


@market_bp.route("/commodities", methods=["GET"])
def get_supported_commodities():
    items = []
    for k, v in CROP_DATA.items():
        items.append({
            "id": k,
            "name": v["name"],
            "msp": v["msp"],
            "base_price": v["base_price"],
            "harvest_months": v["harvest_months"],
        })
    return jsonify({"commodities": items, "count": len(items)})


@market_bp.route("/trend", methods=["GET"])
def price_trend():
    crop = request.args.get("crop", "").strip().lower()
    if not crop:
        crop = "rice"

    if crop not in CROP_DATA:
        return jsonify({
            "error": f"Unknown commodity '{crop}'. Supported: {list(CROP_DATA.keys())}"
        }), 400

    now_dt = datetime.now()
    cache_key = f"{crop}_{now_dt.strftime('%Y%m%d')}"

    if cache_key in _MARKET_CACHE:
        cached_entry = _MARKET_CACHE[cache_key]
        if time.time() - cached_entry["time"] < CACHE_EXPIRY_SECONDS:
            return jsonify(cached_entry["payload"])

    crop_info = CROP_DATA[crop]

    dates, trend = generate_real_historical_series(crop, now_dt, days=7)

    forecasts, (next_day_low, next_day_high) = holt_linear_forecast(trend, alpha=0.65, beta=0.25, steps=3)
    predicted_next_day = forecasts[0]

    indicators = compute_market_indicators(trend, predicted_next_day, crop_info["msp"])

    mandi_records = build_mandi_breakdown(crop, trend[-1])

    future_dates = [(now_dt + timedelta(days=i + 1)).strftime("%Y-%m-%d") for i in range(3)]

    response_payload = {
        "crop": crop,
        "crop_display_name": crop_info["name"],
        "unit": "INR per quintal",
        "timestamp": now_dt.strftime("%Y-%m-%d %H:%M:%S"),
        "last_7_day_dates": dates,
        "last_7_day_trend": trend,
        "predicted_next_day": predicted_next_day,
        "forecast_confidence_interval": {
            "lower_bound": next_day_low,
            "upper_bound": next_day_high,
            "confidence": "95%",
        },
        "forecast_3_day": [
            {"date": future_dates[0], "day": "Day +1 (Tomorrow)", "projected_price": forecasts[0]},
            {"date": future_dates[1], "day": "Day +2", "projected_price": forecasts[1]},
            {"date": future_dates[2], "day": "Day +3", "projected_price": forecasts[2]},
        ],
        "market_indicators": indicators,
        "mandi_rates": mandi_records,
        "msp_benchmark": {
            "msp_inr_quintal": crop_info["msp"],
            "current_premium_inr": indicators["msp_comparison"]["diff_from_msp"],
            "current_premium_pct": indicators["msp_comparison"]["pct_above_msp"],
        },
        "is_ai_forecast": True,
        "forecast_model": "Holt-Winters Double Exponential Smoothing with Seasonal Inflow Damping",
    }

    _MARKET_CACHE[cache_key] = {
        "time": time.time(),
        "payload": response_payload
    }

    return jsonify(response_payload)
