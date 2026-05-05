"""Admin API routes — CRUD for managed users."""

import sqlite3
from fastapi import APIRouter, Depends, HTTPException

from auth import require_admin
from config import normalize_email
from database import get_db
from models import UserCreate, UserUpdate

router = APIRouter(prefix="/admin", tags=["admin"])


@router.get("/users")
async def list_users(_admin=Depends(require_admin)):
    """List all users in the system."""
    conn = get_db()
    rows = conn.execute("SELECT id, email, name, active, admin FROM users ORDER BY id").fetchall()
    return [dict(r) for r in rows]


@router.post("/users")
async def create_user(data: UserCreate, _admin=Depends(require_admin)):
    """Add a new user."""
    conn = get_db()
    try:
        conn.execute(
            "INSERT INTO users (email, name, active, admin) VALUES (?, ?, ?, ?)",
            (data.email, data.name, int(data.active), int(data.admin)),
        )
        conn.commit()
    except sqlite3.IntegrityError:
        raise HTTPException(status_code=409, detail=f"User {data.email} already exists")
    return {"ok": True, "email": data.email}


@router.put("/users/{email}")
async def update_user(email: str, data: UserUpdate, _admin=Depends(require_admin)):
    """Update user fields (name, active, admin)."""
    conn = get_db()
    current_email = normalize_email(email)
    rec = conn.execute("SELECT id FROM users WHERE email = ?", (current_email,)).fetchone()
    if not rec:
        raise HTTPException(status_code=404, detail=f"User {current_email} not found")

    updates = []
    values = []
    if data.name is not None:
        updates.append("name = ?")
        values.append(data.name)
    if data.email is not None:
        updates.append("email = ?")
        values.append(data.email)
    if data.active is not None:
        updates.append("active = ?")
        values.append(int(data.active))
    if data.admin is not None:
        updates.append("admin = ?")
        values.append(int(data.admin))

    if not updates:
        return {"ok": True, "email": current_email}

    values.append(current_email)
    try:
        conn.execute(f"UPDATE users SET {', '.join(updates)} WHERE email = ?", values)
        conn.commit()
    except sqlite3.IntegrityError:
        raise HTTPException(status_code=409, detail=f"User {data.email} already exists")

    return {"ok": True, "email": data.email or current_email}


@router.delete("/users/{email}")
async def delete_user(email: str, _admin=Depends(require_admin)):
    """Remove a user from the system."""
    conn = get_db()
    current_email = normalize_email(email)
    rec = conn.execute("SELECT id FROM users WHERE email = ?", (current_email,)).fetchone()
    if not rec:
        raise HTTPException(status_code=404, detail=f"User {current_email} not found")
    conn.execute("DELETE FROM users WHERE email = ?", (current_email,))
    conn.commit()
    return {"ok": True, "deleted": current_email}
