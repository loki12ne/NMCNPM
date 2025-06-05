from fastapi import APIRouter, HTTPException, Depends, Request
from database import get_db
from models import Question
from routes.auth import get_current_user

router = APIRouter()

@router.post("/questions")
async def post_question(question: Question, user: dict = Depends(get_current_user)):
    try:
        conn = get_db()
        cursor = conn.cursor()
        cursor.execute("SELECT username FROM Accounts WHERE username = %s", (user["username"],))
        if not cursor.fetchone():
            raise HTTPException(status_code=400, detail="User does not exist")

        cursor.execute(
            "INSERT INTO Questions (username, text_content, subject, date_posted) VALUES (%s, %s, %s, NOW())",
            (user["username"], question.text_content, question.subject)
        )
        conn.commit()
        cursor.execute("SELECT LAST_INSERT_ID() AS question_id")
        question_id = cursor.fetchone()["question_id"]
        cursor.close()
        conn.close()
        return {"message": "Question posted successfully", "questionId": question_id}
    except Exception as e:
        print(f"Question post error: {e}")
        raise HTTPException(status_code=500, detail="Server error")

@router.get("/questions")
async def get_questions():
    try:
        conn = get_db()
        cursor = conn.cursor()
        cursor.execute("SELECT question_id, username, text_content, subject, date_posted FROM Questions ORDER BY date_posted DESC")
        questions = cursor.fetchall()
        cursor.close()
        conn.close()
        return {"questions": questions}
    except Exception as e:
        print(f"Questions fetch error: {e}")
        raise HTTPException(status_code=500, detail="Server error")