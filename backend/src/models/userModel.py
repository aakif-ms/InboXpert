from pydantic import BaseModel, EmailStr
from typing import List
from .accountModel import AccountSchema

class UserSchema(BaseModel):
    name: str
    password: str
    email: EmailStr
    accounts: List[AccountSchema] = []