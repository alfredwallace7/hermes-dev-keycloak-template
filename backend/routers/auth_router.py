"""Auth-related API routes (public / user info)."""

from fastapi import APIRouter, Depends

from auth import get_current_user
from database import get_user_record

router = APIRouter(prefix="/auth", tags=["auth"])


@router.get("/me")
async def get_me(user=Depends(get_current_user)):
    """Get current authenticated user info."""
    rec = get_user_record(user["email"])
    return {
        "authenticated": True,
        "user_id": user["sub"],
        "email": user.get("email"),
        "name": user.get("name"),
        "preferred_username": user.get("preferred_username"),
        "admin": bool(rec.get("admin", 0)) if rec else False,
        "message": "This is a protected endpoint!",
    }


@router.get("/protected")
async def protected(user=Depends(get_current_user)):
    """A protected endpoint that requires authentication."""
    return {
        "secret": "You have access to the secret vault! 🏰",
        "user": user["preferred_username"] or user["email"],
    }
