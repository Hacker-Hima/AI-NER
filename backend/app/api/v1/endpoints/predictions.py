from fastapi import APIRouter, Query
from typing import List
from app.models.prediction import RiskPredictionRequest, RiskPredictionResponse, CorridorLiveStatus
from app.ml.feature_builder import predict_segment_risk
from app.services.weather_service import weather_service

router = APIRouter()

NER_CORRIDORS = [
    {
        "corridor_code": "NH-29",
        "corridor_name": "Dimapur - Kohima Highway",
        "state": "Nagaland",
        "start_point": "Dimapur (145m)",
        "end_point": "Kohima (1444m)",
        "coordinates": [25.75, 93.90],
        "slope_gradient": 32.0,
        "elevation_change_m": 1299.0,
        "road_vulnerability_index": 0.85
    },
    {
        "corridor_code": "NH-6",
        "corridor_name": "Shillong - Silchar Lifeline",
        "state": "Meghalaya / Assam",
        "start_point": "Shillong (1525m)",
        "end_point": "Silchar (35m)",
        "coordinates": [25.40, 92.40],
        "slope_gradient": 28.0,
        "elevation_change_m": 1490.0,
        "road_vulnerability_index": 0.78
    },
    {
        "corridor_code": "NH-13",
        "corridor_name": "Trans-Arunachal Highway (Bhalukpong - Tawang)",
        "state": "Arunachal Pradesh",
        "start_point": "Bhalukpong (213m)",
        "end_point": "Tawang (3048m)",
        "coordinates": [27.35, 92.20],
        "slope_gradient": 38.0,
        "elevation_change_m": 2835.0,
        "road_vulnerability_index": 0.90
    },
    {
        "corridor_code": "NH-10",
        "corridor_name": "Sevoke - Gangtok Teesta Valley Highway",
        "state": "Sikkim",
        "start_point": "Siliguri (122m)",
        "end_point": "Gangtok (1650m)",
        "coordinates": [27.15, 88.50],
        "slope_gradient": 35.0,
        "elevation_change_m": 1528.0,
        "road_vulnerability_index": 0.88
    },
    {
        "corridor_code": "NH-27",
        "corridor_name": "Guwahati - Nagaon East-West Bypass",
        "state": "Assam",
        "start_point": "Guwahati (55m)",
        "end_point": "Nagaon (60m)",
        "coordinates": [26.25, 92.30],
        "slope_gradient": 7.0,
        "elevation_change_m": 15.0,
        "road_vulnerability_index": 0.20
    },
    {
        "corridor_code": "NH-102",
        "corridor_name": "Imphal - Moreh Border Highway",
        "state": "Manipur",
        "start_point": "Imphal (786m)",
        "end_point": "Moreh (150m)",
        "coordinates": [24.45, 94.15],
        "slope_gradient": 22.0,
        "elevation_change_m": 636.0,
        "road_vulnerability_index": 0.65
    }
]

@router.post("/risk-score", response_model=RiskPredictionResponse)
async def predict_custom_risk(req: RiskPredictionRequest):
    result = predict_segment_risk(
        precipitation_24h_mm=req.precipitation_24h_mm,
        precipitation_72h_accumulated_mm=req.precipitation_72h_accumulated_mm,
        elevation_change_m=req.elevation_change_m,
        slope_gradient=req.slope_gradient,
        road_vulnerability_index=req.road_vulnerability_index,
        cargo_weight_tonnes=req.cargo_weight_tonnes
    )
    return RiskPredictionResponse(
        disruption_probability=result["disruption_probability"],
        risk_level=result["risk_level"],
        expected_delay_mins=result["expected_delay_mins"],
        contributing_factors=result["contributing_factors"],
        confidence_score=0.92
    )

@router.get("/corridors/live-risk", response_model=List[CorridorLiveStatus])
async def get_corridors_live_risk():
    results = []
    for c in NER_CORRIDORS:
        lat, lng = c["coordinates"]
        w = await weather_service.get_weather(lat, lng)
        
        pred = predict_segment_risk(
            precipitation_24h_mm=w.get("precipitation_24h_mm", 15.0),
            precipitation_72h_accumulated_mm=w.get("precipitation_72h_accumulated_mm", 40.0),
            elevation_change_m=c["elevation_change_m"],
            slope_gradient=c["slope_gradient"],
            road_vulnerability_index=c["road_vulnerability_index"],
            cargo_weight_tonnes=5.0
        )
        
        status = "BLOCKED" if pred["disruption_probability"] > 0.70 else "CAUTION" if pred["disruption_probability"] > 0.35 else "OPEN"
        
        results.append(CorridorLiveStatus(
            corridor_code=c["corridor_code"],
            corridor_name=c["corridor_name"],
            state=c["state"],
            start_point=c["start_point"],
            end_point=c["end_point"],
            coordinates=c["coordinates"],
            current_precipitation_mm=round(w.get("precipitation_24h_mm", 0.0), 1),
            risk_probability=pred["disruption_probability"],
            risk_level=pred["risk_level"],
            status=status
        ))
        
    return results

@router.get("/weather/live")
async def get_live_weather(lat: float = Query(26.1445), lng: float = Query(91.7362)):
    return await weather_service.get_weather(lat, lng)
