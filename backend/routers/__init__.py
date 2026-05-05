"""Routers package."""

from routers.auth_router import router as auth_router
from routers.admin_router import router as admin_router
from routers.users_router import router as users_router

__all__ = ["auth_router", "admin_router", "users_router"]
