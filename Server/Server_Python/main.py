import os
import httpx
from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr, Field, validator
from motor.motor_asyncio import AsyncIOMotorClient
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests

GOOGLE_CLIENT_ID = os.environ["GOOGLE_CLIENT_ID"]
MONGO_DETAILS = os.environ["MONGO_DETAILS"]
NODE_SERVER_URL = os.environ["NODE_SERVER_URL"]
print("NODE_SERVER_URL =", NODE_SERVER_URL)


if not MONGO_DETAILS:
    raise RuntimeError("MONGO_DETAILS env var is missing")

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

client = AsyncIOMotorClient(MONGO_DETAILS)
database = client.registry_db
user_collection = database.get_collection("users")

class UserRegisterSchema(BaseModel):
    fullname: str = Field(..., min_length=2)
    email: EmailStr
    password: str = Field(..., min_length=6)
    confirm_password: str

    @validator("confirm_password")
    def passwords_match(cls, v, values):
        if values.get("password") != v:
            raise ValueError("passwords do not match")
        return v

@app.get("/health")
def health():
    return {"status": "ok"}

@app.post("/auth/google")
async def google_auth(payload: dict):
    token = payload.get("id_token")

    if not token:
        raise HTTPException(status_code=400, detail="Missing id_token")

    try:
        info = id_token.verify_oauth2_token(
            token,
            google_requests.Request(),
            GOOGLE_CLIENT_ID
        )
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid Google token")

    email = info.get("email")
    fullname = info.get("name", "User")

    if not email:
        raise HTTPException(status_code=400, detail="Email not provided by Google")

    # Create user if not exists
    user = await user_collection.find_one({"email": email})
    if not user:
        await user_collection.insert_one({
            "fullname": fullname,
            "email": email,
            "provider": "google"
        })

    return {
        "message": "Login successful",
        "toast_content": f"Welcome {fullname} 👋"
    }
@app.post("/register", status_code=status.HTTP_201_CREATED)
async def register_user(user: UserRegisterSchema):
    if await user_collection.find_one({"email": user.email}):
        raise HTTPException(400, "Email already registered")

    data = user.dict()
    data.pop("confirm_password")
    await user_collection.insert_one(data)

    ai_toast = f"Welcome, {user.fullname}!"

    try:
        async with httpx.AsyncClient() as c:
            r = await c.post(
                f"{NODE_SERVER_URL}/get-welcome-message",
                json={"fullname": user.fullname},
                timeout=5
            )
            if r.status_code == 200:
                ai_toast = r.json().get("message", ai_toast)
    except Exception as e:
        print("Node unreachable:", e)

    return {"message": "Registration successful!", "toast_content": ai_toast}
