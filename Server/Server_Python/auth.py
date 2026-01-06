from datetime import datetime, timedelta
from typing import Optional
from fastapi import HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests
import jwt
from config import settings
from database import user_collection

security = HTTPBearer()

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    """Create JWT access token"""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(hours=settings.JWT_EXPIRATION_HOURS)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.JWT_SECRET, algorithm=settings.JWT_ALGORITHM)
    return encoded_jwt

def verify_token(token: str):
    """Verify JWT token"""
    try:
        payload = jwt.decode(token, settings.JWT_SECRET, algorithms=[settings.JWT_ALGORITHM])
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token has expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Get current authenticated user"""
    token = credentials.credentials
    payload = verify_token(token)
    email = payload.get("sub")
    if email is None:
        raise HTTPException(status_code=401, detail="Invalid authentication credentials")
    
    user = await user_collection.find_one({"email": email})
    if user is None:
        raise HTTPException(status_code=401, detail="User not found")
    
    return user

def verify_google_token(token: str) -> dict:
    """Verify Google OAuth token and return user info"""
    info = None
    last_error = None
    
    for client_id in settings.ALLOWED_CLIENT_IDS:
        try:
            info = id_token.verify_oauth2_token(
                token,
                google_requests.Request(),
                client_id
            )
            print(f"✓ Token verified successfully with client ID: {client_id[:20]}...")
            break
        except ValueError as e:
            last_error = e
            print(f"✗ Failed to verify with client ID {client_id[:20]}...: {e}")
            continue
    
    if info is None:
        print(f"Token validation failed for all {len(settings.ALLOWED_CLIENT_IDS)} client IDs")
        raise HTTPException(
            status_code=401, 
            detail="Invalid Google token. Please check your Google OAuth configuration."
        )
    
    return info