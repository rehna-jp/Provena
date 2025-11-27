from fastapi import APIRouter

router = APIRouter()

@router.post("/internal/blockchain/eventConfirmed")
def blockchain_event_confirmed():
    return {"message": "Blockchain event confirmed endpoint"}

@router.post("/internal/blockchain/reputationUpdated")
def blockchain_reputation_updated():
    return {"message": "Blockchain reputation updated endpoint"}
