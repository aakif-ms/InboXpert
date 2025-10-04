from pydantic import BaseModel, EmailStr
from typing import List, Optional
from datetime import datetime
from .accountModel import AccountSchema

class UserSchema(BaseModel):
    id: str
    name: str
    password: str
    email: EmailStr
    accounts: List[AccountSchema] = []
    createdAt: Optional[datetime] = None
    updatedAt: Optional[datetime] = None
    lastLogin: Optional[datetime] = None