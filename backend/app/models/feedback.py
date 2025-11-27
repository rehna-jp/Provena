from sqlalchemy import Column, String, Float, TIMESTAMP
from sqlalchemy.ext.declarative import declarative_base

Base = declarative_base()

class Feedback(Base):
    __tablename__ = "feedback"
    feedback_id = Column(String, primary_key=True)
    product_id = Column(String)
    sentiment = Column(Float)
    comment = Column(String)
    timestamp = Column(TIMESTAMP)
