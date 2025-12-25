"""Pydantic schemas for User model."""

from datetime import datetime
from enum import Enum
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field


class UserMode(str, Enum):
    """Enum for user active mode."""

    STUDENT = "student"
    COACH = "coach"


class UserBase(BaseModel):
    """Base schema for User with common attributes."""

    email: str
    display_name: str | None = None


class UserCreate(UserBase):
    """Schema for creating a new User."""

    auth_provider: str
    auth_subject: str
    roles: list[str] = Field(default_factory=list)
    active_mode: UserMode = UserMode.STUDENT


class UserUpdate(BaseModel):
    """Schema for updating a User. All fields are optional."""

    display_name: str | None = None
    roles: list[str] | None = None
    active_mode: UserMode | None = None


class UserResponse(BaseModel):
    """Schema for User API responses.

    This is the response returned by GET /auth/me
    containing the user's local profile information.
    """

    model_config = ConfigDict(from_attributes=True)

    id: UUID
    email: str
    display_name: str | None
    roles: list[str]
    active_mode: str


class UserFullResponse(UserResponse):
    """Full user response including timestamps."""

    auth_provider: str
    auth_subject: str
    created_at: datetime
    updated_at: datetime


class SessionLoginRequest(BaseModel):
    """Request body for session login endpoint."""

    id_token: str = Field(
        ...,
        description="Firebase ID token obtained from client-side authentication",
    )


class SessionLoginResponse(BaseModel):
    """Response body for session login endpoint."""

    status: str = "ok"


class SessionLogoutResponse(BaseModel):
    """Response body for session logout endpoint."""

    status: str = "ok"
