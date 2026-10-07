import httpx
import logging
from typing import Dict, Any
from datetime import datetime, timedelta

logger = logging.getLogger("ner_weather")

class WeatherService:
    def __init__(self):
        self.cache: Dict[str, Dict[str, Any]] = {}
        self.cache_ttl = timedelta(minutes=30)
        
    async def get_weather(self, lat: float, lng: float) -> Dict[str, Any]:
        cache_key = f"{round(lat, 2)}_{round(lng, 2)}"
        now = datetime.now()
        
        if cache_key in self.cache:
            entry = self.cache[cache_key]
            if now - entry["timestamp"] < self.cache_ttl:
                return entry["data"]
                
        url = "https://api.open-meteo.com/v1/forecast"
        params = {
            "latitude": lat,
            "longitude": lng,
            "current": "temperature_2m,precipitation,wind_speed_10m",
            "daily": "precipitation_sum",
            "past_days": 3,
            "timezone": "auto"
        }
        
        try:
            async with httpx.AsyncClient(timeout=4.0) as client:
                res = await client.get(url, params=params)
                if res.status_code == 200:
                    data = res.json()
                    current = data.get("current", {})
                    daily = data.get("daily", {})
                    
                    precip_current = float(current.get("precipitation", 0.0))
                    daily_sums = daily.get("precipitation_sum", [0.0, 0.0, 0.0, 0.0])
                    precip_72h = float(sum(daily_sums[:3])) if daily_sums else precip_current * 2.5
                    
                    result = {
                        "temperature_c": current.get("temperature_2m", 21.0),
                        "precipitation_24h_mm": precip_current + (daily_sums[-1] if daily_sums else 0.0),
                        "precipitation_72h_accumulated_mm": precip_72h,
                        "wind_speed_kmh": current.get("wind_speed_10m", 12.0),
                        "source": "Open-Meteo Live API"
                    }
                    
                    self.cache[cache_key] = {"timestamp": now, "data": result}
                    return result
        except Exception as e:
            logger.warning(f"Could not reach Open-Meteo for ({lat}, {lng}): {e}. Using regional climatic baseline.")
            
        # Regional realistic fallback based on NER coordinates
        # Areas in South Meghalaya / South Assam / Arunachal have higher baseline monsoon precipitation
        is_high_rainfall_zone = (25.0 <= lat <= 27.5 and 91.0 <= lng <= 93.5)
        fallback_data = {
            "temperature_c": 19.5,
            "precipitation_24h_mm": 45.0 if is_high_rainfall_zone else 12.0,
            "precipitation_72h_accumulated_mm": 110.0 if is_high_rainfall_zone else 35.0,
            "wind_speed_kmh": 14.5,
            "source": "NER Climatology Baseline"
        }
        return fallback_data

weather_service = WeatherService()
