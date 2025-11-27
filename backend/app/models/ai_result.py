from sqlalchemy import Column, String, Float, JSON, TIMESTAMP
from sqlalchemy.ext.declarative import declarative_base

Base = declarative_base()

class AIResult(Base):
    __tablename__ = "ai_results"
    ai_id = Column(String, primary_key=True)
    product_id = Column(String)
    event_id = Column(String)
    validation_output = Column(JSON)
    anomaly_output = Column(JSON)
    fraud_output = Column(JSON)
    trust_score_delta = Column(Float)
    timestamp = Column(TIMESTAMP)
