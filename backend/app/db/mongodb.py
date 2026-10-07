from motor.motor_asyncio import AsyncIOMotorClient
import logging
from app.core.config import settings

logger = logging.getLogger("ner_db")

class MongoDB:
    client: AsyncIOMotorClient = None
    db = None

db = MongoDB()

async def connect_to_mongo():
    logger.info(f"Connecting to MongoDB at {settings.MONGO_URI}...")
    db.client = AsyncIOMotorClient(settings.MONGO_URI)
    db.db = db.client[settings.DATABASE_NAME]
    
    # Establish indexes across the 9 primary collections for NER LogiSense
    try:
        # 1. Users
        await db.db.users.create_index("email", unique=True)
        
        # 2. Vehicles
        await db.db.vehicles.create_index("registration_number", unique=True)
        await db.db.vehicles.create_index("status")
        
        # 3. Shipments
        await db.db.shipments.create_index("tracking_number", unique=True)
        await db.db.shipments.create_index("status")
        await db.db.shipments.create_index("priority")
        
        # 4. Routes
        await db.db.routes.create_index("shipment_id")
        
        # 5. Incidents (Geo-Index for proximity queries)
        await db.db.incidents.create_index([("location", "2dsphere")])
        await db.db.incidents.create_index("status")
        await db.db.incidents.create_index("category")
        
        # 6. Weather Observations
        await db.db.weather_data.create_index([("timestamp", -1)])
        await db.db.weather_data.create_index("location_name")
        
        # 7. GPS Tracking
        await db.db.gps_tracking.create_index([("vehicle_id", 1), ("timestamp", -1)])
        
        # 8. Alerts
        await db.db.alerts.create_index([("severity", 1), ("read", 1)])
        
        # 9. Risk Predictions
        await db.db.risk_predictions.create_index([("predicted_at", -1)])
        
        logger.info("Successfully connected to MongoDB and verified indexes across all 9 collections.")
    except Exception as e:
        logger.warning(f"Note on MongoDB indexes: {e}")

async def close_mongo_connection():
    if db.client:
        logger.info("Closing MongoDB connection...")
        db.client.close()
        logger.info("MongoDB connection closed.")

def get_database():
    return db.db
