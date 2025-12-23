from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.models.item import Item
from app.db.repositories.base import SQLAlchemyRepository
from app.schemas.item import ItemCreate, ItemUpdate


class ItemRepository(SQLAlchemyRepository[Item, ItemCreate, ItemUpdate]):
    """Repository for Item model operations."""

    model = Item

    def __init__(self, session: AsyncSession) -> None:
        super().__init__(session)

    async def get_active(
        self,
        skip: int = 0,
        limit: int = 100,
    ) -> list[Item]:
        """Get all active items."""
        stmt = select(Item).where(Item.is_active.is_(True)).offset(skip).limit(limit)
        result = await self._session.execute(stmt)
        return list(result.scalars().all())

    async def get_by_name(self, name: str) -> Item | None:
        """Get an item by its name."""
        stmt = select(Item).where(Item.name == name)
        result = await self._session.execute(stmt)
        return result.scalar_one_or_none()
