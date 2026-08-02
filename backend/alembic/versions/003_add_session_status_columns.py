"""create session pipeline status columns

Revision ID: 003_session_status
Revises: 002_speech_pipeline
Create Date: 2026-08-02

"""

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = "003_session_status"
down_revision: Union[str, None] = "002_speech_pipeline"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column(
        "speech_sessions",
        sa.Column("status", sa.String(length=32), server_default="processing", nullable=False),
    )
    op.add_column(
        "speech_sessions",
        sa.Column("failed_step", sa.String(length=32), nullable=True),
    )
    op.add_column(
        "speech_sessions",
        sa.Column("pipeline_error", sa.Text(), nullable=True),
    )
    op.execute("UPDATE speech_sessions SET status = 'completed' WHERE status = 'processing'")


def downgrade() -> None:
    op.drop_column("speech_sessions", "pipeline_error")
    op.drop_column("speech_sessions", "failed_step")
    op.drop_column("speech_sessions", "status")
