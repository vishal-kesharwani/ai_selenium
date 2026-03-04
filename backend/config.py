"""
Backend Configuration — Single source of truth for all settings.
Uses environment variables with sensible defaults.
"""
import os
from dotenv import load_dotenv

load_dotenv()

# ─────────────────────────────────────────────
# Directory Constants (absolute paths)
# ─────────────────────────────────────────────
BASE_DIR     = os.path.abspath(os.path.dirname(__file__))
PROJECT_DIR  = os.path.dirname(BASE_DIR)
STORAGE_DIR  = os.path.join(PROJECT_DIR, 'storage')
UPLOADS_DIR  = os.path.join(STORAGE_DIR, 'uploads')
REPORTS_DIR  = os.path.join(STORAGE_DIR, 'reports')
SCREENSHOTS_DIR = os.path.join(STORAGE_DIR, 'screenshots')

ALLOWED_EXTENSIONS = {'txt', 'pdf', 'png', 'jpg', 'jpeg', 'gif', 'csv', 'json'}

CORS_ORIGINS = [
    "http://localhost:5173",
    "http://localhost:5174",
    "http://localhost:5175",
    "http://localhost:5176",
    "http://localhost:5177",
    "http://localhost:5178",
    "http://localhost:5179",
    "http://localhost:5180",
]

# ─────────────────────────────────────────────
# Flask Config classes
# ─────────────────────────────────────────────
class Config:
    """Base configuration."""
    DEBUG   = False
    TESTING = False

    MONGO_URI      = os.getenv('MONGO_URI', 'mongodb://localhost:27017/ai_selenium')
    JWT_SECRET_KEY = os.getenv('JWT_SECRET', 'your-secret-key')

    MAX_CONTENT_LENGTH = 50 * 1024 * 1024   # 50 MB
    UPLOAD_FOLDER = UPLOADS_DIR


class DevelopmentConfig(Config):
    DEBUG = True


class ProductionConfig(Config):
    DEBUG = False


class TestingConfig(Config):
    TESTING  = True
    MONGO_URI = 'mongodb://localhost:27017/ai_selenium_test'


config = {
    'development': DevelopmentConfig,
    'production':  ProductionConfig,
    'testing':     TestingConfig,
    'default':     DevelopmentConfig,
}
