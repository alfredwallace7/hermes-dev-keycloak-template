"""Application configuration constants."""

import os

KEYCLOAK_ISSUER = "https://keycloak.netcraft.fr/realms/hermes"
JWKS_URL = f"{KEYCLOAK_ISSUER}/protocol/openid-connect/certs"
DB_PATH = os.path.join(os.path.dirname(__file__), "users.db")
FRONTEND_DIST = os.path.join(os.path.dirname(__file__), "..", "frontend", "dist")
