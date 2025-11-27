from sqlalchemy import Column, String
from sqlalchemy.ext.declarative import declarative_base

Base = declarative_base()

class Handler(Base):
    __tablename__ = "handlers"
    handler_id = Column(String, primary_key=True)
    name = Column(String)
    contact = Column(String)
