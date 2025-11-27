from pydantic import BaseModel, Field
from typing import Optional, Any, List
from datetime import datetime

class EventBase(BaseModel):
    product_id: str
    timestamp: Optional[datetime] = None
    location: Optional[Any] = None  # { lat, lng }
    temperature: Optional[float] = None
    humidity: Optional[float] = None
    handler_id: Optional[str] = None
    event_type: str
    images: Optional[Any] = None  # array
    ai_results: Optional[Any] = None

class EventCreate(EventBase):
    pass

class EventRead(EventBase):
    event_id: str
    timestamp: datetime

    class Config:
        orm_mode = True

class EventBatchCreate(BaseModel):
    events: List[EventCreate]
