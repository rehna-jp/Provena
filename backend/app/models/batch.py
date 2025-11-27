from sqlalchemy import Column, String
from sqlalchemy.ext.declarative import declarative_base

Base = declarative_base()

class Batch(Base):
    __tablename__ = "batches"
    batch_id = Column(String, primary_key=True)
    manufacturer_id = Column(String)
    batch_metadata = Column(String)
