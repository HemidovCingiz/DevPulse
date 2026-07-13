from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from database import Base
import datetime

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    github_id = Column(String, unique=True, index=True)
    username = Column(String)
    email = Column(String)
    access_token = Column(String)
    
    sessions = relationship("WorkSession", back_populates="user", cascade="all, delete-orphan")

class WorkSession(Base):
    __tablename__ = "work_sessions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    repo_name = Column(String, index=True, nullable=False)
    started_at = Column(DateTime, default=datetime.datetime.utcnow)
    last_ping_at = Column(DateTime, default=datetime.datetime.utcnow)
    duration_seconds = Column(Integer, default=0)

    user = relationship("User", back_populates="sessions")