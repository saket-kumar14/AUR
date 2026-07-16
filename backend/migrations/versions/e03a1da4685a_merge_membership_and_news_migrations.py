"""merge membership and news migrations

Revision ID: e03a1da4685a
Revises: b33bca849d48, 99e58e9e4b24
Create Date: 2026-07-10 23:18:16.553385

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'e03a1da4685a'
down_revision: Union[str, Sequence[str], None] = ('b33bca849d48', '99e58e9e4b24')
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    pass


def downgrade() -> None:
    """Downgrade schema."""
    pass
