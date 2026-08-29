import os
import json
import joblib
import numpy as np
import pandas as pd
from flask import Blueprint, request, jsonify
from models_db import db, PredictionHistory

crop_bp = Blueprint("crop_recommend", __name__)

MODEL_PATH = os.path.join(os.path.dirname(__file__), "..", "models", "crop_model.joblib")
model_bundle = None
if os.path.exists(MODEL_PATH):
    try:
        model_bundle = joblib.load(MODEL_PATH)
    except Exception as err:
        print("Warning: Could not load crop_model.joblib, using fallback engine:", err)


def get_user_id_from_header():
    auth_header = request.headers.get("Authorization", "")
    if auth_header.startswith("Bearer agriai_token_"):
        try:
            return int(auth_header.replace("Bearer agriai_token_", "").strip())
        except (ValueError, TypeError):
            return None
    return None


def rule_based_fallback(nitrogen, phosphorus, potassium, temperature, humidity, ph, rainfall):
    if rainfall > 200 and temperature > 20:
        return [
            {"crop": "rice", "probability": 85.0, "rank": 1},
            {"crop": "jute", "probability": 10.0, "rank": 2},
            {"crop": "coffee", "probability": 5.0, "rank": 3},
        ]
    if temperature < 20 and rainfall < 100:
        return [
            {"crop": "wheat", "probability": 80.0, "rank": 1},
            {"crop": "chickpea", "probability": 12.0, "rank": 2},
            {"crop": "lentil", "probability": 8.0, "rank": 3},
        ]
    if ph < 5.5:
        return [
            {"crop": "tea", "probability": 75.0, "rank": 1},
            {"crop": "coffee", "probability": 15.0, "rank": 2},
            {"crop": "rubber", "probability": 10.0, "rank": 3},
        ]
    if potassium > 80 and phosphorus > 40:
        return [
            {"crop": "cotton", "probability": 78.0, "rank": 1},
            {"crop": "maize", "probability": 14.0, "rank": 2},
            {"crop": "blackgram", "probability": 8.0, "rank": 3},
        ]
    return [
        {"crop": "maize", "probability": 70.0, "rank": 1},
        {"crop": "mungbean", "probability": 18.0, "rank": 2},
        {"crop": "lentil", "probability": 12.0, "rank": 3},
    ]


@crop_bp.route("/recommend", methods=["POST"])
def recommend_crop():
    data = request.get_json(silent=True) or {}
    required = ["nitrogen", "phosphorus", "potassium", "temperature", "humidity", "ph", "rainfall"]
    missing = [f for f in required if f not in data]
    if missing:
        return jsonify({"error": f"Missing fields: {missing}"}), 400

    try:
        values = {f: float(data[f]) for f in required}
    except (ValueError, TypeError):
        return jsonify({"error": "All fields must be numeric."}), 400

    top_recommendations = []
    confidence = 0.0

    if model_bundle is not None:
        try:
            row = pd.DataFrame([{
                "N": values["nitrogen"],
                "P": values["phosphorus"],
                "K": values["potassium"],
                "temperature": values["temperature"],
                "humidity": values["humidity"],
                "ph": values["ph"],
                "rainfall": values["rainfall"],
            }])

            if isinstance(model_bundle, dict):
                clf = model_bundle.get("model")
                scaler = model_bundle.get("scaler")
                encoder = model_bundle.get("label_encoder")

                features = scaler.transform(row) if scaler is not None else row

                if hasattr(clf, "predict_proba"):
                    probs = clf.predict_proba(features)[0]
                    top_k = min(3, len(probs))
                    top_indices = np.argsort(probs)[::-1][:top_k]

                    for rank_idx, idx in enumerate(top_indices, start=1):
                        crop_name = str(encoder.inverse_transform([idx])[0]) if encoder is not None else str(clf.classes_[idx])
                        prob_pct = round(float(probs[idx]) * 100, 2)
                        top_recommendations.append({
                            "crop": crop_name,
                            "probability": prob_pct,
                            "rank": rank_idx,
                        })
                    prediction = top_recommendations[0]["crop"]
                    confidence = top_recommendations[0]["probability"]
                else:
                    raw_pred = clf.predict(features)
                    prediction = str(encoder.inverse_transform(raw_pred)[0]) if encoder is not None else str(raw_pred[0])
                    confidence = 100.0
                    top_recommendations = [{"crop": prediction, "probability": 100.0, "rank": 1}]
            else:
                if hasattr(model_bundle, "predict_proba"):
                    probs = model_bundle.predict_proba(row)[0]
                    top_k = min(3, len(probs))
                    top_indices = np.argsort(probs)[::-1][:top_k]
                    classes = getattr(model_bundle, "classes_", [str(i) for i in range(len(probs))])
                    for rank_idx, idx in enumerate(top_indices, start=1):
                        crop_name = str(classes[idx])
                        prob_pct = round(float(probs[idx]) * 100, 2)
                        top_recommendations.append({
                            "crop": crop_name,
                            "probability": prob_pct,
                            "rank": rank_idx,
                        })
                    prediction = top_recommendations[0]["crop"]
                    confidence = top_recommendations[0]["probability"]
                else:
                    prediction = str(model_bundle.predict(row)[0])
                    confidence = 100.0
                    top_recommendations = [{"crop": prediction, "probability": 100.0, "rank": 1}]

            source = "ml_model"
        except Exception as pred_err:
            print("Error during ML crop recommendation prediction, using fallback:", pred_err)
            top_recommendations = rule_based_fallback(**values)
            prediction = top_recommendations[0]["crop"]
            confidence = top_recommendations[0]["probability"]
            source = "rule_based_fallback"
    else:
        top_recommendations = rule_based_fallback(**values)
        prediction = top_recommendations[0]["crop"]
        confidence = top_recommendations[0]["probability"]
        source = "rule_based_fallback"

    res_payload = {
        "recommended_crop": prediction,
        "confidence": confidence,
        "top_recommendations": top_recommendations,
        "inputs_used": values,
    }

    user_id = get_user_id_from_header()
    try:
        log_entry = PredictionHistory(
            user_id=user_id,
            tool_type="crop_recommendation",
            input_data=json.dumps(values),
            result_data=json.dumps({
                "recommended_crop": prediction,
                "confidence": confidence,
                "top_recommendations": top_recommendations,
                "source": source
            }),
        )
        db.session.add(log_entry)
        db.session.commit()
    except Exception as err:
        db.session.rollback()
        print("Failed to save crop recommendation log:", err)

    return jsonify(res_payload)