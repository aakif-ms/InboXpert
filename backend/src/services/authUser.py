from ..db import init_db
from ..utils.security import checkPassword, hashPassword
from ..models.userModel import UserSchema
from datetime import datetime

db = init_db()

users = db["users"]

def registerUser(userName: str, password: str, email: str):
    try:
        if users.find_one({"email": email}):
            return {"error": "User already exists"}, 409 

        hashed_password = hashPassword(password=password)

        user = UserSchema(
            name=userName,
            password=hashed_password,
            email=email,
            createdAt=datetime.utcnow(),
            updatedAt=datetime.utcnow()
        )

        users.insert_one(user.model_dump())
        return {"success": "User has been created successfully"}, 201 

    except Exception as e:
        print("Error occurred during registration:", e)
        return {"error": "Internal server error"}, 500


def loginUser(email: str, password: str):
    try:
        user = users.find_one({"email": email})
        if not user:
            return {"error": "User does not exist"}, 404

        if checkPassword(password=password, hashedPassword=user['password']):
            return {"success": "User logged in successfully"}, 200
        else:
            return {"error": "Invalid credentials"}, 401

    except Exception as e:
        print("Error occurred during login:", e)
        return {"error": "Internal server error"}, 500