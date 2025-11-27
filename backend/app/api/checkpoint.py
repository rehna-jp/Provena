
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.dependencies import get_db
from app.models.event import Event as EventModel
from app.api.event_schemas import EventCreate, EventRead, EventBatchCreate
from datetime import datetime
import uuid

router = APIRouter(tags=["Checkpoint/Event"])

@router.post("/checkpoint/submit", response_model=EventRead, status_code=status.HTTP_201_CREATED)
def submit_checkpoint(event: EventCreate, db: Session = Depends(get_db)):
    """Submit a single checkpoint/event."""
    db_event = EventModel(
        event_id=str(uuid.uuid4()),
        product_id=event.product_id,
        timestamp=event.timestamp or datetime.utcnow(),
        location=event.location,
        temperature=event.temperature,
        humidity=event.humidity,
        handler_id=event.handler_id,
        event_type=event.event_type,
        images=event.images,
        ai_results=event.ai_results
    )
    db.add(db_event)
    db.commit()
    db.refresh(db_event)
    return db_event

@router.post("/checkpoint/batch", response_model=list[EventRead], status_code=status.HTTP_201_CREATED)
def submit_checkpoint_batch(batch: EventBatchCreate, db: Session = Depends(get_db)):
    """Submit a batch of checkpoints/events."""
    created_events = []
    for event in batch.events:
        db_event = EventModel(
            event_id=str(uuid.uuid4()),
            product_id=event.product_id,
            timestamp=event.timestamp or datetime.utcnow(),
            location=event.location,
            temperature=event.temperature,
            humidity=event.humidity,
            handler_id=event.handler_id,
            event_type=event.event_type,
            images=event.images,
            ai_results=event.ai_results
        )
        db.add(db_event)
        created_events.append(db_event)
    db.commit()
    for db_event in created_events:
        db.refresh(db_event)
    return created_events
