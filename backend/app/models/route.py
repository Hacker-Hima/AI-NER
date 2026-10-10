from pydantic import BaseModel
from typing import List, Dict, Any, Optional

class Coordinates(BaseModel):
    lat: float
    lng: float

class RouteCalculationRequest(BaseModel):
    origin: Coordinates
    destination: Coordinates
    avoid_hazards: bool = True
    cargo_weight_tonnes: Optional[float] = 3.0

class RouteSegmentRisk(BaseModel):
    segment_index: int
    name: str
    risk_score: float
    risk_level: str
    precipitation_mm: float
    slope_gradient: float
    reason: str

class RouteResponse(BaseModel):
    route_id: Optional[str] = None
    distance_km: float
    base_duration_mins: int
    predicted_duration_mins: int
    delay_delta_mins: int
    overall_risk_score: float
    risk_level: str
    geometry: List[List[float]]  # [[lng, lat], ...] GeoJSON coordinate pairs
    segments: List[RouteSegmentRisk]
    is_safe_alternative: bool = False
    notes: Optional[str] = None

class RouteComparisonResponse(BaseModel):
    standard_route: RouteResponse
    safe_alternative_route: Optional[RouteResponse] = None
    recommendation: str
