"""Pydantic models for the admin API."""

from pydantic import BaseModel


class UserCreate(BaseModel):
    email: str
    name: str | None = None
    active: bool = True
    admin: bool = False


class UserUpdate(BaseModel):
    name: str | None = None
    active: bool | None = None
    admin: bool | None = None
