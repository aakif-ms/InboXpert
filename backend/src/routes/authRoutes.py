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

BASE_URL = "https://localhost:5000"
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
    all_emails = []
    errors = []
        
    gmail_account = next((acc for acc in accounts if acc.get("provider") == "gmail" and acc.get("access_token")), None)
    if gmail_account:
        try:
            from ..services.gmail_services import get_emails as get_gmail_emails
            gmail_emails = get_gmail_emails(current_user['email'], max_results=20)
            for email in gmail_emails:
                email['provider'] = 'gmail'
                email['provider_icon'] = '📧'
            all_emails.extend(gmail_emails)
        except Exception as e:
            errors.append(f"Gmail fetch error: {str(e)}")
    
    print("Gmail Account: ", gmail_account)
    
    microsoft_account = next((acc for acc in accounts if acc.get("provider") == "microsoft" and acc.get("access_token")), None)
    if microsoft_account:
        try:
            outlook_emails = fetch_outlook_emails(microsoft_account)
            for email in outlook_emails:
                email['provider'] = 'outlook'
                email['provider_icon'] = '📫'
            all_emails.extend(outlook_emails)
        except Exception as e:
            errors.append(f"Outlook fetch error: {str(e)}")
    
    all_emails.sort(key=lambda x: x.get('received_date', ''), reverse=True)
    
    print("Microsoft Account: ", microsoft_account)
    
    response = {
        "status": "success",
        "data": all_emails,
        "total_count": len(all_emails),
        "connected_accounts": {
            "gmail": bool(gmail_account),
            "outlook": bool(microsoft_account)
        }
    }
    
    if errors:
        response["warnings"] = errors
    
    print("errors: ", errors)
    
    return jsonify(response)

@auth_bp.route("/email/<email_id>")
@jwt_required
def get_email_detail(current_user, email_id):
    user = users.find_one({"email": current_user['email']})
    if not user:
        return jsonify({"error": "User not found"}), 404
    
    provider = request.args.get('provider', 'gmail')
    
    try:
        if provider == 'gmail':
            from ..services.gmail_services import get_email_detail as get_gmail_detail
            email_detail = get_gmail_detail(current_user['email'], email_id)
        else:  
            accounts = user.get("accounts", [])
            microsoft_account = next((acc for acc in accounts if acc.get("provider") == "microsoft"), None)
            if not microsoft_account:
                return jsonify({"error": "Microsoft account not connected"}), 400
            email_detail = get_outlook_email_detail(microsoft_account, email_id)
        
        return jsonify({
            "status": "success",
            "data": email_detail
        })
    
    except Exception as e:
        return jsonify({
            "status": "error",
            "message": f"Failed to fetch email detail: {str(e)}"
        }), 500

def fetch_outlook_emails(microsoft_account):
    access_token = microsoft_account["access_token"]
    
    url = "https://graph.microsoft.com/v1.0/me/messages"
    params = {
        "$top": 20,
        "$orderby": "receivedDateTime desc",
        "$select": "id,subject,from,receivedDateTime,bodyPreview,isRead,hasAttachments,webLink"
    }
    
    headers = {
        "Authorization": f"Bearer {access_token}"
    }
    
    response = requests.get(url, headers=headers, params=params)
    
    if response.status_code != 200:
        raise Exception(f"Outlook API error: {response.status_code} - {response.text}")
    
    data = response.json()
    emails = []
    
    for mail in data.get("value", []):
        email = {
            "id": mail.get("id"),
            "thread_id": mail.get("id"), 
            "subject": mail.get("subject", "No Subject"),
            "sender": mail.get("from", {}).get("emailAddress", {}).get("address", "Unknown Sender"),
            "sender_name": mail.get("from", {}).get("emailAddress", {}).get("name", "Unknown"),
            "snippet": mail.get("bodyPreview", "")[:150],
            "received_date": mail.get("receivedDateTime"),
            "is_read": mail.get("isRead", False),
            "has_attachments": mail.get("hasAttachments", False),
            "web_link": mail.get("webLink")
        }
        emails.append(email)
    
    return emails

def get_outlook_email_detail(microsoft_account, email_id):
    access_token = microsoft_account["access_token"]
    
    url = f"https://graph.microsoft.com/v1.0/me/messages/{email_id}"
    params = {
        "$select": "id,subject,from,toRecipients,ccRecipients,receivedDateTime,body,hasAttachments,attachments"
    }
    
    headers = {
        "Authorization": f"Bearer {access_token}"
    }
    
    response = requests.get(url, headers=headers, params=params)
    
    if response.status_code != 200:
        raise Exception(f"Outlook API error: {response.status_code} - {response.text}")
    
    mail = response.json()
    
    to_recipients = [rec.get("emailAddress", {}).get("address") for rec in mail.get("toRecipients", [])]
    cc_recipients = [rec.get("emailAddress", {}).get("address") for rec in mail.get("ccRecipients", [])]
    
    body_content = mail.get("body", {}).get("content", "")
    if mail.get("body", {}).get("contentType") == "html":
        soup = BeautifulSoup(body_content, 'html.parser')
        body_text = soup.get_text(separator=' ', strip=True)
    else:
        body_text = body_content
    
    email_detail = {
        "id": mail.get("id"),
        "subject": mail.get("subject", "No Subject"),
        "sender": mail.get("from", {}).get("emailAddress", {}).get("address", "Unknown"),
        "sender_name": mail.get("from", {}).get("emailAddress", {}).get("name", "Unknown"),
        "to_recipients": to_recipients,
        "cc_recipients": cc_recipients,
        "received_date": mail.get("receivedDateTime"),
        "body": body_text,
        "html_body": body_content,
        "has_attachments": mail.get("hasAttachments", False),
        "provider": "outlook"
    }
    
    return email_detail