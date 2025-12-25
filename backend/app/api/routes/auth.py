"""Authentication routes for Firebase session-based auth.

This module implements secure session-based authentication using Firebase:
1. POST /auth/session-login - Exchange Firebase ID token for session cookie
2. POST /auth/session-logout - Clear session cookie
3. GET /auth/me - Get current authenticated user's profile

Security design:
- Session cookies are HttpOnly (not accessible to JavaScript)
- Cookies are SameSite=Lax (CSRF protection for most cases)
- Secure flag based on DEBUG setting (true in production)
- No tokens stored in localStorage/sessionStorage (XSS protection)
"""

from fastapi import APIRouter, HTTPException, Response, status

from app.api.deps import CurrentUserDep, UserRepositoryDep
from app.core.config import get_settings
from app.core.firebase import (
    FirebaseNotConfiguredError,
    create_session_cookie,
    verify_id_token,
)
from app.schemas.user import (
    SessionLoginRequest,
    SessionLoginResponse,
    SessionLogoutResponse,
    UserResponse,
)

router = APIRouter(prefix="/auth", tags=["auth"])

# Cookie name must be __session for Firebase Hosting compatibility
SESSION_COOKIE_NAME = "__session"


@router.post("/session-login", response_model=SessionLoginResponse)
async def session_login(
    request: SessionLoginRequest,
    response: Response,
) -> SessionLoginResponse:
    """Exchange a Firebase ID token for a session cookie.

    The client authenticates with Firebase (e.g., email/password, Google, etc.)
    and receives an ID token. This endpoint exchanges that short-lived token
    for a longer-lived session cookie.

    Args:
        request: Contains the Firebase ID token.
        response: FastAPI response object for setting cookies.

    Returns:
        SessionLoginResponse with status "ok".

    Raises:
        HTTPException 503: If Firebase is not configured.
        HTTPException 401: If the ID token is invalid or expired.
    """
    settings = get_settings()

    try:
        # Verify the ID token first to ensure it's valid
        # This also prevents replay attacks with old tokens
        verify_id_token(request.id_token)

        # Calculate session cookie expiration
        expires_in_seconds = settings.session_cookie_expiry_days * 24 * 60 * 60

        # Create the session cookie
        session_cookie = create_session_cookie(
            request.id_token,
            expires_in_seconds=expires_in_seconds,
        )
    except FirebaseNotConfiguredError:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Authentication service is not configured",
        )
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
        )

    # Set the session cookie on the response
    # Security settings:
    # - HttpOnly: Prevents JavaScript access (XSS protection)
    # - SameSite=Lax: CSRF protection while allowing normal navigation
    # - Secure: Only send over HTTPS (disabled in debug mode for localhost)
    # - Path=/: Cookie available for all routes
    response.set_cookie(
        key=SESSION_COOKIE_NAME,
        value=session_cookie,
        max_age=expires_in_seconds,
        httponly=True,
        samesite="lax",
        secure=not settings.debug,  # Secure=false for localhost in debug mode
        path="/",
    )

    return SessionLoginResponse(status="ok")


@router.post("/session-logout", response_model=SessionLogoutResponse)
async def session_logout(response: Response) -> SessionLogoutResponse:
    """Clear the session cookie to log out the user.

    This endpoint clears the session cookie by setting an empty value
    with max_age=0, which instructs the browser to delete it.

    Note: This does not revoke the session on Firebase's side. For
    additional security (e.g., password change), call Firebase Admin
    SDK's revoke_refresh_tokens() separately.

    Args:
        response: FastAPI response object for clearing cookies.

    Returns:
        SessionLogoutResponse with status "ok".
    """
    settings = get_settings()

    # Clear the cookie by setting empty value and max_age=0
    response.set_cookie(
        key=SESSION_COOKIE_NAME,
        value="",
        max_age=0,
        httponly=True,
        samesite="lax",
        secure=not settings.debug,
        path="/",
    )

    return SessionLogoutResponse(status="ok")


@router.get("/me", response_model=UserResponse)
async def get_me(
    current_user: CurrentUserDep,
    user_repo: UserRepositoryDep,
) -> UserResponse:
    """Get the current authenticated user's profile.

    This endpoint requires authentication via the session cookie.
    It performs an upsert operation to ensure the local user record
    is synchronized with Firebase (email, display name may have changed).

    Args:
        current_user: Decoded Firebase token from session cookie.
        user_repo: User repository for database operations.

    Returns:
        UserResponse with the user's local profile information.
    """
    # Upsert user from Firebase token
    # This creates the user if they don't exist, or updates their profile
    user = await user_repo.upsert_from_firebase(current_user)

    return UserResponse.model_validate(user)
