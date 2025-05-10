"""add uploader_id to papers

Revision ID: 7184abe06aab
Revises: 4079afc1fb65
Create Date: 2025-05-10 23:59:31.980061

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = '7184abe06aab'
down_revision: Union[str, None] = '4079afc1fb65'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # 正確：只新增 uploader_id 欄位
    op.add_column('papers', sa.Column('uploader_id', sa.Integer(), nullable=True))
    op.create_foreign_key(
        'fk_papers_uploader_id_users',
        'papers', 'users',
        ['uploader_id'], ['id'],
        ondelete='SET NULL'
    )

def downgrade() -> None:
    """Downgrade schema."""
    op.drop_constraint('fk_papers_uploader_id_users', 'papers', type_='foreignkey')
    op.drop_column('papers', 'uploader_id')
