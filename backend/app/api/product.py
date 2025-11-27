
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.dependencies import get_db
from app.models.product import Product as ProductModel
from app.api.schemas import ProductCreate, ProductRead
from datetime import datetime

router = APIRouter(tags=["Product"])

@router.post("/product/register", response_model=ProductRead, status_code=status.HTTP_201_CREATED)
def register_product(product: ProductCreate, db: Session = Depends(get_db)):
    """Register a new product."""
    db_product = ProductModel(
        product_id=f"prod-{int(datetime.utcnow().timestamp())}",
        batch_id=product.batch_id,
        manufacturer_id=product.manufacturer_id,
        product_metadata=product.metadata,
        dkg_ual=product.dkg_ual,
        registration_timestamp=datetime.utcnow(),
        trust_score=product.trust_score or 0.0,
        status=product.status.value if product.status else "VALID"
    )
    db.add(db_product)
    db.commit()
    db.refresh(db_product)
    return db_product

@router.get("/product/{product_id}", response_model=ProductRead)
def get_product(product_id: str, db: Session = Depends(get_db)):
    """Get product details by product_id."""
    db_product = db.query(ProductModel).filter(ProductModel.product_id == product_id).first()
    if not db_product:
        raise HTTPException(status_code=404, detail="Product not found")
    return db_product

@router.get("/product/{product_id}/timeline")
def get_product_timeline(product_id: str):
    """Get product timeline (stub)."""
    # TODO: Implement timeline logic
    return {"message": f"Get timeline for product {product_id}"}
