# backend/routes/auth.py
from fastapi import APIRouter, HTTPException, Depends, Response
from fastapi_sessions import SessionCookieTransport, SessionVerifier
from session_backend import PostgresSessionBackend
from models import UserLogin, UserSignup, UserSession
from database import get_db_connection
from uuid import uuid4
from datetime import datetime, timedelta
import bcrypt

router = APIRouter()

# Config
SESSION_MAX_AGE = 3600  # 1 hour

# Cookie transport
cookie_transport = SessionCookieTransport(
    cookie_name="session",
    cookie_max_age=SESSION_MAX_AGE,
    cookie_secure=False,  # Set to True in production with HTTPS
    cookie_httponly=True,
    cookie_samesite="lax"
)

# Session backend
backend = PostgresSessionBackend()

# Session verifier
class BasicVerifier(SessionVerifier[UUID, UserSession]):
    async def verify_session(self, session_data: UserSession) -> bool:
        return True

verifier = BasicVerifier(
    identifier="auth-verifier",
    auto_error=True,
    backend=backend,
    auth_http_transport=cookie_transport
)

# Dependency to get current user
async def get_current_user(session_id: UUID = Depends(cookie_transport.get_session_id)):
    if session_id is None:
        raise HTTPException(status_code=401, detail="Not authenticated")
    session_data = await backend.read(session_id)
    if session_data is None:
        raise HTTPException(status_code=401, detail="Invalid session")
    return session_data

# Check authentication status
@router.get("/check-auth")
async def check_auth(session_id: UUID = Depends(cookie_transport.get_session_id)):
    if session_id is None:
        return {"isAuthenticated": False}
    session_data = await backend.read(session_id)
    if session_data:
        return {"isAuthenticated": True, "user": {"username": session_data.username, "role": session_data.role}}
    return {"isAuthenticated": False}

# Logout
@router.post("/logout")
async def logout(response: Response, session_id: UUID = Depends(cookie_transport.get_session_id)):
    if session_id:
        await backend.delete(session_id)
        cookie_transport.delete_cookie(response)
    return {"message": "Logged out successfully"}

# Login
@router.post("/login")
async def login(user: UserLogin, response: Response):
    conn = get_db_connection()
    try:
        with conn.cursor() as cur:
            cur.execute("SELECT username, password, role FROM Accounts WHERE username = %s", (user.username,))
            db_user = cur.fetchone()
            if not db_user:
                raise HTTPException(status_code=401, detail="Invalid username or password")
            
            # Verify password
            stored_password = db_user[1].encode('utf-8')
            if not bcrypt.checkpw(user.password.encode('utf-8'), stored_password):
                raise HTTPException(status_code=401, detail="Invalid username or password")

            # Create session
            session_id = uuid4()
            session_data = UserSession(username=db_user[0], role=db_user[2])
            expire = datetime.now() + timedelta(seconds=SESSION_MAX_AGE)
            await backend.create(session_id, session_data, expire)
            cookie_transport.attach_to_response(response, session_id)

            return {"message": "Login successful", "role": db_user[2]}
    finally:
        conn.close()

# Signup
@router.post("/signup")
async def signup(user: UserSignup):
    conn = get_db_connection()
    try:
        with conn.cursor() as cur:
            # Check if username exists
            cur.execute("SELECT COUNT(*) FROM Accounts WHERE username = %s", (user.username,))
            if cur.fetchone()[0] > 0:
                raise HTTPException(status_code=409, detail="Username already exists")

            # Hash password
            hashed_password = bcrypt.hashpw(user.password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

            # Insert new user
            cur.execute(
                "INSERT INTO Accounts (username, password, role) VALUES (%s, %s, %s)",
                (user.username, hashed_password, user.role)
            )
            conn.commit()
            return {"message": "User created successfully"}
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=400, detail=f"Error creating user: {str(e)}")
    finally:
        conn.close()