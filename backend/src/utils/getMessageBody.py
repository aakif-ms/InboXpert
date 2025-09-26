import base64
from typing import Optional, Dict
from bs4 import BeautifulSoup 
def get_message_body(payload: Dict) -> Optional[str]:

    parts = payload.get('parts')
    data = None
    mime_type_found = None
    
    if payload.get('body') and payload['body'].get('data'):
        data = payload['body']['data']
        mime_type_found = payload.get('mimeType', 'text/plain')
    elif parts:
        html_data_fallback = None
        
        for part in parts:
            mime_type = part.get('mimeType')
            
            if mime_type == 'text/plain' and part['body'].get('data'):
                data = part['body']['data']
                mime_type_found = 'text/plain'
                break
            
            elif mime_type == 'text/html' and part['body'].get('data'):
                html_data_fallback = part['body']['data']
        
            if part.get('parts'):
                nested_data = get_message_body(part)
                if nested_data:
                    return nested_data

        if not data and html_data_fallback:
            data = html_data_fallback
            mime_type_found = 'text/html'

    if data:
        decoded_data = base64.urlsafe_b64decode(data).decode('utf-8')
        
        if mime_type_found == 'text/html':
            soup = BeautifulSoup(decoded_data, 'html.parser')
            clean_text = soup.get_text(separator=' ', strip=True)
            return clean_text
            
        return decoded_data
        
    return None 