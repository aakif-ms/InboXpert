from ..db import init_db
from ..utils.security import checkPassword, hashPassword
from ..models.userModel import UserSchema
import jwt
import uuid
import os
from datetime import timedelta, timezone, datetime
from dotenv import load_dotenv

load_dotenv()

db = init_db()
users = db["users"]

JWT_SECRET = os.getenv('JWT_SECRET_KEY', 'your-super-secret-jwt-key-change-in-production')
JWT_EXPIRATION_HOURS = int(os.getenv('JWT_EXPIRATION_HOURS', '24'))

def generate_jwt_token(user_id: str, email: str) -> str:
    payload = {
        "user_id": user_id,
        "email": email,
        "exp": datetime.now(timezone.utc) + timedelta(hours=JWT_EXPIRATION_HOURS),
        "iat": datetime.now(timezone.utc)
    }
    return jwt.encode(payload, JWT_SECRET, algorithm="HS256")

def verify_jwt_token(token: str) -> dict:
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=["HS256"])
        return {"valid": True, "payload": payload}
    except jwt.ExpiredSignatureError:
        return {"valid": False, "error": "Token has expired"}
    except jwt.InvalidTokenError:
        return {"valid": False, "error": "Invalid token"}

def registerUser(userName: str, password: str, email: str):
    try:
        if users.find_one({"email": email}):
            return {"error": "User already exists"}, 409 

        hashed_password = hashPassword(password=password)
        user_id = str(uuid.uuid4())

        user = UserSchema(
            id=user_id,
            name=userName,
            password=hashed_password,
            email=email,
            createdAt=datetime.now(timezone.utc),
            updatedAt=datetime.now(timezone.utc)
        )

        users.insert_one(user.model_dump())
        
        token = generate_jwt_token(user_id, email)
        
        return {
            "success": "User has been created successfully",
            "token": token,
            "user": {
                "id": user_id,
                "name": userName,
                "email": email
            }
        }, 201 

    except Exception as e:
        print("Error occurred during registration:", e)
        return {"error": "Internal server error"}, 500

def loginUser(email: str, password: str):
    try:
        user = users.find_one({"email": email})
        if not user:
            return {"error": "User does not exist"}, 404

        if not checkPassword(password=password, hashedPassword=user['password']):
            return {"error": "Invalid credentials"}, 401

        token = generate_jwt_token(user['id'], user['email'])
        
        users.update_one(
            {"email": email},
            {"$set": {"lastLogin": datetime.now(timezone.utc)}}
        )

        return {
            "success": "User logged in successfully",
            "token": token,
            "user": {
                "id": user['id'],
                "name": user['name'],
                "email": user['email']
            }
        }, 200

    except Exception as e:
        print("Error occurred during login:", e)
        return {"error": "Internal server error"}, 500

def get_user_by_id(user_id: str):
    try:
        user = users.find_one({"id": user_id})
        if user:
            user.pop('password', None)
            return user
        return None
    except Exception as e:
        print("Error getting user by ID:", e)
        return None