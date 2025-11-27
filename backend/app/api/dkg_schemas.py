from pydantic import BaseModel, Field
from typing import Optional, Any, Dict

class PublishProductRequest(BaseModel):
    product_json: Dict

class PublishProductResponse(BaseModel):
    ual: str

class AppendEventRequest(BaseModel):
    ual: str
    event_json: Dict

class AppendEventResponse(BaseModel):
    status: str

class QueryAssetRequest(BaseModel):
    ual: str

class QueryAssetResponse(BaseModel):
    asset: Any

class SearchAssetsRequest(BaseModel):
    query_params: Dict

class SearchAssetsResponse(BaseModel):
    results: list
