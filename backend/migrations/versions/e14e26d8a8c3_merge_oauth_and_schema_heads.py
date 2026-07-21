"""merge oauth and schema heads

Revision ID: e14e26d8a8c3
Revises: 5840b19c0c45, 8f0376306239
Create Date: 2026-07-21 13:22:39.063712

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'e14e26d8a8c3'
down_revision: Union[str, Sequence[str], None] = ('5840b19c0c45', '8f0376306239')
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    pass


def downgrade() -> None:
    """Downgrade schema."""
    pass
