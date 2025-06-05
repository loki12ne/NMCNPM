from fastapi import APIRouter, HTTPException, Depends
from database import get_db
from models import Answer
from routes.auth import get_current_user

router = APIRouter()

@router.post("/answers")
async def post_answer(answer: Answer, user: dict = Depends(get_current_user)):
    try:
        conn = get_db()
        cursor = conn.cursor()
        cursor.execute("SELECT username FROM Accounts WHERE username = %s", (user["username"],))
        if not cursor.fetchone():
            raise HTTPException(status_code=400, detail="User does not exist")

        cursor.execute(
            "INSERT INTO Answers (answer_id, question_id, user_ask, user_answer, text_content, date_posted) VALUES (%s, %s, %s, %s, %s, NOW())",
            (answer.answer_id, answer.question_id, answer.user_ask, answer.user_answer, answer.text_content)
        )
        conn.commit()
        cursor.close()
        conn.close()
        return {"message": "Answer posted successfully"}
    except Exception as e:
        print(f"Answer post error: {e}")
        raise HTTPException(status_code=500, detail="Server error")

@router.get("/answers")
async def get_answers():
    try:
        conn = get_db()
        cursor = conn.cursor()
        cursor.execute("SELECT answer_id, question_id, user_ask, user_answer, text_content, date_posted FROM Answers")
        answers = cursor.fetchall()
        cursor.close()
        conn.close()
        return {"answers": answers}
    except Exception as e:
        print(f"Answers fetch error: {e}")
        raise HTTPException(status_code=500, detail="Server error")