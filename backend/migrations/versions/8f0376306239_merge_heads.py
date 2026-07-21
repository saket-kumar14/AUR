"""Merge heads

Revision ID: 8f0376306239
Revises: 4c84a8a9bb34, a3f7c9e21b4d
Create Date: 2026-07-21 08:40:57.412692

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '8f0376306239'
down_revision: Union[str, Sequence[str], None] = ('4c84a8a9bb34', 'a3f7c9e21b4d')
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    pass


def downgrade() -> None:
    """Downgrade schema."""
    pass
