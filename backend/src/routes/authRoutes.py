from flask import Blueprint, request, jsonify, redirect, session, url_for
from google_auth_oauthlib.flow import Flow
import os
from ..services.authUser import registerUser, loginUser
from ..db import init_db
import os


db = init_db()
users = db["users"]

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
client_secret = os.path.join(BASE_DIR, "client_secret.json")

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


@auth_bp.route("/gmail/connect")
def gmail_connect():
    flow = Flow.from_client_secrets_file(
        client_secret,
        scopes=["https://www.googleapis.com/auth/gmail.readonly",
                "https://www.googleapis.com/auth/gmail.send"],
        redirect_uri=url_for("auth.gmail_callback", _external=True)
    )
    auth_url, _ = flow.authorization_url(prompt="consent", access_type="offline", include_granted_scopes="true")
    return redirect(auth_url)

@auth_bp.route("/gmail/callback")
def gmail_callback():
    flow = Flow.from_client_secrets_file(
        client_secret,
        scopes=["https://www.googleapis.com/auth/gmail.readonly",
                "https://www.googleapis.com/auth/gmail.send"],
        redirect_uri=url_for("auth.gmail_callback", _external=True)
    )
    flow.fetch_token(authorization_response=request.url)
    credentials = flow.credentials

    users.update_one(
        {"email": "aakif@gmail.com"},  
        {"$push": {"accounts": {
            "provider": "gmail",
            "email": "aakif@gmail.com",
            "access_token": credentials.token,
            "refresh_token": credentials.refresh_token,
            "expires_at": credentials.expiry
        }}}
    )
    return "Gmail connected successfully!"