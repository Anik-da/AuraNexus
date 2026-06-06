import firebase_admin
from firebase_admin import credentials, firestore, storage
import logging
from app.core.config import settings

logger = logging.getLogger(__name__)

db = None
bucket = None
firebase_app = None

try:
    # Try initializing with default credentials or project options
    if not firebase_admin._apps:
        # If running locally without credentials, it might warn. Let's capture it.
        try:
            cred = credentials.ApplicationDefault()
            firebase_app = firebase_admin.initialize_app(cred, {
                'projectId': settings.FIREBASE_PROJECT_ID,
                'storageBucket': settings.FIREBASE_STORAGE_BUCKET
            })
            logger.info("Firebase Admin initialized successfully using Application Default Credentials.")
        except Exception:
            # Fallback to local init with project options for testing/development
            firebase_app = firebase_admin.initialize_app(options={
                'projectId': settings.FIREBASE_PROJECT_ID,
                'storageBucket': settings.FIREBASE_STORAGE_BUCKET
            })
            logger.warning("Firebase Admin initialized using fallback project options.")
            
    db = firestore.client()
    # Bucket initialization might fail if auth is missing.
    try:
        bucket = storage.bucket()
    except Exception as e:
        logger.warning(f"Firebase Storage bucket not initialized (missing credentials): {e}")

except Exception as e:
    logger.critical(f"Failed to initialize Firebase Admin SDK: {e}. Running with mock state.")
    db = None
    bucket = None
