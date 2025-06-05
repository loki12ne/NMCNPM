# backend/models.py
from pydantic import BaseModel
from datetime import datetime
from typing import Optional
from uuid import UUID

class Account(BaseModel):
    username: str
    password: str
    role: Optional[str] = None

class UserLogin(BaseModel):
    username: str
    password: str

class UserSignup(BaseModel):
    username: str
    password: str
    role: Optional[str] = "student"

class UserSession(BaseModel):
    username: str
    role: str

class SessionData(BaseModel):
    sid: UUID
    sess: UserSession
    expire: datetime