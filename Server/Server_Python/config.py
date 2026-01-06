import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

class Settings:
    # Google OAuth
    GOOGLE_WEB_CLIENT_ID = os.environ.get("GOOGLE_CLIENT_ID", "")
    GOOGLE_ANDROID_CLIENT_ID = os.environ.get("GOOGLE_ANDROID_CLIENT_ID", "")
    
    # Collect all valid client IDs
    ALLOWED_CLIENT_IDS = []
    if GOOGLE_WEB_CLIENT_ID:
        ALLOWED_CLIENT_IDS.append(GOOGLE_WEB_CLIENT_ID)
    if GOOGLE_ANDROID_CLIENT_ID:
        ALLOWED_CLIENT_IDS.append(GOOGLE_ANDROID_CLIENT_ID)
    
    # Database
    MONGO_DETAILS = os.environ.get("MONGO_DETAILS", "")
    
    # External services
    NODE_SERVER_URL = os.environ.get("NODE_SERVER_URL", "")
    
    # JWT
    JWT_SECRET = os.environ.get("JWT_SECRET", "your-super-secret-jwt-key-change-in-production")
    JWT_ALGORITHM = "HS256"
    JWT_EXPIRATION_HOURS = 24

# Create global settings instance
settings = Settings()

# Validate configuration
if not settings.ALLOWED_CLIENT_IDS:
    raise RuntimeError("At least one Google Client ID must be set (GOOGLE_CLIENT_ID or GOOGLE_ANDROID_CLIENT_ID)")
if not settings.MONGO_DETAILS:
    raise RuntimeError("MONGO_DETAILS env var is missing")
if not settings.NODE_SERVER_URL:
    print("WARNING: NODE_SERVER_URL not set, AI welcome messages will be disabled")

# Print configuration
print("=" * 50)
print("Configuration loaded:")
print(f"GOOGLE_WEB_CLIENT_ID: {settings.GOOGLE_WEB_CLIENT_ID[:20]}..." if settings.GOOGLE_WEB_CLIENT_ID else "GOOGLE_WEB_CLIENT_ID: NOT SET")
print(f"GOOGLE_ANDROID_CLIENT_ID: {settings.GOOGLE_ANDROID_CLIENT_ID[:20]}..." if settings.GOOGLE_ANDROID_CLIENT_ID else "GOOGLE_ANDROID_CLIENT_ID: NOT SET")
print(f"Total allowed Client IDs: {len(settings.ALLOWED_CLIENT_IDS)}")
print(f"NODE_SERVER_URL: {settings.NODE_SERVER_URL}")
print(f"MONGO_DETAILS: {'SET' if settings.MONGO_DETAILS else 'NOT SET'}")
print(f"JWT_SECRET: {'SET' if settings.JWT_SECRET != 'your-super-secret-jwt-key-change-in-production' else 'USING DEFAULT (CHANGE IN PRODUCTION)'}")
print("=" * 50)