import sys
import logging
from app.services.ai_models_service import AIModelsService

# Setup debug logger
logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("AURA_VERIFY")

def main():
    logger.info("Initializing AURANEXUS AI verification test harness...")
    
    # Initialize service
    try:
        service = AIModelsService()
        logger.info("AI Model Service class loaded successfully.")
    except Exception as e:
        logger.critical(f"Failed to instantiate AIModelsService: {e}")
        sys.exit(1)
        
    dummy_image = b"\xff\xd8\xff" + b"\x00" * 100 # Minimal simulated JPEG buffer
    dummy_audio = b"RIFF" + b"\x00" * 200 # Minimal simulated WAV sound buffer

    # Test 1: Plant Disease classifier
    logger.info("Executing Test 1: Plant Disease Classification...")
    try:
        res = service.detect_plant_disease(dummy_image)
        logger.info(f"Test 1 PASSED: {res}")
    except Exception as e:
        logger.error(f"Test 1 FAILED: {e}")

    # Test 2: Object Detection YOLOv8
    logger.info("Executing Test 2: YOLOv8 Object Detection...")
    try:
        res = service.detect_objects(dummy_image)
        logger.info(f"Test 2 PASSED: {res}")
    except Exception as e:
        logger.error(f"Test 2 FAILED: {e}")

    # Test 3: Speech command Whisper Tiny
    logger.info("Executing Test 3: OpenAI Whisper transcription...")
    try:
        res = service.speech_to_text(dummy_audio)
        logger.info(f"Test 3 PASSED: {res}")
    except Exception as e:
        logger.error(f"Test 3 FAILED: {e}")

    # Test 4: Text to Speech
    logger.info("Executing Test 4: Audio WAV TTS synthesis...")
    try:
        res = service.speak_text("Destination reached")
        logger.info(f"Test 4 PASSED: Generated {len(res)} audio bytes.")
    except Exception as e:
        logger.error(f"Test 4 FAILED: {e}")

    # Test 5: Grounding DINO Landmark Navigation
    logger.info("Executing Test 5: Navigation Vision...")
    try:
        res = service.navigation_vision(dummy_image)
        logger.info(f"Test 5 PASSED: {res}")
    except Exception as e:
        logger.error(f"Test 5 FAILED: {e}")

    # Test 6: Scikit-Learn Custom Random Forest Telemetry Engine
    logger.info("Executing Test 6: Custom Random Forest Model...")
    try:
        res = service.analyze_environment(temp=32.0, humidity=68.0, soil_moisture=15.0)
        logger.info(f"Test 6 PASSED: {res}")
    except Exception as e:
        logger.error(f"Test 6 FAILED: {e}")

    logger.info("Verification test suite finished.")

if __name__ == "__main__":
    main()
