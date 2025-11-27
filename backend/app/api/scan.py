
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.dependencies import get_db
from app.models.product import Product as ProductModel
from app.models.ai_result import AIResult as AIResultModel
from app.api.scan_schemas import ScanResponse, TrustScoreResponse

router = APIRouter(tags=["Scan"])

@router.get("/scan/{product_id}", response_model=ScanResponse)
def scan_product(product_id: str, db: Session = Depends(get_db)):
    """Fetch product and latest AI results for consumer scan."""
    db_product = db.query(ProductModel).filter(ProductModel.product_id == product_id).first()
    if not db_product:
        raise HTTPException(status_code=404, detail="Product not found")
    ai_result = db.query(AIResultModel).filter(AIResultModel.product_id == product_id).order_by(AIResultModel.timestamp.desc()).first()
    return ScanResponse(
        product_id=db_product.product_id,
        batch_id=db_product.batch_id,
        manufacturer_id=db_product.manufacturer_id,
        trust_score=db_product.trust_score,
        status=db_product.status,
        dkg_ual=db_product.dkg_ual,
        registration_timestamp=db_product.registration_timestamp,
        ai_results={
            "validation_output": ai_result.validation_output if ai_result else None,
            "anomaly_output": ai_result.anomaly_output if ai_result else None,
            "fraud_output": ai_result.fraud_output if ai_result else None,
            "trust_score_delta": ai_result.trust_score_delta if ai_result else None,
            "timestamp": ai_result.timestamp if ai_result else None,
        } if ai_result else None
    )

@router.get("/scan/{product_id}/trust", response_model=TrustScoreResponse)
def scan_product_trust(product_id: str, db: Session = Depends(get_db)):
    """Fetch trust score and breakdown for a product."""
    db_product = db.query(ProductModel).filter(ProductModel.product_id == product_id).first()
    if not db_product:
        raise HTTPException(status_code=404, detail="Product not found")
    ai_result = db.query(AIResultModel).filter(AIResultModel.product_id == product_id).order_by(AIResultModel.timestamp.desc()).first()
    breakdown = None
    risk_category = None
    if ai_result and ai_result.validation_output:
        breakdown = ai_result.validation_output.get("breakdown")
        risk_category = ai_result.validation_output.get("risk_category")
    return TrustScoreResponse(
        product_id=db_product.product_id,
        trust_score=db_product.trust_score,
        breakdown=breakdown,
        risk_category=risk_category
    )
