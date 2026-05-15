"""v1.2 features: ai_suggested_category, budgets, chat_messages

Revision ID: b2c4d6e8a1f3
Revises: ea63ff03f4e3
Create Date: 2026-05-14 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "b2c4d6e8a1f3"
down_revision: Union[str, Sequence[str], None] = "ea63ff03f4e3"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column(
        "expenses",
        sa.Column("ai_suggested_category", sa.String(length=50), nullable=True),
    )

    op.create_table(
        "budgets",
        sa.Column("id", sa.Uuid(), nullable=False),
        sa.Column("category", sa.String(length=50), nullable=False),
        sa.Column("monthly_limit", sa.Float(), nullable=False),
        sa.Column("year", sa.Integer(), nullable=False),
        sa.Column("month", sa.Integer(), nullable=False),
        sa.Column("created_at", sa.DateTime(), server_default=sa.text("now()"), nullable=False),
        sa.Column("updated_at", sa.DateTime(), server_default=sa.text("now()"), nullable=False),
        sa.PrimaryKeyConstraint("id"),
    )

    op.create_table(
        "chat_messages",
        sa.Column("id", sa.Uuid(), nullable=False),
        sa.Column("role", sa.String(length=20), nullable=False),
        sa.Column("content", sa.Text(), nullable=False),
        sa.Column("created_at", sa.DateTime(), server_default=sa.text("now()"), nullable=False),
        sa.PrimaryKeyConstraint("id"),
    )


def downgrade() -> None:
    op.drop_table("chat_messages")
    op.drop_table("budgets")
    op.drop_column("expenses", "ai_suggested_category")
