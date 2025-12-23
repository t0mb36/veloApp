from uuid import UUID

from fastapi import APIRouter, HTTPException, Query, status

from app.api.deps import ItemServiceDep
from app.schemas.item import ItemCreate, ItemResponse, ItemUpdate

router = APIRouter(prefix="/items", tags=["items"])


@router.get(
    "",
    response_model=list[ItemResponse],
    summary="List Items",
    description="Retrieve a list of items with optional pagination and filtering.",
)
async def list_items(
    service: ItemServiceDep,
    skip: int = Query(default=0, ge=0, description="Number of items to skip"),
    limit: int = Query(default=100, ge=1, le=100, description="Max items to return"),
    active_only: bool = Query(default=False, description="Filter to active items only"),
) -> list[ItemResponse]:
    """List all items."""
    items = await service.get_items(skip=skip, limit=limit, active_only=active_only)
    return [ItemResponse.model_validate(item) for item in items]


@router.get(
    "/{item_id}",
    response_model=ItemResponse,
    summary="Get Item",
    description="Retrieve a single item by its ID.",
)
async def get_item(
    item_id: UUID,
    service: ItemServiceDep,
) -> ItemResponse:
    """Get a single item by ID."""
    item = await service.get_item(item_id)
    if item is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Item with id '{item_id}' not found",
        )
    return ItemResponse.model_validate(item)


@router.post(
    "",
    response_model=ItemResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create Item",
    description="Create a new item.",
)
async def create_item(
    data: ItemCreate,
    service: ItemServiceDep,
) -> ItemResponse:
    """Create a new item."""
    item = await service.create_item(data)
    return ItemResponse.model_validate(item)


@router.patch(
    "/{item_id}",
    response_model=ItemResponse,
    summary="Update Item",
    description="Update an existing item. Only provided fields will be updated.",
)
async def update_item(
    item_id: UUID,
    data: ItemUpdate,
    service: ItemServiceDep,
) -> ItemResponse:
    """Update an existing item."""
    item = await service.update_item(item_id, data)
    if item is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Item with id '{item_id}' not found",
        )
    return ItemResponse.model_validate(item)


@router.delete(
    "/{item_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete Item",
    description="Delete an item by its ID.",
)
async def delete_item(
    item_id: UUID,
    service: ItemServiceDep,
) -> None:
    """Delete an item by ID."""
    deleted = await service.delete_item(item_id)
    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Item with id '{item_id}' not found",
        )
