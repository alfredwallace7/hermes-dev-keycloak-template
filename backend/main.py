from fastapi import FastAPI, Depends, HTTPException, Header
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import httpx
import jwt
import sqlite3
import os

app = FastAPI(title="Hermes Auth Demo API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

KEYCLOAK_ISSUER = "https://keycloak.netcraft.fr/realms/hermes"
JWKS_URL = f"{KEYCLOAK_ISSUER}/protocol/openid-connect/certs"
DB_PATH = os.path.join(os.path.dirname(__file__), "users.db")

_jwks_cache = None
_db_conn = None


def get_db():
    global _db_conn
    if _db_conn is None:
        _db_conn = sqlite3.connect(DB_PATH)
        _db_conn.row_factory = sqlite3.Row
        init_db()
    return _db_conn


def init_db():
    conn = get_db()
    # Create table with admin column
    conn.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email TEXT UNIQUE NOT NULL,
            name TEXT,
            active INTEGER DEFAULT 1,
            admin INTEGER DEFAULT 0
        )
    """)
    # Seed the admin user
    conn.execute(
        "INSERT OR IGNORE INTO users (email, name, active, admin) VALUES (?, ?, 1, 1)",
        ("natprocess.ai@gmail.com", "Olivier"),
    )
    # Ensure existing seed has admin flag set
    conn.execute(
        "UPDATE users SET admin = 1 WHERE email = ?",
        ("natprocess.ai@gmail.com",),
    )
    conn.commit()


def get_user_record(email: str) -> dict | None:
    """Look up a user in the local DB."""
    conn = get_db()
    row = conn.execute(
        "SELECT id, email, name, active, admin FROM users WHERE email = ?", (email,)
    ).fetchone()
    if row is None:
        return None
    return dict(row)


def is_authorized(email: str) -> bool:
    rec = get_user_record(email)
    return rec is not None and rec["active"] == 1


def is_admin(email: str) -> bool:
    rec = get_user_record(email)
    return rec is not None and rec.get("admin", 0) == 1


# --- Pydantic models for admin API ---

class UserCreate(BaseModel):
    email: str
    name: str | None = None
    active: bool = True
    admin: bool = False


class UserUpdate(BaseModel):
    name: str | None = None
    active: bool | None = None
    admin: bool | None = None


async def get_current_user(authorization: str = Header(default=None)):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing or invalid Authorization header")

    token = authorization.split(" ", 1)[1]
    try:
        unverified_header = jwt.get_unverified_header(token)
        jwks = await get_jwks()
        key = find_key_by_kid(unverified_header["kid"], jwks)
        payload = jwt.decode(
            token,
            key,
            algorithms=["RS256", "RS384", "RS512"],
            audience=["hermes-dev", "account"],
            issuer=KEYCLOAK_ISSUER,
        )
        user_email = payload.get("email")
        if not is_authorized(user_email):
            raise HTTPException(status_code=403, detail=f"Access denied: {user_email} is not authorized")
        return {
            "sub": payload["sub"],
            "email": user_email,
            "name": payload.get("name"),
            "preferred_username": payload.get("preferred_username"),
        }
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except Exception as e:
        raise HTTPException(status_code=401, detail=f"Invalid token: {str(e)}")


async def require_admin(user = Depends(get_current_user)):
    """Dependency that enforces admin role."""
    if not is_admin(user["email"]):
        raise HTTPException(status_code=403, detail="Admin access required")
    return user


async def get_jwks():
    global _jwks_cache
    if _jwks_cache is None:
        async with httpx.AsyncClient() as client:
            resp = await client.get(JWKS_URL)
            resp.raise_for_status()
            _jwks_cache = resp.json()
    return _jwks_cache


def find_key_by_kid(kid, jwks):
    for key in jwks.get("keys", []):
        if key["kid"] == kid:
            return jwt.algorithms.RSAAlgorithm.from_jwk(key)
    raise HTTPException(status_code=401, detail="No matching signing key")


# --- Public endpoints ---

@app.get("/")
async def root():
    return {"message": "Hermes Auth Demo API", "status": "running"}


@app.get("/api/me")
async def get_me(user = Depends(get_current_user)):
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


@app.get("/api/protected")
async def protected(user = Depends(get_current_user)):
    return {
        "secret": "You have access to the secret vault! 🏰",
        "user": user["preferred_username"] or user["email"],
    }


# --- Admin endpoints (require admin role) ---

@app.get("/api/admin/users")
async def list_users(admin = Depends(require_admin)):
    """List all users in the system."""
    conn = get_db()
    rows = conn.execute("SELECT id, email, name, active, admin FROM users ORDER BY id").fetchall()
    return [dict(r) for r in rows]


@app.post("/api/admin/users")
async def create_user(data: UserCreate, admin = Depends(require_admin)):
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


@app.put("/api/admin/users/{email}")
async def update_user(email: str, data: UserUpdate, admin = Depends(require_admin)):
    """Update user fields (name, active, admin)."""
    conn = get_db()
    rec = conn.execute("SELECT id FROM users WHERE email = ?", (email,)).fetchone()
    if not rec:
        raise HTTPException(status_code=404, detail=f"User {email} not found")

    updates = []
    values = []
    if data.name is not None:
        updates.append("name = ?"); values.append(data.name)
    if data.active is not None:
        updates.append("active = ?"); values.append(int(data.active))
    if data.admin is not None:
        updates.append("admin = ?"); values.append(int(data.admin))

    if updates:
        values.append(email)
        conn.execute(f"UPDATE users SET {', '.join(updates)} WHERE email = ?", values)
        conn.commit()

    return {"ok": True, "email": email}


@app.delete("/api/admin/users/{email}")
async def delete_user(email: str, admin = Depends(require_admin)):
    """Remove a user from the system."""
    conn = get_db()
    rec = conn.execute("SELECT id FROM users WHERE email = ?", (email,)).fetchone()
    if not rec:
        raise HTTPException(status_code=404, detail=f"User {email} not found")
    conn.execute("DELETE FROM users WHERE email = ?", (email,))
    conn.commit()
    return {"ok": True, "deleted": email}
