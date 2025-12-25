from collections.abc import AsyncGenerator
from typing import Annotated

from fastapi import Cookie, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.firebase import FirebaseNotConfiguredError, verify_session_cookie
from app.db.repositories.item import ItemRepository
from app.db.repositories.user import UserRepository
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


async def get_user_repository(
    session: Annotated[AsyncSession, Depends(get_session)],
) -> AsyncGenerator[UserRepository, None]:
    """Dependency for getting UserRepository instance."""
    yield UserRepository(session)


async def get_current_user(
    __session: Annotated[str | None, Cookie(alias="__session")] = None,
) -> dict:
    """Dependency for authenticating the current user via session cookie.

    Reads the __session cookie, verifies it with Firebase Admin SDK,
    and returns the decoded token containing user information.

    Security notes:
    - Session cookies are HttpOnly, preventing XSS access
    - Cookies are verified server-side with Firebase Admin SDK
    - Revocation checking is enabled to catch invalidated sessions

    Args:
        __session: The Firebase session cookie value from the request.

    Returns:
        dict: Decoded Firebase token with uid, email, and other claims.

    Raises:
        HTTPException 503: If Firebase is not configured.
        HTTPException 401: If cookie is missing, invalid, or expired.
    """
    if not __session:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
        )

    try:
        # Verify the session cookie and check if it's been revoked
        decoded_token = verify_session_cookie(__session, check_revoked=True)
        return decoded_token
    except FirebaseNotConfiguredError:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Authentication service is not configured",
        )
    except Exception:
        # Catch all Firebase auth exceptions (invalid, expired, revoked)
        # We don't expose the specific error to prevent information leakage
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired session",
        )


# Type aliases for cleaner route signatures
SessionDep = Annotated[AsyncSession, Depends(get_session)]
ItemRepositoryDep = Annotated[ItemRepository, Depends(get_item_repository)]
ItemServiceDep = Annotated[ItemService, Depends(get_item_service)]
UserRepositoryDep = Annotated[UserRepository, Depends(get_user_repository)]
CurrentUserDep = Annotated[dict, Depends(get_current_user)]
