from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import logging

from app.core.config import settings
from app.db.mongodb import connect_to_mongo, close_mongo_connection
from app.ml.model_loader import load_ml_artifacts
from app.api.v1.router import api_router

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(name)s: %(message)s")
logger = logging.getLogger("ner_main")

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    logger.info("Initializing NER Platform services...")
    await connect_to_mongo()
    load_ml_artifacts()
    logger.info("NER Platform ready to serve traffic.")
    yield
    # Shutdown
    logger.info("Shutting down NER Platform...")
    await close_mongo_connection()

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Educational prototype inspired by SIH: AI-Based Smart Logistics and Accessibility Intelligence Platform for the North Eastern Region.",
    version="1.0.0",
    lifespan=lifespan
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Allow all for local student prototyping flexibility
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix=settings.API_V1_STR)

@app.get("/", tags=["Health Check"])
async def root():
    return {
        "status": "healthy",
        "project": settings.PROJECT_NAME,
        "disclaimer": "Academic & educational prototype for demonstration purposes only. Not for real emergency dispatch.",
        "docs_url": "/docs",
        "api_v1": settings.API_V1_STR
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
