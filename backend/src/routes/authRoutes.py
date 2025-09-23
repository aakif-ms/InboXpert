from flask import Blueprint, request, jsonify
from ..services.authUser import registerUser
from ..db import init_db

db = init_db()
users = db["users"]

auth_bp = Blueprint("auth", __name__)

@auth_bp.route("/register", methods=["POST"])
def register():
    data = request.json
    email = data.get("email")
    userName = data.get("name")
    password = data.get("password")
    
    if not email or not userName or not password:
        return {"error": "Missing one of the field"}

    response = registerUser(userName=userName, password=password, email=email)
    return jsonify(response)