from fastapi import FastAPI, HTTPException, status, Depends
from fastapi.middleware.cors import CORSMiddleware
from config import settings
from database import user_collection, create_indexes
from models import UserRegisterSchema, UserLoginSchema
from auth import create_access_token, get_current_user, verify_google_token
from utils import hash_password, verify_password, get_ai_welcome_message

app = FastAPI(title="Auth API", version="1.0.0")

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify your frontend URLs
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup_event():
    """Initialize database indexes on startup"""
    await create_indexes()

@app.get("/health")
def health():
    return {
        "status": "ok",
        "google_clients_configured": len(settings.ALLOWED_CLIENT_IDS),
        "mongo_configured": bool(settings.MONGO_DETAILS)
    }

@app.post("/auth/google")
async def google_auth(payload: dict):
    """Authenticate user with Google OAuth token"""
    token = payload.get("id_token") or payload.get("idToken")
    if not token:
        raise HTTPException(400, "Missing id_token or idToken in request body")

    # Verify token and get user info
    info = verify_google_token(token)
    
    email = info.get("email")
    fullname = info.get("name", "User")
    google_id = info.get("sub")
    picture = info.get("picture", "")

    if not email:
        raise HTTPException(400, "Email not provided by Google")

    # Find or create user
    user = await user_collection.find_one({"email": email})
    
    if not user:
        # Create new user
        user_data = {
            "fullname": fullname,
            "email": email,
            "provider": "google",
            "google_id": google_id,
            "picture": picture
        }
        result = await user_collection.insert_one(user_data)
        user_data["_id"] = result.inserted_id
        
        access_token = create_access_token(data={"sub": email})
        
        return {
            "message": "Registration successful",
            "toast_content": f"Welcome to the platform, {fullname}! 👋",
            "access_token": access_token,
            "token_type": "bearer",
            "user": {
                "email": email,
                "fullname": fullname,
                "picture": picture
            }
        }
    else:
        # Existing user - update info if needed
        update_data = {}
        if user.get("fullname") != fullname:
            update_data["fullname"] = fullname
        if user.get("picture") != picture:
            update_data["picture"] = picture
            
        if update_data:
            await user_collection.update_one(
                {"email": email},
                {"$set": update_data}
            )
        
        access_token = create_access_token(data={"sub": email})
        
        return {
            "message": "Login successful",
            "toast_content": f"Welcome back, {fullname}! 👋",
            "access_token": access_token,
            "token_type": "bearer",
            "user": {
                "email": email,
                "fullname": fullname,
                "picture": picture
            }
        }

@app.post("/register", status_code=status.HTTP_201_CREATED)
async def register_user(user: UserRegisterSchema):
    """Register a new user with email/password"""
    if await user_collection.find_one({"email": user.email}):
        raise HTTPException(400, "Email already registered")

    data = user.dict()
    data.pop("confirm_password")
    data["password"] = hash_password(data["password"])
    data["provider"] = "email"
    
    await user_collection.insert_one(data)

    # Get AI welcome message
    ai_toast = await get_ai_welcome_message(user.fullname)

    access_token = create_access_token(data={"sub": user.email})

    return {
        "message": "Registration successful!",
        "toast_content": ai_toast,
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "email": user.email,
            "fullname": user.fullname
        }
    }

@app.post("/login")
async def login_user(user: UserLoginSchema):
    """Login user with email/password"""
    db_user = await user_collection.find_one({"email": user.email})
    
    if not db_user:
        raise HTTPException(401, "Invalid email or password")
    
    if db_user.get("provider") == "google":
        raise HTTPException(400, "This email is registered with Google. Please use Google Sign-In.")
    
    if not verify_password(user.password, db_user.get("password", "")):
        raise HTTPException(401, "Invalid email or password")
    
    access_token = create_access_token(data={"sub": user.email})
    
    return {
        "message": "Login successful",
        "toast_content": f"Welcome back, {db_user.get('fullname', 'User')}! 👋",
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "email": db_user.get("email"),
            "fullname": db_user.get("fullname", "User"),
            "picture": db_user.get("picture", "")
        }
    }

@app.get("/me")
async def get_me(current_user = Depends(get_current_user)):
    """Get current user information (protected route)"""
    return {
        "email": current_user.get("email"),
        "fullname": current_user.get("fullname", "User"),
        "picture": current_user.get("picture", ""),
        "provider": current_user.get("provider", "email")
    }

@app.post("/logout")
async def logout(current_user = Depends(get_current_user)):
    """Logout user (client should delete the token)"""
    return {
        "message": "Logged out successfully"
    }