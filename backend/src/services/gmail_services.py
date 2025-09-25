from googleapiclient.discovery import build
from google.oauth2.credentials import Credentials
from google.auth.transport.requests import Request
from datetime import datetime, timezone

try:
    from ..db import init_db
except ImportError:
    import sys
    from pathlib import Path
    parent_dir = Path(__file__).parent.parent.parent
    sys.path.insert(0, str(parent_dir))
    from src.db import init_db

db = init_db()
users = db['users']

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
            client_id="", # Enter your client Id
            client_secret="", # Enter you secret 
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
            maxResults=max_results
        ).execute()
        
        messages = results.get("messages", [])
        
        if not messages:
            print("No messages found.")
            return []
        
        emails = []
        for msg in messages:
            try:
                msg_data = service.users().messages().get(
                    userId="me", 
                    id=msg["id"], 
                    format="metadata"
                ).execute()
                
                snippet = msg_data.get("snippet", "")
                email_id = msg_data.get("id")
                thread_id = msg_data.get("threadId")
                
                headers = msg_data.get("payload", {}).get("headers", [])
                subject = next((h["value"] for h in headers if h["name"] == "Subject"), "No Subject")
                sender = next((h["value"] for h in headers if h["name"] == "From"), "Unknown Sender")
                
                emails.append({
                    "id": email_id,
                    "thread_id": thread_id,
                    "subject": subject,
                    "sender": sender,
                    "snippet": snippet
                })
                
            except Exception as e:
                print(f"Error fetching message {msg['id']}: {e}")
                continue
        
        print(f"Successfully fetched {len(emails)} emails")
        return emails
        
    except Exception as e:
        print(f"Error in get_emails: {e}")
        return []

def display_emails(emails):
    for i, email in enumerate(emails, 1):
        print(f"\n--- Email {i} ---")
        print(f"ID: {email['id']}")
        print(f"Subject: {email['subject']}")
        print(f"From: {email['sender']}")
        print(f"Snippet: {email['snippet'][:100]}...")

if __name__ == "__main__":    
    emails = get_emails()
    if emails:
        display_emails(emails)
    else:
        print("No emails retrieved.")