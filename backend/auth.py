"""JWT / OIDC token validation helpers."""

import jwt
import httpx
from fastapi import Depends, Header, HTTPException

from config import JWKS_URL


_jwks_cache = None


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


async def get_current_user(authorization: str = Header(default=None)):
    """Decode and validate a Bearer JWT. Returns user dict."""
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
            issuer="https://keycloak.netcraft.fr/realms/hermes",
        )
        user_email = payload.get("email")
        if not user_email:
            raise HTTPException(status_code=401, detail="Token missing email claim")

        from database import get_user_record
        rec = get_user_record(user_email)
        if rec is None:
            raise HTTPException(status_code=403, detail="User not registered")
        if rec["active"] != 1:
            raise HTTPException(status_code=403, detail="Account deactivated")

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
    from database import is_admin
    if not is_admin(user["email"]):
        raise HTTPException(status_code=403, detail="Admin access required")
    return user
