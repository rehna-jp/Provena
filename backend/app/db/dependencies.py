from sqlalchemy.orm import Session
from fastapi import Depends, HTTPException, status
from app.db.session import SessionLocal

# Dependency for DB session

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
