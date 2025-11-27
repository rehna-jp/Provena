from pydantic import BaseModel, Field
from typing import Optional, Any
from enum import Enum
from datetime import datetime

class ProductStatus(str, Enum):
    VALID = "VALID"
    WARNING = "WARNING"
    FRAUD_RISK = "FRAUD_RISK"

class ProductBase(BaseModel):
    batch_id: str
    manufacturer_id: str
    product_metadata: Any
    dkg_ual: Optional[str] = None
    trust_score: Optional[float] = None
    status: Optional[ProductStatus] = ProductStatus.VALID

class ProductCreate(ProductBase):
    pass

class ProductRead(ProductBase):
    product_id: str
    registration_timestamp: datetime

    class Config:
        orm_mode = True
