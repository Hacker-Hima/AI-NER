import os
import joblib
import logging

logger = logging.getLogger("ner_ml")

class MLModelStore:
    classifier = None
    regressor = None
    scaler = None

model_store = MLModelStore()

def load_ml_artifacts():
    base_dir = os.path.dirname(__file__)
    artifact_dir = os.path.join(base_dir, "artifacts")
    
    clf_path = os.path.join(artifact_dir, "landslide_risk_model.joblib")
    reg_path = os.path.join(artifact_dir, "delay_regressor.joblib")
    scaler_path = os.path.join(artifact_dir, "scaler.joblib")
    
    try:
        if os.path.exists(clf_path) and os.path.exists(reg_path) and os.path.exists(scaler_path):
            model_store.classifier = joblib.load(clf_path)
            model_store.regressor = joblib.load(reg_path)
            model_store.scaler = joblib.load(scaler_path)
            logger.info("ML Models and Scalers successfully loaded into memory.")
        else:
            logger.warning(f"ML Artifacts not found at {artifact_dir}. Please run data/train_models.py.")
    except Exception as e:
        logger.error(f"Error loading ML artifacts: {e}")

def get_models():
    return model_store
