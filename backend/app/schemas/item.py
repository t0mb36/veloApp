from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field


class ItemBase(BaseModel):
    """Base schema for Item with common attributes."""

    name: str = Field(..., min_length=1, max_length=255)
    description: str | None = Field(default=None)


class ItemCreate(ItemBase):
    """Schema for creating a new Item."""

    is_active: bool = Field(default=True)


class ItemUpdate(BaseModel):
    """Schema for updating an Item. All fields are optional."""

    name: str | None = Field(default=None, min_length=1, max_length=255)
    description: str | None = Field(default=None)
    is_active: bool | None = Field(default=None)


class ItemResponse(ItemBase):
    """Schema for Item API responses."""

    model_config = ConfigDict(from_attributes=True)

    id: UUID
    is_active: bool
    created_at: datetime
    updated_at: datetime


class ItemList(BaseModel):
    """Schema for paginated list of items."""

    items: list[ItemResponse]
    total: int
    skip: int
    limit: int
