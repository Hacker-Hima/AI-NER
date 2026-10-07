from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class UserBase(BaseModel):
    full_name: str
    email: str
    role: str = "regional_observer"  # "admin", "logistics_coordinator", "field_driver", "regional_observer"
    phone: Optional[str] = None
    region: Optional[str] = "Assam"

class UserCreate(UserBase):
    password: str

class UserLogin(BaseModel):
    email: str
    password: str

class UserResponse(UserBase):
    id: str
    created_at: datetime

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse
