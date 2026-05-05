"""Pydantic models for the admin API."""

from pydantic import BaseModel, field_validator


def normalize_email_value(value: str) -> str:
    normalized = value.strip().lower()
    if "@" not in normalized:
        raise ValueError("Invalid email address")
    return normalized


class UserCreate(BaseModel):
    email: str
    name: str | None = None
    active: bool = True
    admin: bool = False

    @field_validator("email")
    @classmethod
    def validate_email(cls, value: str) -> str:
        return normalize_email_value(value)


class UserUpdate(BaseModel):
    email: str | None = None
    name: str | None = None
    active: bool | None = None
    admin: bool | None = None

    @field_validator("email")
    @classmethod
    def validate_email(cls, value: str | None) -> str | None:
        if value is None:
            return value
        return normalize_email_value(value)
