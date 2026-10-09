from pydantic import BaseModel
from typing import List, Dict, Any, Optional

class RiskPredictionRequest(BaseModel):
    corridor_name: Optional[str] = "Custom Corridor"
    precipitation_24h_mm: float
    precipitation_72h_accumulated_mm: float
    elevation_change_m: float
    slope_gradient: float  # Degrees or scale (0-45)
    road_vulnerability_index: float  # 0.0 to 1.0 historical susceptibility
    cargo_weight_tonnes: float = 3.0

class RiskPredictionResponse(BaseModel):
    disruption_probability: float  # 0.0 to 1.0
    risk_level: str  # "LOW", "MODERATE", "CRITICAL"
    expected_delay_mins: int
    contributing_factors: List[str]
    confidence_score: float

class CorridorLiveStatus(BaseModel):
    corridor_code: str
    corridor_name: str
    state: str
    start_point: str
    end_point: str
    coordinates: List[float]  # [lat, lng]
    current_precipitation_mm: float
    risk_probability: float
    risk_level: str
    status: str  # "OPEN", "CAUTION", "BLOCKED"
