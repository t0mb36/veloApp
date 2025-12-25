"""Firebase Admin SDK initialization.

This module handles the initialization of Firebase Admin SDK with credentials
loaded from environment variables. The initialization is idempotent - if the
SDK is already initialized, it will return the existing app instance.
"""

import firebase_admin
from firebase_admin import auth, credentials

from app.core.config import get_settings


class FirebaseNotConfiguredError(Exception):
    """Raised when Firebase credentials are not configured."""

    def __init__(self) -> None:
        super().__init__(
            "Firebase is not configured. Set FIREBASE_PROJECT_ID, "
            "FIREBASE_CLIENT_EMAIL, and FIREBASE_PRIVATE_KEY environment variables."
        )


def get_firebase_app() -> firebase_admin.App:
    """Get or initialize the Firebase Admin app.

    Returns the existing Firebase app if already initialized,
    otherwise initializes a new one with credentials from settings.

    Returns:
        firebase_admin.App: The Firebase Admin app instance.

    Raises:
        FirebaseNotConfiguredError: If Firebase credentials are not set.
    """
    # Check if Firebase is already initialized
    try:
        return firebase_admin.get_app()
    except ValueError:
        # App not initialized, proceed with initialization
        pass

    settings = get_settings()

    # Check if Firebase is configured
    if not settings.firebase_configured:
        raise FirebaseNotConfiguredError()

    # Build credentials from environment variables
    # This approach allows credentials to be stored in environment variables
    # rather than requiring a service account JSON file
    cred = credentials.Certificate(
        {
            "type": "service_account",
            "project_id": settings.firebase_project_id,
            "private_key": settings.firebase_private_key,
            "client_email": settings.firebase_client_email,
            # These fields are required by the SDK but can use placeholder values
            # when constructing credentials from environment variables
            "private_key_id": "",
            "client_id": "",
            "auth_uri": "https://accounts.google.com/o/oauth2/auth",
            "token_uri": "https://oauth2.googleapis.com/token",
        }
    )

    return firebase_admin.initialize_app(cred)


def verify_id_token(id_token: str) -> dict:
    """Verify a Firebase ID token.

    Args:
        id_token: The Firebase ID token to verify.

    Returns:
        dict: The decoded token containing user information (uid, email, etc.).

    Raises:
        firebase_admin.auth.InvalidIdTokenError: If the token is invalid.
        firebase_admin.auth.ExpiredIdTokenError: If the token has expired.
        firebase_admin.auth.RevokedIdTokenError: If the token has been revoked.
    """
    # Ensure Firebase is initialized
    get_firebase_app()
    return auth.verify_id_token(id_token)


def create_session_cookie(id_token: str, expires_in_seconds: int) -> str:
    """Create a Firebase session cookie from an ID token.

    Session cookies are more secure than ID tokens for server-side session
    management as they have longer expiration times and can be revoked.

    Args:
        id_token: The Firebase ID token to exchange for a session cookie.
        expires_in_seconds: Cookie expiration time in seconds (5 min to 14 days).

    Returns:
        str: The session cookie string.

    Raises:
        firebase_admin.auth.InvalidIdTokenError: If the ID token is invalid.
    """
    # Ensure Firebase is initialized
    get_firebase_app()
    return auth.create_session_cookie(id_token, expires_in=expires_in_seconds)


def verify_session_cookie(session_cookie: str, check_revoked: bool = True) -> dict:
    """Verify a Firebase session cookie.

    Args:
        session_cookie: The session cookie to verify.
        check_revoked: Whether to check if the cookie has been revoked.

    Returns:
        dict: The decoded session cookie containing user information.

    Raises:
        firebase_admin.auth.InvalidSessionCookieError: If the cookie is invalid.
        firebase_admin.auth.ExpiredSessionCookieError: If the cookie has expired.
        firebase_admin.auth.RevokedSessionCookieError: If the cookie was revoked.
    """
    # Ensure Firebase is initialized
    get_firebase_app()
    return auth.verify_session_cookie(session_cookie, check_revoked=check_revoked)
