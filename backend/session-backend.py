# backend/session_backend.py
from fastapi_sessions.backends import SessionBackend
from uuid import UUID
from models import UserSession, SessionData
from database import get_db_connection
from datetime import datetime

class PostgresSessionBackend(SessionBackend[UUID, UserSession]):
    async def create(self, session_id: UUID, data: UserSession, expire: datetime = None):
        conn = get_db_connection()
        try:
            with conn.cursor() as cur:
                cur.execute(
                    """
                    INSERT INTO sessions (sid, sess, expire)
                    VALUES (%s, %s, %s)
                    """,
                    (str(session_id), data.dict(), expire or datetime.now())
                )
                conn.commit()
        finally:
            conn.close()

    async def read(self, session_id: UUID) -> UserSession | None:
        conn = get_db_connection()
        try:
            with conn.cursor() as cur:
                cur.execute("SELECT sess FROM sessions WHERE sid = %s", (str(session_id),))
                result = cur.fetchone()
                if result:
                    return UserSession(**result[0])
                return None
        finally:
            conn.close()

    async def delete(self, session_id: UUID):
        conn = get_db_connection()
        try:
            with conn.cursor() as cur:
                cur.execute("DELETE FROM sessions WHERE sid = %s", (str(session_id),))
                conn.commit()
        finally:
            conn.close()