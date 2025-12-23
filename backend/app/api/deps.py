from collections.abc import AsyncGenerator
from typing import Annotated

from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.repositories.item import ItemRepository
from app.db.session import get_session
from app.services.item import ItemService


async def get_item_repository(
    session: Annotated[AsyncSession, Depends(get_session)],
) -> AsyncGenerator[ItemRepository, None]:
    """Dependency for getting ItemRepository instance."""
    yield ItemRepository(session)


async def get_item_service(
    repository: Annotated[ItemRepository, Depends(get_item_repository)],
) -> AsyncGenerator[ItemService, None]:
    """Dependency for getting ItemService instance."""
    yield ItemService(repository)


# Type aliases for cleaner route signatures
SessionDep = Annotated[AsyncSession, Depends(get_session)]
ItemRepositoryDep = Annotated[ItemRepository, Depends(get_item_repository)]
ItemServiceDep = Annotated[ItemService, Depends(get_item_service)]
