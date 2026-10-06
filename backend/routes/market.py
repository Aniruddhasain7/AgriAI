import os
import json
from datetime import datetime, timedelta
from flask import Blueprint, request, jsonify
import joblib
import pandas as pd
import numpy as np

market_bp = Blueprint("market", __name__)

_ML_CACHE = {"model": None, "metadata": None, "loaded": False}


def _get_ml_artifacts():
    if _ML_CACHE["loaded"]:
        return _ML_CACHE["model"], _ML_CACHE["metadata"]

    base_dir = os.path.dirname(__file__)
    model_path = os.path.abspath(os.path.join(base_dir, "..", "models", "market_forecast_model.joblib"))
    meta_path = os.path.abspath(os.path.join(base_dir, "..", "models", "market_metadata.json"))

    if os.path.exists(model_path):
        try:
            _ML_CACHE["model"] = joblib.load(model_path)
        except Exception as e:
            print(f"[Market ML] Error loading model: {e}")
            _ML_CACHE["model"] = None

    if os.path.exists(meta_path):
        try:
            with open(meta_path, "r", encoding="utf-8") as f:
                _ML_CACHE["metadata"] = json.load(f)
        except Exception as e:
            print(f"[Market ML] Error loading metadata: {e}")
            _ML_CACHE["metadata"] = None

    _ML_CACHE["loaded"] = True
    return _ML_CACHE["model"], _ML_CACHE["metadata"]


@market_bp.route("/commodities", methods=["GET"])
def get_commodities():
    model_artifact, _ = _get_ml_artifacts()
    if not model_artifact or "latest_state" not in model_artifact:
        return jsonify({"commodities": [], "count": 0})

    df = model_artifact["latest_state"]
    summary = df.groupby("Commodity").agg(
        modal_price=("Modal_Price", "mean"),
        markets_count=("Market", "nunique"),
        state=("State", "first")
    ).reset_index()

    commodities = [
        {
            "id": str(row["Commodity"]).strip().lower().replace(" ", "_"),
            "name": str(row["Commodity"]).strip(),
            "avg_modal_price": round(float(row["modal_price"]), 2),
            "markets_count": int(row["markets_count"]),
            "state": str(row.get("state", "India"))
        }
        for _, row in summary.iterrows()
        if pd.notnull(row["Commodity"]) and float(row["modal_price"]) > 0
    ]
    commodities.sort(key=lambda x: x["markets_count"], reverse=True)
    return jsonify({"commodities": commodities, "count": len(commodities)})


@market_bp.route("/mandis", methods=["GET"])
def get_mandis():
    crop = request.args.get("crop", "").strip()
    model_artifact, _ = _get_ml_artifacts()

    if not model_artifact or "latest_state" not in model_artifact or not crop:
        return jsonify({"mandis": [], "count": 0})

    df = model_artifact["latest_state"]
    matched = df[df["Commodity"].str.lower() == crop.lower()]
    if matched.empty:
        matched = df[df["Commodity"].str.lower().str.contains(crop.lower(), na=False)]

    if matched.empty:
        return jsonify({"mandis": [], "count": 0})

    mandis = [
        {
            "market": str(row["Market"]).strip(),
            "state": str(row["State"]).strip(),
            "district": str(row.get("District", "")).strip(),
            "modal_price": round(float(row["Modal_Price"]), 2)
        }
        for _, row in matched.drop_duplicates(subset=["Market"]).iterrows()
    ]
    mandis.sort(key=lambda x: x["modal_price"], reverse=True)
    return jsonify({"mandis": mandis, "count": len(mandis)})


