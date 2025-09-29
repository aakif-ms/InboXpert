from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime

class EmailSchema(BaseModel):
    userEmail: EmailStr
    provider: str
    message_id: str
    thread_id: Optional[str]
    from_email: EmailStr
    to: List[EmailStr]
    subject: str
    body: str
    received_at: datetime