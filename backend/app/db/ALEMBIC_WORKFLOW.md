# Alembic Migration Workflow for TrustChain Backend

This guide explains how to use Alembic for managing PostgreSQL database migrations in the TrustChain backend.

## 1. Prerequisites
- Ensure PostgreSQL is running and accessible.
- Update `DATABASE_URL` in `app/db/session.py` to match your environment.
- Install dependencies:
  ```sh
  pip install -r requirements.txt
  ```

## 2. Running Migrations

### a. Initialize Alembic (if not already done)
If you need to re-initialize Alembic:
```sh
alembic init alembic
```

### b. Apply Existing Migrations
To apply all migrations and create the database schema:
```sh
alembic upgrade head
```

### c. Create a New Migration
If you change models and need a new migration:
```sh
alembic revision --autogenerate -m "Describe your change"
alembic upgrade head
```

### d. Downgrade (Rollback)
To revert the last migration:
```sh
alembic downgrade -1
```

## 3. Migration Scripts
- Migration scripts are in `backend/app/db/` (e.g., `migrations_0001_initial.py`).
- Edit or add scripts as needed for schema changes.

## 4. Troubleshooting
- Ensure the database URL is correct.
- Check Alembic logs for errors.
- For manual DB inspection, use `psql` or a GUI like DBeaver.

---
For more, see the [Alembic documentation](https://alembic.sqlalchemy.org/en/latest/).
