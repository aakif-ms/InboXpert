import msal
import requests
from ..db import init_db

db = init_db()
users = db["users"]

def get_emails():
    user = users.find_one({"email": "aakif@gmail.com"})
    accounts = user["accounts"]
    provider = next((obj for obj in accounts if obj["provider"] == "microsoft" and obj["access_token"] is not None), None)
    access_token = provider["access_token"]
    
    url = "https://graph.microsoft.com/v1.0/me/messages"
    headers = {
        "Authorization": f"Bearer {access_token}"
    }
    response = requests.get(url, headers)
    if response.status_code == 200:
        data = response.json()
        return data  
    else:
        print("Error fetching mails:", response.json())
        return None