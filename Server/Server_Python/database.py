from motor.motor_asyncio import AsyncIOMotorClient
from config import settings

# Create MongoDB client
client = AsyncIOMotorClient(settings.MONGO_DETAILS)

# Get database
database = client.get_database()

# Get collections
user_collection = database.get_collection("users")

# Create indexes
async def create_indexes():
    """Create database indexes"""
    await user_collection.create_index("email", unique=True)
    print("Database indexes created")