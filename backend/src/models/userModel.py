from pydantic import BaseModel, EmailStr, Field
from datetime import datetime
from typing import List

class UserSchema(BaseModel):
    name: str
    password: str
    email: EmailStr
    accounts: List[str] = []
    createdAt: datetime = Field(default_factory=datetime.utcnow)
    updatedAt: datetime = Field(default_factory=datetime.utcnow)
