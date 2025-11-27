from sqlalchemy import Column, String, TIMESTAMP
from sqlalchemy.ext.declarative import declarative_base

Base = declarative_base()

class AuditLog(Base):
    __tablename__ = "audit_logs"
    log_id = Column(String, primary_key=True)
    action = Column(String)
    actor = Column(String)
    target_id = Column(String)
    timestamp = Column(TIMESTAMP)
