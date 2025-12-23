from uuid import UUID

from app.db.models.item import Item
from app.db.repositories.item import ItemRepository
from app.schemas.item import ItemCreate, ItemUpdate


class ItemService:
    """Service layer for Item business logic.

    This layer sits between the API routes and the repository,
    handling business logic and validation.
    """

    def __init__(self, repository: ItemRepository) -> None:
        self._repository = repository

    async def get_item(self, item_id: UUID) -> Item | None:
        """Get a single item by ID."""
        return await self._repository.get_by_id(item_id)

    async def get_items(
        self,
        skip: int = 0,
        limit: int = 100,
        active_only: bool = False,
    ) -> list[Item]:
        """Get all items with optional filtering."""
        if active_only:
            return await self._repository.get_active(skip=skip, limit=limit)
        return await self._repository.get_all(skip=skip, limit=limit)

    async def create_item(self, data: ItemCreate) -> Item:
        """Create a new item."""
        return await self._repository.create(data)

    async def update_item(
        self,
        item_id: UUID,
        data: ItemUpdate,
    ) -> Item | None:
        """Update an existing item."""
        return await self._repository.update(item_id, data)

    async def delete_item(self, item_id: UUID) -> bool:
        """Delete an item by ID."""
        return await self._repository.delete(item_id)

    async def get_item_by_name(self, name: str) -> Item | None:
        """Get an item by its name."""
        return await self._repository.get_by_name(name)
