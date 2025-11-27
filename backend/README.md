# TrustChain Backend

Production-ready backend for the TrustChain platform, providing secure APIs, AI/ML validation, DKG integration, and robust data management.

## Features
- FastAPI-based REST API
- PostgreSQL with SQLAlchemy ORM
- Alembic migrations
- Redis caching (optional)
- Modular AI/ML service integration
- OriginTrail DKG asset management
- Production error handling & logging

## Folder Structure
```
backend/
 ├── app/
 │    ├── api/           # API route modules
 │    ├── services/      # Business logic & integrations
 │    ├── models/        # SQLAlchemy models
 │    ├── db/            # DB session, migrations, docs
 │    ├── utils/         # Utilities (error handling, etc.)
 ├── ai/                 # AI/ML models, pipelines, notebooks
 ├── tests/              # Test cases
 ├── docker/             # Dockerfile, compose, etc.
 └── docs/               # Documentation
```

## Setup
1. Clone the repo and navigate to `backend/`.
2. Install dependencies:
   ```sh
   pip install -r requirements.txt
   ```
3. Configure your PostgreSQL database and update `DATABASE_URL` in `app/db/session.py`.
4. Run Alembic migrations:
   ```sh
   alembic upgrade head
   ```
5. Start the API server:
   ```sh
   uvicorn app.main:app --reload
   ```

## API Endpoints
- `/product/register` - Register a new product
- `/product/{product_id}` - Get product details
- `/product/{product_id}/timeline` - Get product timeline
- `/checkpoint/submit` - Submit a checkpoint/event
- `/checkpoint/batch` - Submit batch events
- `/scan/{product_id}` - Consumer scan (product + AI results)
- `/scan/{product_id}/trust` - Get trust score
- `/ai/validate` - AI validation
- `/ai/analyze` - AI anomaly detection
- `/ai/trustscore` - Trust score computation
- `/ai/fraud` - Fraud detection
- `/dkg/publish` - Publish asset to DKG
- `/dkg/append` - Append event to DKG asset
- `/dkg/query` - Query DKG asset
- `/dkg/search` - Search DKG assets

See the OpenAPI docs at `/docs` after starting the server.

## Testing
- Add and run tests in the `tests/` directory.

## Alembic Migrations
See `app/db/ALEMBIC_WORKFLOW.md` for migration instructions.

## License
MIT
