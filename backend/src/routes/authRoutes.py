from flask import Blueprint, request, jsonify, redirect, url_for
from google_auth_oauthlib.flow import Flow
import os
import urllib.parse
from ..services.authUser import registerUser, loginUser
from ..db import init_db
from ..utils.middleware import jwt_required
from dotenv import load_dotenv
import requests
from datetime import timezone, datetime, timedelta
from bs4 import BeautifulSoup

load_dotenv()
db = init_db()
users = db["users"]

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
client_secret = os.path.join(BASE_DIR, "client_secret.json")

CLIENT_ID = os.getenv("CLIENT_ID")
CLIENT_SECRET = os.getenv("CLIENT_SECRET")

# Use HTTP for development, HTTPS for production
BASE_URL = "http://localhost:5000" if os.getenv('FLASK_ENV') == 'development' else "https://yourproductiondomain.com"
AUTHORITY = "https://login.microsoftonline.com/YOUR_TENANT_ID"
REDIRECT_URI = f"{BASE_URL}/auth/microsoft/callback"

auth_bp = Blueprint("auth", __name__)

@auth_bp.route("/register", methods=["POST"])
def register():
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({"error": "No data provided"}), 400
            
        email = data.get("email")
        userName = data.get("name")
        password = data.get("password")

        if not email or not userName or not password:
            return jsonify({"error": "Missing required fields: email, name, password"}), 400

        response, status_code = registerUser(userName=userName, password=password, email=email)
        return jsonify(response), status_code
        
    except Exception as e:
        return jsonify({"error": "Invalid JSON data"}), 400

@auth_bp.route("/login", methods=["POST"])
def login():
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({"error": "No data provided"}), 400
            
        email = data.get("email")
        password = data.get("password")

        if not email or not password:
            return jsonify({"error": "Missing required fields: email, password"}), 400

        response, status_code = loginUser(email=email, password=password)
        return jsonify(response), status_code
        
    except Exception as e:
        return jsonify({"error": "Invalid JSON data"}), 400

@auth_bp.route("/profile", methods=["GET"])
@jwt_required
def get_profile(current_user):
    return jsonify({
        "success": True,
        "user": current_user
    }), 200

@auth_bp.route("/verify-token", methods=["POST"])
def verify_token():
    token = None
    
    if 'Authorization' in request.headers:
        auth_header = request.headers['Authorization']
        try:
            token = auth_header.split(" ")[1]
        except IndexError:
            return jsonify({'error': 'Invalid token format'}), 401
    
    if not token:
        return jsonify({'error': 'Token is missing'}), 401
    
    try:
        from ..services.authUser import verify_jwt_token
        result = verify_jwt_token(token)
        
        if result['valid']:
            return jsonify({
                'valid': True,
                'user_id': result['payload']['user_id'],
                'email': result['payload']['email']
            }), 200
        else:
            return jsonify({'valid': False, 'error': result['error']}), 401
            
    except Exception as e:
        return jsonify({'valid': False, 'error': 'Token verification failed'}), 401

@auth_bp.route("/gmail/connect")
@jwt_required
def gmail_connect(current_user):
    flow = Flow.from_client_secrets_file(
        client_secret,
        scopes=[
            "https://www.googleapis.com/auth/gmail.readonly",
            "https://www.googleapis.com/auth/gmail.send",
        ],
        redirect_uri=url_for("auth.gmail_callback", _external=True),
    )
    flow.authorization_url(
        prompt="consent", 
        access_type="offline", 
        include_granted_scopes="true",
        state=current_user['id']
    )
    auth_url, _ = flow.authorization_url(
        prompt="consent", access_type="offline", include_granted_scopes="true"
    )
    return jsonify({"auth_url": auth_url})

@auth_bp.route("/gmail/callback")
def gmail_callback():
    flow = Flow.from_client_secrets_file(
        client_secret,
        scopes=[
            "https://www.googleapis.com/auth/gmail.readonly",
            "https://www.googleapis.com/auth/gmail.send",
        ],
        redirect_uri=url_for("auth.gmail_callback", _external=True),
    )
    flow.fetch_token(authorization_response=request.url)
    credentials = flow.credentials

    user_email = "aakif@gmail.com"  
    
    users.update_one(
        {"email": user_email},
        {"$pull": {"accounts": {"provider": "gmail"}}}
    )

    users.update_one(
        {"email": user_email},
        {
            "$push": {
                "accounts": {
                    "provider": "gmail",
                    "email": user_email,
                    "access_token": credentials.token,
                    "refresh_token": credentials.refresh_token,
                    "expires_at": credentials.expiry,
                }
            }
        },
    )
    return jsonify({"message": "Gmail connected successfully!"})

