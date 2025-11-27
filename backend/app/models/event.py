from sqlalchemy import Column, String, Float, JSON, TIMESTAMP, Integer
from sqlalchemy.ext.declarative import declarative_base

Base = declarative_base()

class Event(Base):
    __tablename__ = "events"
    event_id = Column(String, primary_key=True)
    product_id = Column(String)
    timestamp = Column(TIMESTAMP)
    location = Column(JSON)  # { lat, lng }
    temperature = Column(Float)
    humidity = Column(Float)
    handler_id = Column(String)
    event_type = Column(String)  # LOADED | UNLOADED | TRANSFER | CHECKIN
    images = Column(JSON)  # array
    ai_results = Column(JSON)  # {validation_score, anomaly_score, fraud_score}
