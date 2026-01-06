import httpx
import bcrypt
from config import settings

def hash_password(password: str) -> str:
    """Hash a password using bcrypt"""
    password_bytes = password.encode('utf-8')
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(password_bytes, salt)
    return hashed.decode('utf-8')

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a password against its hash"""
    password_bytes = plain_password.encode('utf-8')
    hashed_bytes = hashed_password.encode('utf-8')
    return bcrypt.checkpw(password_bytes, hashed_bytes)

async def get_ai_welcome_message(fullname: str) -> str:
    """Get AI-generated welcome message from Node server"""
    default_message = f"Welcome, {fullname}!"
    
    if not settings.NODE_SERVER_URL:
        return default_message
    
    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{settings.NODE_SERVER_URL}/get-welcome-message",
                json={"fullname": fullname},
                timeout=5
            )
            if response.status_code == 200:
                return response.json().get("message", default_message)
    except Exception as e:
        print(f"Node server unreachable: {e}")
    
    return default_message