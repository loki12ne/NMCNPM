from fastapi import APIRouter, HTTPException, Depends
from database import get_db
from models import Feedback
from routes.auth import get_current_user

router = APIRouter()

@router.post("/feedbacks")
async def post_feedback(feedback: Feedback, user: dict = Depends(get_current_user)):
    try:
        conn = get_db()
        cursor = conn.cursor()
        cursor.execute("SELECT username FROM Accounts WHERE username = %s", (user["username"],))
        if not cursor.fetchone():
            raise HTTPException(status_code=400, detail="User does not exist")

        cursor.execute(
            "INSERT INTO FeedBacks (feedback_id, answer_id, question_id, username, rating, comment, date_posted) VALUES (%s, %s, %s, %s, %s, %s, NOW())",
            (feedback.feedback_id, feedback.answer_id, feedback.question_id, feedback.username, feedback.rating, feedback.comment)
        )
        conn.commit()
        cursor.close()
        conn.close()
        return {"message": "Feedback posted successfully"}
    except Exception as e:
        print(f"Feedback post error: {e}")
        raise HTTPException(status_code=500, detail="Server error")

@router.get("/feedbacks")
async def get_feedbacks():
    try:
        conn = get_db()
        cursor = conn.cursor()
        cursor.execute("SELECT feedback_id, answer_id, question_id, username, rating, comment, date_posted FROM FeedBacks")
        feedbacks = cursor.fetchall()
        cursor.close()
        conn.close()
        return {"feedbacks": feedbacks}
    except Exception as e:
        print(f"Feedbacks fetch error: {e}")
        raise HTTPException(status_code=500, detail="Server error")