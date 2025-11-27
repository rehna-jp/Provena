
from fastapi import APIRouter, HTTPException
from app.api.ai_schemas import (
    AIValidateRequest, AIValidateResponse,
    AIAnalyzeRequest, AIAnalyzeResponse,
    AITrustScoreRequest, AITrustScoreResponse,
    AIFraudRequest, AIFraudResponse
)
from app.services.ai import validation, anomaly, trust, fraud

router = APIRouter(tags=["AI/ML"])

@router.post("/ai/validate", response_model=AIValidateResponse)
def ai_validate(request: AIValidateRequest):
    """Run validation engine on product data."""
    try:
        result = validation.validate_product_data(request.product_data)
        return AIValidateResponse(**result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/ai/analyze", response_model=AIAnalyzeResponse)
def ai_analyze(request: AIAnalyzeRequest):
    """Run anomaly detection on event data."""
    try:
        result = anomaly.detect_anomalies(request.event_data)
        return AIAnalyzeResponse(**result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/ai/trustscore", response_model=AITrustScoreResponse)
def ai_trustscore(request: AITrustScoreRequest):
    """Compute trust score from inputs."""
    try:
        result = trust.compute_trust_score(request.trust_inputs)
        return AITrustScoreResponse(**result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/ai/anomaly", response_model=AIAnalyzeResponse)
def ai_anomaly(request: AIAnalyzeRequest):
    """Alias for anomaly detection."""
    try:
        result = anomaly.detect_anomalies(request.event_data)
        return AIAnalyzeResponse(**result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/ai/fraud", response_model=AIFraudResponse)
def ai_fraud(request: AIFraudRequest):
    """Run fraud detection on event data."""
    try:
        result = fraud.detect_fraud(request.event_data)
        return AIFraudResponse(**result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
