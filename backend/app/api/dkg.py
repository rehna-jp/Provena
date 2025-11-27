from fastapi import APIRouter, HTTPException
from app.api.dkg_schemas import (
    PublishProductRequest, PublishProductResponse,
    AppendEventRequest, AppendEventResponse,
    QueryAssetRequest, QueryAssetResponse,
    SearchAssetsRequest, SearchAssetsResponse
)
from app.services.dkg import dkg_service

router = APIRouter(tags=["DKG"])

@router.post("/dkg/publish", response_model=PublishProductResponse)
def publish_product_asset(request: PublishProductRequest):
    """Publish product asset to DKG."""
    try:
        result = dkg_service.publish_product_asset(request.product_json)
        return PublishProductResponse(**result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/dkg/append", response_model=AppendEventResponse)
def append_event_to_asset(request: AppendEventRequest):
    """Append event to DKG asset."""
    try:
        result = dkg_service.append_event_to_asset(request.ual, request.event_json)
        return AppendEventResponse(**result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/dkg/query", response_model=QueryAssetResponse)
def query_asset(request: QueryAssetRequest):
    """Query DKG asset by UAL."""
    try:
        result = dkg_service.query_asset(request.ual)
        return QueryAssetResponse(**result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/dkg/search", response_model=SearchAssetsResponse)
def search_assets(request: SearchAssetsRequest):
    """Search DKG assets by query params."""
    try:
        result = dkg_service.search_assets(request.query_params)
        return SearchAssetsResponse(**result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
