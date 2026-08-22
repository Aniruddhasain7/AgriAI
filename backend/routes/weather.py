import time
import requests
from flask import Blueprint, request, jsonify

weather_bp = Blueprint("weather", __name__)
OPEN_METEO_URL = "https://api.open-meteo.com/v1/forecast"

_WEATHER_CACHE = {}
CACHE_TTL_SECONDS = 900

REQUEST_HEADERS = {
    "User-Agent": "AgriAI-SmartFarming/1.0 (https://agri-ai-5.vercel.app)",
    "Accept": "application/json",
}


def get_cache_key(lat: float, lon: float) -> str:
    return f"{round(lat, 2):.2f}_{round(lon, 2):.2f}"


def get_spraying_window(temp_c: float, precip_mm: float, wind_kph: float, humidity: float):
    if precip_mm > 1.0 or wind_kph > 20.0:
        return {
            "status": "Avoid",
            "badge": "Risk of Drift & Wash-off",
            "color": "danger",
            "reason": "Rainfall or high winds will cause pesticide wash-off and chemical drift."
        }
    if temp_c > 32.0 or wind_kph > 12.0 or humidity > 85.0:
        return {
            "status": "Marginal",
            "badge": "Early Morning Only",
            "color": "warning",
            "reason": "Spray only during early morning (6-8 AM) before temperature rises and wind picks up."
        }
    return {
        "status": "Optimal",
        "badge": "Favorable Spraying Window",
        "color": "success",
        "reason": "Low wind, moderate humidity, and dry canopy provide maximum absorption efficiency."
    }


def build_farming_advice(temp_c: float, precip_mm: float, wind_kph: float, humidity_percent: float):
    advice = []
    
    if precip_mm > 5.0:
        advice.append("Heavy rain forecasted — immediately pause pesticide, herbicide, and top-dress fertilizer spraying to prevent nutrient runoff.")
    elif precip_mm > 0.5:
        advice.append("Light rain expected — delay chemical foliar applications until crop foliage is completely dry.")
    else:
        advice.append("Dry canopy conditions — safe window for foliar feeding and standard fungicide sprays.")

    if precip_mm > 10.0:
        advice.append("Abundant rainfall — suspend all irrigation systems and ensure drainage channels are clear to prevent root rot.")
    elif precip_mm == 0 and humidity_percent < 40.0:
        advice.append("Low humidity & high evapotranspiration — apply drip or furrow irrigation, especially for shallow-rooted horticulture crops.")
    elif temp_c > 32.0:
        advice.append("High ambient temperature — schedule irrigation during early morning or dusk to minimize evaporation losses.")
    else:
        advice.append("Moisture levels stable — inspect topsoil (5 cm depth) before scheduling supplemental watering.")

    if wind_kph > 30.0:
        advice.append("Strong wind gusts (>30 km/h) — avoid high-pressure spraying, stake tall standing crops (banana, maize, papaya), and secure greenhouse covers.")
    elif wind_kph > 18.0:
        advice.append("Moderate breeze — monitor spray droplet drift; calibrate nozzle pressure for coarse droplets.")

    if temp_c > 36.0:
        advice.append("Severe heat wave warning — provide shade netting for nurseries and consider light sprinkler misting to lower crop canopy temperature.")
    elif temp_c < 10.0:
        advice.append("Cold night risk — protect young seedlings with plastic mulch or floating row covers against frost stress.")

    if precip_mm > 15.0:
        advice.append("Soil saturation alert — avoid operating heavy tractors or harvesters to prevent soil compaction and rutting.")
    else:
        advice.append("Soil trafficability is good — optimal conditions for weeding, tilling, inter-cultivation, and harvesting.")

    return advice


def generate_fallback_weather(lat: float, lon: float):
    is_tropical = abs(lat) < 25.0
    temp = 28.0 if is_tropical else 22.0
    humidity = 68.0 if is_tropical else 55.0
    wind = 8.5
    precip = 0.0

    return {
        "location": {"lat": lat, "lon": lon},
        "current_conditions": {
            "temperature_c": temp,
            "humidity_percent": humidity,
            "precipitation_mm": precip,
            "wind_speed_kph": wind,
        },
        "forecast_3_day": {
            "time": ["Today", "Tomorrow", "Day 3"],
            "temperature_2m_max": [temp + 2, temp + 3, temp + 1],
            "temperature_2m_min": [temp - 5, temp - 4, temp - 6],
            "precipitation_sum": [0.0, 0.0, 0.2],
        },
        "spraying_window": get_spraying_window(temp, precip, wind, humidity),
        "farming_advice": build_farming_advice(temp, precip, wind, humidity),
        "is_fallback": True,
        "notice": "Serving regional agronomic baseline (upstream meteorology provider rate limit active).",
    }


@weather_bp.route("/advice", methods=["GET"])
def weather_advice():
    try:
        lat = float(request.args.get("lat", ""))
        lon = float(request.args.get("lon", ""))
    except (ValueError, TypeError):
        return jsonify({"error": "Provide valid numeric 'lat' and 'lon' query parameters."}), 400

    cache_key = get_cache_key(lat, lon)
    now = time.time()

    if cache_key in _WEATHER_CACHE:
        entry = _WEATHER_CACHE[cache_key]
        if now - entry["timestamp"] < CACHE_TTL_SECONDS:
            cached_data = dict(entry["data"])
            cached_data["is_cached"] = True
            return jsonify(cached_data)

    params = {
        "latitude": lat,
        "longitude": lon,
        "current": "temperature_2m,relative_humidity_2m,precipitation,wind_speed_10m,weather_code",
        "daily": "precipitation_sum,temperature_2m_max,temperature_2m_min,weather_code",
        "forecast_days": 3,
        "timezone": "auto",
    }

    try:
        resp = requests.get(OPEN_METEO_URL, params=params, headers=REQUEST_HEADERS, timeout=7)
        if resp.status_code == 429:
            fallback = generate_fallback_weather(lat, lon)
            return jsonify(fallback)

        resp.raise_for_status()
        data = resp.json()

        current = data.get("current", {})
        temp_c = float(current.get("temperature_2m", 25.0))
        precip = float(current.get("precipitation", 0.0))
        wind = float(current.get("wind_speed_10m", 5.0))
        humidity = float(current.get("relative_humidity_2m", 60.0))

        response_payload = {
            "location": {"lat": lat, "lon": lon},
            "current_conditions": {
                "temperature_c": round(temp_c, 1),
                "humidity_percent": round(humidity, 1),
                "precipitation_mm": round(precip, 2),
                "wind_speed_kph": round(wind, 1),
                "weather_code": current.get("weather_code", 0),
            },
            "forecast_3_day": data.get("daily", {}),
            "spraying_window": get_spraying_window(temp_c, precip, wind, humidity),
            "farming_advice": build_farming_advice(temp_c, precip, wind, humidity),
            "is_cached": False,
        }

        _WEATHER_CACHE[cache_key] = {
            "timestamp": now,
            "data": response_payload,
        }

        return jsonify(response_payload)

    except requests.RequestException as e:
        fallback = generate_fallback_weather(lat, lon)
        fallback["error_context"] = str(e)
        return jsonify(fallback)