@auth_bp.route("/microsoft/connect")
@jwt_required
def microsoft_connect(current_user):
    auth_url = "https://login.microsoftonline.com/common/oauth2/v2.0/authorize"
    params = {
        "client_id": CLIENT_ID,
        "response_type": "code",
        "redirect_uri": REDIRECT_URI,
        "response_mode": "query",
        "scope": "User.Read Mail.Read Mail.Send",
        "state": current_user['id'], 
    }
    url = f"{auth_url}?{urllib.parse.urlencode(params)}"
    return jsonify({"auth_url": url})

@auth_bp.route("/microsoft/callback")
def microsoft_callback():
    code = request.args.get("code")
    user_id = request.args.get("state")

    if not code:
        return jsonify({"error": "Authorization code not provided"}), 400

    token_url = "https://login.microsoftonline.com/common/oauth2/v2.0/token"
    data = {
        "client_id": CLIENT_ID,
        "scope": "User.Read Mail.Read Mail.Send",
        "code": code,
        "redirect_uri": REDIRECT_URI,
        "grant_type": "authorization_code",
        "client_secret": CLIENT_SECRET,
    }

    response = requests.post(token_url, data=data)
    tokens = response.json()
    
    if response.status_code != 200:
        return jsonify({"error": "Failed to get access token", "details": tokens}), 400
    
    if user_id:
        user = users.find_one({"id": user_id})
        user_email = user['email'] if user else "aakif@gmail.com"
    else:
        user_email = "aakif@gmail.com"
    
    users.update_one(
        {"email": user_email},
        {"$pull": {"accounts": {"provider": "microsoft"}}}
    )
    
    users.update_one(
        {"email": user_email},
        {
            "$push": {
                "accounts": {
                    "provider": "microsoft",
                    "access_token": tokens.get("access_token"),
                    "expires_at": datetime.now(timezone.utc)
                    + timedelta(seconds=tokens.get("expires_in", 0)),
                }
            },
        },
    )
    return jsonify({"message": "Microsoft account connected successfully!"})

@auth_bp.route("/fetch_emails")
@jwt_required
def fetch_emails(current_user):
    user = users.find_one({"email": current_user['email']})
    if not user:
        return jsonify({"error": "User not found"}), 404
    
    accounts = user.get("accounts", [])
    provider = next((obj for obj in accounts if obj["provider"] == "microsoft" and obj.get("access_token") is not None), None)
    
    if not provider:
        return jsonify({"error": "Microsoft provider not found or no access token available"}), 400

    access_token = provider["access_token"]
    
    url = "https://graph.microsoft.com/v1.0/me/messages"
    headers = {
        "Authorization": f"Bearer {access_token}"
    }
    
    response = requests.get(url, headers=headers)
    
    if response.status_code == 200:
        data = response.json()
        content = data["value"]
        processed_mails = []

        for mails in content:
            email_body = mails["body"]["content"]        
            soup = BeautifulSoup(email_body, 'html.parser')
            email_text = soup.get_text(separator=' ', strip=True)
            processed_mails.append({
                "id": mails.get("id"),
                "subject": mails.get("subject"),
                "from": mails.get("from", {}).get("emailAddress", {}).get("address"),
                "body": email_text[:500]  # Limit body length
            })
        return jsonify({"status": "success", "data": processed_mails})
    else:
        print("Error fetching mails:", response.json())
        return jsonify({"status": "error", "message": "Error fetching emails", "details": response.json()}), 500


# @auth_bp.route("/gmail/connect")
# def gmail_connect():
#     flow = Flow.from_client_secrets_file(
#         client_secret,
#         scopes=[
#             "https://www.googleapis.com/auth/gmail.readonly",
#             "https://www.googleapis.com/auth/gmail.send",
#         ],
#         redirect_uri=url_for("auth.gmail_callback", _external=True),
#     )
#     auth_url, _ = flow.authorization_url(
#         prompt="consent", access_type="offline", include_granted_scopes="true"
#     )
#     return redirect(auth_url)


