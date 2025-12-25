"""User repository for database operations."""

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.models.user import User, UserMode
from app.schemas.user import UserCreate, UserUpdate


class UserRepository:
    """Repository for User model operations.

    This repository handles user-specific database operations,
    particularly around authentication and user lookup by auth credentials.
    """

    def __init__(self, session: AsyncSession) -> None:
        self._session = session

    async def get_by_auth_subject(
        self,
        provider: str,
        subject: str,
    ) -> User | None:
        """Get a user by their authentication provider and subject.

        Args:
            provider: The authentication provider (e.g., "firebase").
            subject: The unique identifier from the provider (e.g., Firebase UID).

        Returns:
            The User if found, None otherwise.
        """
        stmt = select(User).where(
            User.auth_provider == provider,
            User.auth_subject == subject,
        )
        result = await self._session.execute(stmt)
        return result.scalar_one_or_none()

    async def upsert_from_firebase(self, decoded_token: dict) -> User:
        """Create or update a user from a decoded Firebase token.

        This method implements an upsert pattern:
        - If the user exists (by Firebase UID), update their email/name
        - If the user doesn't exist, create a new user record

        Args:
            decoded_token: The decoded Firebase ID token containing:
                - uid: Firebase user ID
                - email: User's email address
                - name (optional): User's display name

        Returns:
            The created or updated User instance.
        """
        firebase_uid = decoded_token["uid"]
        email = decoded_token.get("email", "")
        display_name = decoded_token.get("name")

        # Try to find existing user
        user = await self.get_by_auth_subject("firebase", firebase_uid)

        if user is None:
            # Create new user
            user = User(
                auth_provider="firebase",
                auth_subject=firebase_uid,
                email=email,
                display_name=display_name,
                roles=[],
                active_mode=UserMode.STUDENT.value,
            )
            self._session.add(user)
        else:
            # Update existing user's profile info
            # Email and display name may have changed in Firebase
            user.email = email
            if display_name is not None:
                user.display_name = display_name

        await self._session.flush()
        await self._session.refresh(user)
        return user

    async def create(self, data: UserCreate) -> User:
        """Create a new user."""
        db_obj = User(**data.model_dump())
        self._session.add(db_obj)
        await self._session.flush()
        await self._session.refresh(db_obj)
        return db_obj

    async def update(self, user: User, data: UserUpdate) -> User:
        """Update an existing user."""
        update_data = data.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(user, field, value)

        await self._session.flush()
        await self._session.refresh(user)
        return user
