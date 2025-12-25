"""User model for authentication and user management."""

import uuid
from enum import Enum

from sqlalchemy import JSON, String, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column

from app.db.models.base import Base, TimestampMixin


class UserMode(str, Enum):
    """Enum for user active mode."""

    STUDENT = "student"
    COACH = "coach"


class User(Base, TimestampMixin):
    """User model representing authenticated users.

    Users are identified by their authentication provider and subject (UID).
    This allows for multiple auth providers while maintaining a single user identity.
    """

    __tablename__ = "users"

    # Composite unique constraint on auth_provider + auth_subject
    # ensures no duplicate users from the same provider
    __table_args__ = (
        UniqueConstraint(
            "auth_provider", "auth_subject", name="uq_auth_provider_subject"
        ),
    )

    id: Mapped[uuid.UUID] = mapped_column(
        primary_key=True,
        default=uuid.uuid4,
    )

    # Authentication fields
    # auth_provider identifies the source (e.g., "firebase", "google", etc.)
    # auth_subject is the unique identifier from that provider (e.g., Firebase UID)
    auth_provider: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
        index=True,
    )
    auth_subject: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
        index=True,
    )

    # User profile fields
    email: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
        index=True,
    )
    display_name: Mapped[str | None] = mapped_column(
        String(255),
        nullable=True,
    )

    # Authorization fields
    # roles is a JSON array for flexible role-based access control
    roles: Mapped[list] = mapped_column(
        JSON,
        nullable=False,
        default=list,
    )

    # User preference for current mode (student or coach view)
    active_mode: Mapped[str] = mapped_column(
        String(20),
        nullable=False,
        default=UserMode.STUDENT.value,
    )
