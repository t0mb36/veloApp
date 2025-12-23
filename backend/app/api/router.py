from fastapi import APIRouter

from app.api.routes import health_router, items_router

api_router = APIRouter()

# Include all route modules
api_router.include_router(items_router)

# Health router is mounted at root level, not under API prefix
__all__ = ["api_router", "health_router"]
