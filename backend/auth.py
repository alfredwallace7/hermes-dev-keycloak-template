"""JWT / OIDC token validation helpers."""

from fastapi import Depends, Header, HTTPException
import httpx
import jwt

from config import JWKS_URL, KEYCLOAK_AUDIENCE, KEYCLOAK_ISSUER, normalize_email


_jwks_cache = None


async def get_jwks():
    global _jwks_cache
    if _jwks_cache is None:
        async with httpx.AsyncClient(timeout=5.0) as client:
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
            audience=KEYCLOAK_AUDIENCE,
            issuer=KEYCLOAK_ISSUER,
        )
        user_email = payload.get("email")
        if not user_email:
            raise HTTPException(status_code=401, detail="Token missing email claim")
        normalized_email = normalize_email(str(user_email))

        from database import get_user_record
        rec = get_user_record(normalized_email)
        if rec is None:
            raise HTTPException(status_code=403, detail="User not registered")
        if rec["active"] != 1:
            raise HTTPException(status_code=403, detail="Account deactivated")

        return {
            "sub": payload["sub"],
            "email": normalized_email,
            "name": payload.get("name"),
            "preferred_username": payload.get("preferred_username"),
        }
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid token")


async def require_admin(user=Depends(get_current_user)):
    """Dependency that enforces admin role."""
    from database import is_admin
    if not is_admin(user["email"]):
        raise HTTPException(status_code=403, detail="Admin access required")
    return user
