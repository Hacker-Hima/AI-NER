import numpy as np
from app.ml.model_loader import get_models

def predict_segment_risk(
    precipitation_24h_mm: float,
    precipitation_72h_accumulated_mm: float,
    elevation_change_m: float,
    slope_gradient: float,
    road_vulnerability_index: float,
    cargo_weight_tonnes: float = 3.0
):
    models = get_models()
    
    # Fallback heuristic if models are not loaded
    if not models.classifier or not models.scaler or not models.regressor:
        # Heuristic calculation
        score = min(1.0, max(0.0, (
            (precipitation_24h_mm / 150.0) * 0.4 +
            (slope_gradient / 40.0) * 0.3 +
            road_vulnerability_index * 0.3
        )))
        risk_level = "CRITICAL" if score > 0.70 else "MODERATE" if score > 0.35 else "LOW"
        delay = int(score * 120 + cargo_weight_tonnes * 4)
        return {
            "disruption_probability": round(score, 3),
            "risk_level": risk_level,
            "expected_delay_mins": delay,
            "contributing_factors": ["Heuristic assessment (offline fallback)"]
        }
        
    features = np.array([[
        precipitation_24h_mm,
        precipitation_72h_accumulated_mm,
        elevation_change_m,
        slope_gradient,
        road_vulnerability_index,
        cargo_weight_tonnes
    ]])
    
    scaled_features = models.scaler.transform(features)
    
    # Predict probabilities for classes [0: Low, 1: Moderate, 2: Critical]
    proba = models.classifier.predict_proba(scaled_features)[0]
    predicted_delay = models.regressor.predict(scaled_features)[0]
    
    # Aggregate continuous risk index: (moderate*0.5 + critical*1.0)
    risk_score = (proba[1] * 0.5) + (proba[2] * 1.0) if len(proba) == 3 else proba[-1]
    risk_score = float(np.clip(risk_score, 0.0, 1.0))
    
    risk_level = "CRITICAL" if risk_score > 0.65 else "MODERATE" if risk_score > 0.30 else "LOW"
    
    factors = []
    if precipitation_24h_mm > 50:
        factors.append(f"Heavy 24h Rainfall ({precipitation_24h_mm:.1f} mm)")
    if precipitation_72h_accumulated_mm > 120:
        factors.append("Prolonged Slope Saturation (72h accumulation)")
    if slope_gradient > 25:
        factors.append(f"Steep Escarpment Grade ({slope_gradient:.1f}° slope)")
    if road_vulnerability_index > 0.6:
        factors.append("High Historical Landslide Frequency Zone")
    if not factors:
        factors.append("Favorable Weather & Stable Mountain Grade")
        
    return {
        "disruption_probability": round(risk_score, 3),
        "risk_level": risk_level,
        "expected_delay_mins": max(5, int(predicted_delay)),
        "contributing_factors": factors
    }
