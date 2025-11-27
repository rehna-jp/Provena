# 0001_initial.py
"""
Initial migration for TrustChain backend tables.
"""
from alembic import op
import sqlalchemy as sa

def upgrade():
    op.create_table(
        'products',
        sa.Column('product_id', sa.String, primary_key=True),
        sa.Column('batch_id', sa.String),
        sa.Column('manufacturer_id', sa.String),
        sa.Column('product_metadata', sa.JSON),
        sa.Column('dkg_ual', sa.String),
        sa.Column('registration_timestamp', sa.TIMESTAMP),
        sa.Column('trust_score', sa.Float),
        sa.Column('status', sa.Enum('VALID', 'WARNING', 'FRAUD_RISK', name='productstatus')),
    )
    op.create_table(
        'events',
        sa.Column('event_id', sa.String, primary_key=True),
        sa.Column('product_id', sa.String),
        sa.Column('timestamp', sa.TIMESTAMP),
        sa.Column('location', sa.JSON),
        sa.Column('temperature', sa.Float),
        sa.Column('humidity', sa.Float),
        sa.Column('handler_id', sa.String),
        sa.Column('event_type', sa.String),
        sa.Column('images', sa.JSON),
        sa.Column('ai_results', sa.JSON),
    )
    op.create_table(
        'ai_results',
        sa.Column('ai_id', sa.String, primary_key=True),
        sa.Column('product_id', sa.String),
        sa.Column('event_id', sa.String),
        sa.Column('validation_output', sa.JSON),
        sa.Column('anomaly_output', sa.JSON),
        sa.Column('fraud_output', sa.JSON),
        sa.Column('trust_score_delta', sa.Float),
        sa.Column('timestamp', sa.TIMESTAMP),
    )
    op.create_table(
        'handlers',
        sa.Column('handler_id', sa.String, primary_key=True),
        sa.Column('name', sa.String),
        sa.Column('contact', sa.String),
    )
    op.create_table(
        'batches',
        sa.Column('batch_id', sa.String, primary_key=True),
        sa.Column('manufacturer_id', sa.String),
        sa.Column('batch_metadata', sa.String),
    )
    op.create_table(
        'feedback',
        sa.Column('feedback_id', sa.String, primary_key=True),
        sa.Column('product_id', sa.String),
        sa.Column('sentiment', sa.Float),
        sa.Column('comment', sa.String),
        sa.Column('timestamp', sa.TIMESTAMP),
    )
    op.create_table(
        'audit_logs',
        sa.Column('log_id', sa.String, primary_key=True),
        sa.Column('action', sa.String),
        sa.Column('actor', sa.String),
        sa.Column('target_id', sa.String),
        sa.Column('timestamp', sa.TIMESTAMP),
    )

def downgrade():
    op.drop_table('audit_logs')
    op.drop_table('feedback')
    op.drop_table('batches')
    op.drop_table('handlers')
    op.drop_table('ai_results')
    op.drop_table('events')
    op.drop_table('products')
