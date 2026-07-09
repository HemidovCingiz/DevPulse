from fastapi import FastAPI, Depends, HTTPException, Body
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from database import get_db, engine
import models
import datetime
import auth

models.Base.metadata.create_all(bind=engine)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_types=["*"] if hasattr(app, "allow_types") else ["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)

@app.get("/")
def read_root():
    return {"status": "healthy"}

@app.post("/api/v1/track/heartbeat")
async def track_user_heartbeat(
    user_id: int = Body(...),
    repo_name: str = Body(...),
    db: Session = Depends(get_db)
):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    now = datetime.datetime.utcnow()
    five_minutes_ago = now - datetime.timedelta(minutes=5)

    active_session = db.query(models.WorkSession).filter(
        models.WorkSession.user_id == user_id,
        models.WorkSession.repo_name == repo_name,
        models.WorkSession.last_ping_at >= five_minutes_ago
    ).order_by(models.WorkSession.last_ping_at.desc()).first()

    if active_session:
        active_session.last_ping_at = now
        delta = now - active_session.started_at
        active_session.duration_seconds = int(delta.total_seconds())
    else:
        active_session = models.WorkSession(
            user_id=user_id,
            repo_name=repo_name,
            started_at=now,
            last_ping_at=now,
            duration_seconds=0
        )
        db.add(active_session)

    db.commit()
    db.refresh(active_session)
    return {
        "status": "tracked", 
        "session_id": active_session.id, 
        "total_seconds": active_session.duration_seconds
    }