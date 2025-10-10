from src.utils.getMessageBody import get_message_body
from googleapiclient.discovery import build
from google.oauth2.credentials import Credentials
from google.auth.transport.requests import Request
from src.db import init_db
from datetime import datetime, timezone
import json
import os

db = init_db()
users = db['users']

client_secret_path = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "client_secret.json")

try:
    with open(client_secret_path, "r") as f:
        data = json.load(f)
    data = data["web"]
except FileNotFoundError:
    print(f"Warning: client_secret.json not found at {client_secret_path}")
    data = {"client_id": "", "client_secret": ""}

SCOPES = ['https://www.googleapis.com/auth/gmail.readonly']

def get_emails(user_email="aakif@gmail.com", max_results=10):
    try:
        user = users.find_one({"email": user_email})
        if not user:
            raise ValueError(f"User with email {user_email} not found in database")
        
        accounts = user.get("accounts", [])
        if not accounts:
            raise ValueError(f"No accounts found for user {user_email}")
        
        account = accounts[0]
        
        access_token = account.get("access_token")
        refresh_token = account.get("refresh_token")
        expires_at = account.get("expires_at")
        
        if not all([access_token, refresh_token]):
            raise ValueError("Missing access_token or refresh_token in database")
        
        creds = Credentials(
            token=access_token,
            refresh_token=refresh_token,
            token_uri="https://oauth2.googleapis.com/token",
            client_id=data["client_id"], 
            client_secret=data["client_secret"], 
            scopes=SCOPES
        )
        
        if expires_at:
            current_time = datetime.now(timezone.utc)
            
            if expires_at.tzinfo is None:
                expires_at_aware = expires_at.replace(tzinfo=timezone.utc)
            else:
                expires_at_aware = expires_at
            
            if current_time >= expires_at_aware:
                print("Token expired, refreshing...")
                creds.refresh(Request())
                
                users.update_one(
                    {"email": user_email},
                    {
                        "$set": {
                            "accounts.0.access_token": creds.token,
                            "accounts.0.expires_at": creds.expiry
                        }
                    }
                )
        service = build("gmail", "v1", credentials=creds)
        
        print(f"Fetching {max_results} emails for {user_email}...")
        results = service.users().messages().list(
            userId="me", 
            maxResults=max_results,
            q="in:inbox -in:spam"
        ).execute()
        messages = results.get("messages", [])
                
        if not messages:
            print("No messages found.")
            return []
        
        emails = []
        for idx, msg in enumerate(messages):
            try:
                msg_data = service.users().messages().get(
                    userId="me", 
                    id=msg["id"], 
                    format="full",
                ).execute()
                
                snippet = msg_data.get("snippet", "")
                email_id = msg_data.get("id")
                thread_id = msg_data.get("threadId")
                
                headers = msg_data.get("payload", {}).get("headers", [])
                subject = next((h["value"] for h in headers if h["name"] == "Subject"), "No Subject")
                sender = next((h["value"] for h in headers if h["name"] == "From"), "Unknown Sender")
                date_header = next((h["value"] for h in headers if h["name"] == "Date"), "")
                
                sender_name = sender
                if "<" in sender and ">" in sender:
                    sender_name = sender.split("<")[0].strip().strip('"')
                    sender = sender.split("<")[1].split(">")[0]
                
                payload = msg_data.get("payload", "")
                email_body = get_message_body(payload=payload)
                
                emails.append({
                    "id": email_id,
                    "thread_id": thread_id,
                    "subject": subject,
                    "sender": sender,
                    "sender_name": sender_name,
                    "snippet": snippet,
                    "received_date": date_header,
                    "body_preview": email_body[:200] if email_body else snippet[:200],
                    "is_read": 'UNREAD' not in msg_data.get('labelIds', []),
                    "has_attachments": has_attachments(msg_data.get("payload", {}))
                })
                
            except Exception as e:
                print(f"Error fetching message {msg['id']}: {e}")
                continue
        
        print(f"Successfully fetched {len(emails)} emails")
        return emails
        
    except Exception as e:
        print(f"Error in get_emails: {e}")
        return []

def has_attachments(payload):
    if payload.get('parts'):
        for part in payload['parts']:
            if part.get('filename') and part.get('body', {}).get('attachmentId'):
                return True
            if part.get('parts'):
                return has_attachments(part)
    return False

def get_email_detail(user_email, email_id):
    try:
        user = users.find_one({"email": user_email})
        if not user:
            raise ValueError(f"User with email {user_email} not found in database")
        
        accounts = user.get("accounts", [])
        gmail_account = next((acc for acc in accounts if acc.get("provider") == "gmail"), None)
        
        if not gmail_account:
            raise ValueError("Gmail account not found")
        
        access_token = gmail_account.get("access_token")
        refresh_token = gmail_account.get("refresh_token")
        expires_at = gmail_account.get("expires_at")
        
        if not all([access_token, refresh_token]):
            raise ValueError("Missing access_token or refresh_token in database")
        
        creds = Credentials(
            token=access_token,
            refresh_token=refresh_token,
            token_uri="https://oauth2.googleapis.com/token",
            client_id=data["client_id"], 
            client_secret=data["client_secret"], 
            scopes=SCOPES
        )
        
        if expires_at:
            current_time = datetime.now(timezone.utc)
            if expires_at.tzinfo is None:
                expires_at_aware = expires_at.replace(tzinfo=timezone.utc)
            else:
                expires_at_aware = expires_at
            
            if current_time >= expires_at_aware:
                creds.refresh(Request())
                users.update_one(
                    {"email": user_email, "accounts.provider": "gmail"},
                    {
                        "$set": {
                            "accounts.$.access_token": creds.token,
                            "accounts.$.expires_at": creds.expiry
                        }
                    }
                )
        
        service = build("gmail", "v1", credentials=creds)
        
        msg_data = service.users().messages().get(
            userId="me", 
            id=email_id, 
            format="full"
        ).execute()
        
        headers = msg_data.get("payload", {}).get("headers", [])
        subject = next((h["value"] for h in headers if h["name"] == "Subject"), "No Subject")
        sender = next((h["value"] for h in headers if h["name"] == "From"), "Unknown Sender")
        to_recipients = next((h["value"] for h in headers if h["name"] == "To"), "")
        cc_recipients = next((h["value"] for h in headers if h["name"] == "Cc"), "")
        date_header = next((h["value"] for h in headers if h["name"] == "Date"), "")
        
        sender_name = sender
        if "<" in sender and ">" in sender:
            sender_name = sender.split("<")[0].strip().strip('"')
            sender_email = sender.split("<")[1].split(">")[0]
        else:
            sender_email = sender
        
        payload = msg_data.get("payload", {})
        email_body = get_message_body(payload=payload)
        
        email_detail = {
            "id": email_id,
            "thread_id": msg_data.get("threadId"),
            "subject": subject,
            "sender": sender_email,
            "sender_name": sender_name,
            "to_recipients": [addr.strip() for addr in to_recipients.split(",")] if to_recipients else [],
            "cc_recipients": [addr.strip() for addr in cc_recipients.split(",")] if cc_recipients else [],
            "received_date": date_header,
            "body": email_body or "No content available",
            "snippet": msg_data.get("snippet", ""),
            "has_attachments": has_attachments(payload),
            "is_read": 'UNREAD' not in msg_data.get('labelIds', []),
            "provider": "gmail"
        }
        
        return email_detail
        
    except Exception as e:
        print(f"Error in get_email_detail: {e}")
        raise e

