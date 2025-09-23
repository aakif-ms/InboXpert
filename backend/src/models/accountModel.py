from datetime import datetime
from pydantic import BaseModel

class AccountSchema(BaseModel):
    provider: str
    email: str
    access_token: str
    refresh_token: str
    expires_at: datetime
    