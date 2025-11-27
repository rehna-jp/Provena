# TrustChain Backend API Overview

This document provides an overview of the main API endpoints, their purpose, and example requests/responses. For full OpenAPI docs, visit `/docs` after running the server.

## Product Endpoints
- `POST /product/register` — Register a new product
- `GET /product/{product_id}` — Get product details
- `GET /product/{product_id}/timeline` — Get product timeline

## Checkpoint/Event Endpoints
- `POST /checkpoint/submit` — Submit a single event
- `POST /checkpoint/batch` — Submit multiple events

## Consumer Scan Endpoints
- `GET /scan/{product_id}` — Get product and AI results
- `GET /scan/{product_id}/trust` — Get trust score and breakdown

## AI/ML Endpoints
- `POST /ai/validate` — Validate product data (TensorFlow model)
- `POST /ai/analyze` — Anomaly detection
- `POST /ai/trustscore` — Trust score computation
- `POST /ai/fraud` — Fraud detection

## DKG Endpoints
- `POST /dkg/publish` — Publish product asset to DKG
- `POST /dkg/append` — Append event to DKG asset
- `POST /dkg/query` — Query DKG asset by UAL
- `POST /dkg/search` — Search DKG assets

---
For request/response schemas, see the OpenAPI docs or the `app/api/` schemas.
