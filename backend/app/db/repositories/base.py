from abc import ABC, abstractmethod
from typing import Generic, TypeVar
from uuid import UUID

from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.models.base import Base

ModelType = TypeVar("ModelType", bound=Base)
CreateSchemaType = TypeVar("CreateSchemaType", bound=BaseModel)
UpdateSchemaType = TypeVar("UpdateSchemaType", bound=BaseModel)


class IRepository(ABC, Generic[ModelType, CreateSchemaType, UpdateSchemaType]):
    """Abstract base repository interface.

    This interface defines the contract for all repositories,
    allowing for easy swapping of database implementations.
    """

    @abstractmethod
    async def get_by_id(self, id: UUID) -> ModelType | None:
        """Get a single entity by ID."""
        ...

    @abstractmethod
    async def get_all(
        self,
        skip: int = 0,
        limit: int = 100,
    ) -> list[ModelType]:
        """Get all entities with pagination."""
        ...

    @abstractmethod
    async def create(self, data: CreateSchemaType) -> ModelType:
        """Create a new entity."""
        ...

    @abstractmethod
    async def update(
        self,
        id: UUID,
        data: UpdateSchemaType,
    ) -> ModelType | None:
        """Update an existing entity."""
        ...

    @abstractmethod
    async def delete(self, id: UUID) -> bool:
        """Delete an entity by ID."""
        ...


class SQLAlchemyRepository(
    IRepository[ModelType, CreateSchemaType, UpdateSchemaType],
    Generic[ModelType, CreateSchemaType, UpdateSchemaType],
):
    """Base SQLAlchemy repository implementation.

    Provides common CRUD operations for SQLAlchemy models.
    """

    model: type[ModelType]

    def __init__(self, session: AsyncSession) -> None:
        self._session = session

    async def get_by_id(self, id: UUID) -> ModelType | None:
        """Get a single entity by ID."""
        return await self._session.get(self.model, id)

    async def get_all(
        self,
        skip: int = 0,
        limit: int = 100,
    ) -> list[ModelType]:
        """Get all entities with pagination."""
        stmt = select(self.model).offset(skip).limit(limit)
        result = await self._session.execute(stmt)
        return list(result.scalars().all())

    async def create(self, data: CreateSchemaType) -> ModelType:
        """Create a new entity."""
        db_obj = self.model(**data.model_dump())
        self._session.add(db_obj)
        await self._session.flush()
        await self._session.refresh(db_obj)
        return db_obj

    async def update(
        self,
        id: UUID,
        data: UpdateSchemaType,
    ) -> ModelType | None:
        """Update an existing entity."""
        db_obj = await self.get_by_id(id)
        if db_obj is None:
            return None

        update_data = data.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_obj, field, value)

        await self._session.flush()
        await self._session.refresh(db_obj)
        return db_obj

    async def delete(self, id: UUID) -> bool:
        """Delete an entity by ID."""
        db_obj = await self.get_by_id(id)
        if db_obj is None:
            return False

        await self._session.delete(db_obj)
        await self._session.flush()
        return True
