import os
from dotenv import load_dotenv

load_dotenv()

def required_env(name: str) -> str:
    value = os.getenv(name)
    if not value:
        raise RuntimeError(f"{name} environment variable is required")
    return value


def csv_env(name: str, default: str = "") -> list[str]:
    return [item.strip() for item in os.getenv(name, default).split(",") if item.strip()]


def normalize_email(value: str) -> str:
    return value.strip().lower()


KEYCLOAK_ISSUER = os.getenv("KEYCLOAK_ISSUER", "").rstrip("/")
KEYCLOAK_AUDIENCE = csv_env("KEYCLOAK_AUDIENCE")
ADMIN_EMAIL = normalize_email(required_env("ADMIN_EMAIL"))
CORS_ALLOW_ORIGINS = csv_env("CORS_ALLOW_ORIGINS", "http://localhost:3000")
JWKS_URL = f"{KEYCLOAK_ISSUER}/protocol/openid-connect/certs"
DB_PATH = os.path.join(os.path.dirname(__file__), "users.db")
FRONTEND_DIST = os.path.join(os.path.dirname(__file__), "..", "frontend", "dist")


def validate_app_config() -> None:
    if not KEYCLOAK_ISSUER:
        raise RuntimeError("KEYCLOAK_ISSUER environment variable is required")
    if not KEYCLOAK_AUDIENCE:
        raise RuntimeError("KEYCLOAK_AUDIENCE environment variable is required")
