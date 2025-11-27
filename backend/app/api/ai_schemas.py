from pydantic import BaseModel, Field
from typing import Optional, Any

class AIValidateRequest(BaseModel):
    product_data: Any

class AIValidateResponse(BaseModel):
    validation_score: float
    issues: list
    severity_level: str

class AIAnalyzeRequest(BaseModel):
    event_data: Any

class AIAnalyzeResponse(BaseModel):
    anomaly_score: float
    events_flagged: list
    risk_level: str

class AITrustScoreRequest(BaseModel):
    trust_inputs: Any

class AITrustScoreResponse(BaseModel):
    trust_score: float
    breakdown: Optional[Any]
    risk_category: Optional[str]

class AIFraudRequest(BaseModel):
    event_data: Any

class AIFraudResponse(BaseModel):
    fraud_probability: float
    fraud_indicators: list
    recommended_action: str