@market_bp.route("/predict", methods=["GET", "POST"])
@market_bp.route("/trend", methods=["GET", "POST"])
@market_bp.route("/forecast", methods=["GET", "POST"])
def predict_price():
    data_json = request.get_json(silent=True) or {}
    crop = request.args.get("crop") or data_json.get("crop") or "Wheat"
    crop = str(crop).strip()

    mandi = request.args.get("mandi") or data_json.get("mandi") or ""
    mandi = str(mandi).strip()

    raw_period = request.args.get("period") or data_json.get("period") or 7
    try:
        period = int(raw_period)
        period = max(3, min(period, 30))
    except Exception:
        period = 7

    model_artifact, _ = _get_ml_artifacts()
    if not model_artifact or "latest_state" not in model_artifact:
        return jsonify({"error": "Market ML model data not loaded."}), 500

    df = model_artifact["latest_state"]
    models = model_artifact.get("models", {})
    features = model_artifact.get("features", [])

    matched = df[df["Commodity"].str.lower() == crop.lower()]
    if matched.empty:
        matched = df[df["Commodity"].str.lower().str.contains(crop.lower(), na=False)]
    if matched.empty:
        matched = df.head(10)

    selected_row = None
    if mandi:
        m_matched = matched[matched["Market"].str.lower() == mandi.lower()]
        if m_matched.empty:
            m_matched = matched[matched["Market"].str.lower().str.contains(mandi.lower(), na=False)]
        if not m_matched.empty:
            selected_row = m_matched.iloc[0].copy()

    if selected_row is None:
        selected_row = matched.iloc[0].copy()

    crop_name = str(selected_row["Commodity"]).strip()
    mandi_name = str(selected_row["Market"]).strip()
    state_name = str(selected_row["State"]).strip()
    modal_price = round(float(selected_row["Modal_Price"]), 2)

    today = datetime.now()
    selected_row["month"] = today.month
    selected_row["day_of_week"] = today.weekday()
    selected_row["day_of_month"] = today.day

    # Run ML Model to get relative multi-horizon price trajectory
    X = pd.DataFrame([selected_row[features]]) if features else None

    raw_preds = []
    if models and X is not None:
        for d in range(1, 8):
            if d in models:
                try:
                    val = float(models[d].predict(X)[0])
                    raw_preds.append(val)
                except Exception:
                    raw_preds.append(modal_price)
            else:
                raw_preds.append(modal_price)
    else:
        raw_preds = [modal_price] * 7

    # Scale the ML multi-horizon trend relative to the actual mandi modal price
    base_raw = raw_preds[0] if raw_preds and raw_preds[0] > 0 else 1.0
    relative_slopes = [((p - base_raw) / base_raw) * 0.45 for p in raw_preds]

    forecast_dates = []
    forecast_prices = []
    forecast_table = []
    prev_price = modal_price

    for day in range(1, period + 1):
        f_date = today + timedelta(days=day)
        date_str = f_date.strftime("%b %d")
        forecast_dates.append(date_str)

        if day <= 7:
            slope = relative_slopes[day - 1]
            pred_price = round(modal_price * (1.0 + slope), 2)
        else:
            slope_7 = relative_slopes[-1]
            extra_days = day - 7
            pred_price = round(modal_price * (1.0 + slope_7 + (slope_7 / 7.0) * extra_days), 2)

        forecast_prices.append(pred_price)

        # Dynamic confidence band
        spread = max(15.0, round(pred_price * (0.02 + 0.002 * day), 2))
        min_price = round(pred_price - spread, 2)
        max_price = round(pred_price + spread, 2)

        # Daily trend direction
        diff = round(pred_price - prev_price, 2)
        trend = "up" if diff > 2.0 else "down" if diff < -2.0 else "stable"

        forecast_table.append({
            "day_num": day,
            "day_label": f"Day {day}",
            "date": date_str,
            "full_date": f_date.strftime("%Y-%m-%d"),
            "predicted_price": pred_price,
            "min_expected_price": min_price,
            "max_expected_price": max_price,
            "trend": trend,
            "daily_change": diff
        })
        prev_price = pred_price

    peak_price = max(forecast_prices)
    peak_idx = forecast_prices.index(peak_price)
    peak_date = forecast_dates[peak_idx]
    peak_day_num = peak_idx + 1

    lowest_price = min(forecast_prices)
    gain_amount = round(peak_price - modal_price, 2)
    gain_pct = round(((peak_price - modal_price) / modal_price) * 100.0, 2) if modal_price > 0 else 0.0

    # Normal, practical AI recommendation
    if gain_pct >= 1.5:
        recommendation = "HOLD"
        recommendation_text = (
            f"Prices for {crop_name} are expected to rise by +{gain_pct}% (+₹{gain_amount}/qtl), "
            f"peaking around {peak_date} at ~₹{peak_price}/qtl. It is recommended to hold your produce for better returns."
        )
    elif gain_pct <= -1.5 or (forecast_prices[-1] - modal_price) < -15:
        recommendation = "SELL NOW"
        recommendation_text = (
            f"Prices for {crop_name} are projected to decline over the next {period} days. "
            f"Selling at today's rate of ₹{modal_price}/qtl is recommended to maximize your earnings."
        )
    else:
        recommendation = "MONITOR MARKET"
        recommendation_text = (
            f"Prices for {crop_name} are projected to remain relatively steady (within ±{abs(gain_pct)}%). "
            f"You can sell in stages or monitor daily market arrivals."
        )

    return jsonify({
        "crop": crop_name,
        "mandi": mandi_name,
        "state": state_name,
        "period": period,
        "current_price": modal_price,
        "forecast_price": peak_price,
        "peak_price": peak_price,
        "peak_date": peak_date,
        "peak_day": f"Day {peak_day_num}",
        "lowest_price": lowest_price,
        "expected_gain_amount": gain_amount,
        "expected_gain_pct": gain_pct,
        "recommendation": recommendation,
        "recommendation_text": recommendation_text,
        "forecast_dates": forecast_dates,
        "forecast_prices": forecast_prices,
        "forecast_table": forecast_table,
        "last_updated": today.strftime("%d %b %Y, %I:%M %p")
    })
