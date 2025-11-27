from pydantic import BaseModel, Field
from typing import Optional, Any
from datetime import datetime

class ScanResponse(BaseModel):
    product_id: str
    batch_id: str
    manufacturer_id: str
    trust_score: float
    status: str
    dkg_ual: Optional[str]
    registration_timestamp: datetime
    ai_results: Optional[Any] = None

class TrustScoreResponse(BaseModel):
    product_id: str
    trust_score: float
    breakdown: Optional[Any] = None
    risk_category: Optional[str] = None
