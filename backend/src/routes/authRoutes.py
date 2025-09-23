from flask import Blueprint, request, jsonify, redirect, sessino, url_for
from google_auth_oauthlib.flow import Flow
import os
from ..services.authUser import registerUser, loginUser
from ..db import init_db

db = init_db()
users = db["users"]

client_secret = "client_secret_gmail.json"

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

@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.json
    email = data.get("email")
    password = data.get("password")
    
    if not email or not password:
        return {"error": "Missing one of the field"}

    response = loginUser(email=email, password=password)
    return jsonify(response)