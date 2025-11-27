
from fastapi import FastAPI
from app.api.product import router as product_router
from app.api.checkpoint import router as checkpoint_router
from app.api.scan import router as scan_router
from app.api.ai import router as ai_router

from app.api.internal import router as internal_router
from app.api.dkg import router as dkg_router


import logging
from app.utils.error_handlers import add_global_exception_handlers

app = FastAPI(title="TrustChain Backend API", version="1.0.0", description="Production-ready backend for TrustChain platform.")
add_global_exception_handlers(app)
logging.getLogger("trustchain").info("TrustChain API started.")

app.include_router(product_router)
app.include_router(checkpoint_router)
app.include_router(scan_router)
app.include_router(ai_router)

app.include_router(internal_router)
app.include_router(dkg_router)

@app.get("/", tags=["Health"])
def read_root():
    """Health check endpoint."""
    return {"message": "TrustChain Backend API is running."}
