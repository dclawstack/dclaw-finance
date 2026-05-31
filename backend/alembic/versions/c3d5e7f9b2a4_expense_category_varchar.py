"""expand expense category to varchar 100

Revision ID: c3d5e7f9b2a4
Revises: b2c4d6e8a1f3
Create Date: 2026-05-31 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "c3d5e7f9b2a4"
down_revision: Union[str, Sequence[str], None] = "b2c4d6e8a1f3"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.execute(
        "ALTER TABLE expenses ALTER COLUMN category TYPE VARCHAR(100) USING category::text"
    )
    op.execute("DROP TYPE IF EXISTS expense_category")


def downgrade() -> None:
    # Restore to 6-value enum; rows with unknown categories mapped to 'other'
    op.execute(
        "CREATE TYPE expense_category AS ENUM "
        "('office','travel','software','marketing','salary','other')"
    )
    op.execute(
        "ALTER TABLE expenses ALTER COLUMN category TYPE expense_category "
        "USING CASE WHEN category IN ('office','travel','software','marketing','salary','other') "
        "THEN category::expense_category ELSE 'other'::expense_category END"
    )
