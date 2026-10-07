from fastapi import APIRouter, HTTPException
from app.models.route import RouteCalculationRequest, RouteComparisonResponse
from app.services.route_service import route_service
from app.db.mongodb import get_database

router = APIRouter()

@router.post("/calculate", response_model=RouteComparisonResponse)
async def calculate_route_options(req: RouteCalculationRequest):
    origin = (req.origin.lat, req.origin.lng)
    dest = (req.destination.lat, req.destination.lng)
    
    result = await route_service.calculate_routes(origin, dest)
    return RouteComparisonResponse(
        standard_route=result["standard_route"],
        safe_alternative_route=result["safe_alternative_route"],
        recommendation=result["recommendation"]
    )

@router.get("/shipment/{shipment_id}")
async def get_shipment_routes(shipment_id: str):
    db = get_database()
    if db is None:
        raise HTTPException(status_code=500, detail="Database connection unavailable")
        
    doc = await db.routes.find_one({"shipment_id": shipment_id})
    if not doc:
        # If not cached yet, lookup shipment and compute
        try:
            from bson import ObjectId
            s = await db.shipments.find_one({"_id": ObjectId(shipment_id)})
            if s:
                origin = (s["origin"]["lat"], s["origin"]["lng"])
                dest = (s["destination"]["lat"], s["destination"]["lng"])
                return await route_service.calculate_routes(origin, dest, s.get("weight_tonnes", 3.0))
        except Exception:
            pass
        raise HTTPException(status_code=404, detail="Route not found for this shipment")
        
    doc["id"] = str(doc["_id"])
    del doc["_id"]
    return doc
