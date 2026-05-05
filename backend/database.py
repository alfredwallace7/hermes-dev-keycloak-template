"""Database helpers — SQLite user store."""

import sqlite3
from config import DB_PATH

_db_conn = None


def get_db():
    """Return a module-level SQLite connection (singleton)."""
    global _db_conn
    if _db_conn is None:
        _db_conn = sqlite3.connect(DB_PATH)
        _db_conn.row_factory = sqlite3.Row
        init_db()
    return _db_conn


def init_db():
    """Create tables and seed the admin user."""
    conn = get_db()
    conn.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email TEXT UNIQUE NOT NULL,
            name TEXT,
            active INTEGER DEFAULT 1,
            admin INTEGER DEFAULT 0
        )
    """)
    conn.execute(
        "INSERT OR IGNORE INTO users (email, name, active, admin) VALUES (?, ?, 1, 1)",
        ("natprocess.ai@gmail.com", "Olivier"),
    )
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
