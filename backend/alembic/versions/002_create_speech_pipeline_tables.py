"""create speech pipeline tables

Revision ID: 002_speech_pipeline
Revises: 001_users
Create Date: 2026-08-02

"""

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql

revision: str = "002_speech_pipeline"
down_revision: Union[str, None] = "001_users"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "speech_sessions",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("user_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("transcript", sa.Text(), nullable=True),
        sa.Column("audio_path", sa.String(length=512), nullable=False),
        sa.Column("duration", sa.Float(), nullable=False),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
    )
    op.create_index("ix_speech_sessions_user_id", "speech_sessions", ["user_id"])

    op.create_table(
        "analysis_results",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("session_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("fluency_score", sa.Float(), nullable=False),
        sa.Column("speaking_rate", sa.Float(), nullable=False),
        sa.Column("pause_count", sa.Integer(), nullable=False),
        sa.Column("repetitions", postgresql.JSONB(), nullable=False),
        sa.Column("filler_words", postgresql.JSONB(), nullable=False),
        sa.Column("strengths", postgresql.JSONB(), nullable=False),
        sa.Column("recommendations", postgresql.JSONB(), nullable=False),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.ForeignKeyConstraint(
            ["session_id"], ["speech_sessions.id"], ondelete="CASCADE"
        ),
        sa.UniqueConstraint("session_id"),
    )

    op.create_table(
        "practice_lessons",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("session_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("generated_lesson", postgresql.JSONB(), nullable=False),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.ForeignKeyConstraint(
            ["session_id"], ["speech_sessions.id"], ondelete="CASCADE"
        ),
        sa.UniqueConstraint("session_id"),
    )


def downgrade() -> None:
    op.drop_table("practice_lessons")
    op.drop_table("analysis_results")
    op.drop_index("ix_speech_sessions_user_id", table_name="speech_sessions")
    op.drop_table("speech_sessions")
