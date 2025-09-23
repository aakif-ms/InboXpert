from ..db import init_db
from ..utils.security import checkPassword, hashPassword
from ..models.userModel import UserSchema
from datetime import datetime

db = init_db()

users = db["users"]

def registerUser(userName: str, password: str, email: str):
    if(users.find_one({"email": email})):
        return {"error": "User already exists"}
    
    password = hashPassword(password=password)

    user = UserSchema(
        name=userName,
        password=password,
        email=email
    )
    
    users.insert_one(user.model_dump())
    return {"success": "user has been created successfully"}