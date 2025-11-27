from sqlalchemy import Column, String, Float, Enum, JSON, TIMESTAMP
from sqlalchemy.ext.declarative import declarative_base
import enum

Base = declarative_base()

class ProductStatus(enum.Enum):
    VALID = "VALID"
    WARNING = "WARNING"
    FRAUD_RISK = "FRAUD_RISK"

class Product(Base):
    __tablename__ = "products"
    product_id = Column(String, primary_key=True)
    batch_id = Column(String)
    manufacturer_id = Column(String)
    product_metadata = Column(JSON)
    dkg_ual = Column(String)
    registration_timestamp = Column(TIMESTAMP)
    trust_score = Column(Float)
    status = Column(Enum(ProductStatus))