# @auth_bp.route("/gmail/callback")
# def gmail_callback():
#     flow = Flow.from_client_secrets_file(
#         client_secret,
#         scopes=[
#             "https://www.googleapis.com/auth/gmail.readonly",
#             "https://www.googleapis.com/auth/gmail.send",
#         ],
#         redirect_uri=url_for("auth.gmail_callback", _external=True),
#     )
#     flow.fetch_token(authorization_response=request.url)
#     credentials = flow.credentials

#     db.users.update_one(
#     {"email": "aakif@gmail.com"},
#     {"$pull": {"accounts": {"provider": "gmail"}}}
#     )

#     users.update_one(
#         {"email": "aakif@gmail.com"},
#         {
#             "$push": {
#                 "accounts": {
#                     "provider": "gmail",
#                     "email": "aakif@gmail.com",
#                     "access_token": credentials.token,
#                     "refresh_token": credentials.refresh_token,
#                     "expires_at": credentials.expiry,
#                 }
#             }
#         },
#     )
#     return "Gmail connected successfully!"


# @auth_bp.route("/microsoft/connect")
# def microsoft_connect():
#     auth_url = "https://login.microsoftonline.com/common/oauth2/v2.0/authorize"
#     params = {
#         "client_id": CLIENT_ID,
#         "response_type": "code",
#         "redirect_uri": REDIRECT_URI,
#         "response_mode": "query",
#         "scope": "User.Read Mail.Read Mail.Send",
#         "state": "12345",
#     }
#     url = f"{auth_url}?{urllib.parse.urlencode(params)}"
#     return redirect(url)


# @auth_bp.route("/microsoft/callback")
# def microsoft_callback():
#     code = request.args.get("code")

#     token_url = "https://login.microsoftonline.com/common/oauth2/v2.0/token"
#     data = {
#         "client_id": CLIENT_ID,
#         "scope": "User.Read Mail.Read Mail.Send",
#         "code": code,
#         "redirect_uri": REDIRECT_URI,
#         "grant_type": "authorization_code",
#         "client_secret": CLIENT_SECRET,
#     }

#     response = requests.post(token_url, data=data)
#     tokens = response.json()
    
#     db.users.update_one(
#     {"email": "aakif@gmail.com"},
#     {"$pull": {"accounts": {"provider": "microsoft"}}}
#     )
    
#     users.update_one(
#         {"email": "aakif@gmail.com"},
#         {
#             "$push": {
#                 "accounts": {
#                     "provider": "microsoft",
#                     "access_token": tokens.get("access_token"),
#                     "expires_at": datetime.now(timezone.utc)
#                     + timedelta(seconds=tokens.get("expires_in", 0)),
#                 }
#             },
#         },
#     )
#     return "Microsoft account connected successfully!"


# @auth_bp.route("/fetch_emails")
# def fetch_emails():
#     user = users.find_one({"email": "aakif@gmail.com"})
#     if not user:
#         return "User not found", 404  
    
#     accounts = user.get("accounts", [])
#     provider = next((obj for obj in accounts if obj["provider"] == "microsoft" and obj.get("access_token") is not None), None)
    
#     if not provider:
#         return "Microsoft provider not found or no access token available", 400  

#     access_token = provider["access_token"]
    
#     url = "https://graph.microsoft.com/v1.0/me/messages"
#     headers = {
#         "Authorization": f"Bearer {access_token}"
#     }
    
#     response = requests.get(url, headers=headers)
    
#     if response.status_code == 200:
#         data = response.json()
#         content = data["value"]
#         processed_mails = []

#         for mails in content:
#             email_body = mails["body"]["content"]        
#             soup = BeautifulSoup(email_body, 'html.parser')
#             email_text = soup.get_text(separator=' ', strip=True)
#             processed_mails.append(email_text)
#         return jsonify({"status": "success", "data": processed_mails})  
#     else:
#         print("Error fetching mails:", response.json())
#         return jsonify({"status": "error", "message": "Error fetching emails", "details": response.json()}), 500  