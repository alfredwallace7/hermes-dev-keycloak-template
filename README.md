# Keycloak OIDC Auth Template

Full-stack authentication template using Keycloak OIDC — React SPA frontend + FastAPI backend with user management.

## Features

- **OIDC Login/Logout** via Keycloak (authorization code flow + PKCE)
- **JWT Verification** on backend (RS256, JWKS public key)
- **User Management** — local users table with active/admin flags
- **Admin Panel** — only admin users can add/manage other users
- **Silent Token Renewal** — automatic refresh via oidc-client-ts

## Quick Start for New Projects

```bash
# 1. Clone this repo as your project base
git clone https://github.com/alfredwallace7/hermes-dev-keycloak-template my-new-project
cd my-new-project

# 2. Update Keycloak config in frontend/src/App.jsx:
#    - authority, client_id (or use env vars)

# 3. Start backend
cd backend && pip install -r requirements.txt
python main.py  # Runs on port 8000

# 4. Start frontend
cd ../frontend && npm install
npm run dev     # Runs on port 5173, proxies /api to backend
```

## Architecture

```
┌─────────────┐         ┌──────────────┐         ┌─────────────┐
│   Browser    │────────▶│   Vite SPA   │────────▶│  FastAPI    │
│  (React)     │◀────────│  :5173       │◀────────│  :8000      │
└─────────────┘         └──────┬───────┘         └──────┬──────┘
                               │                         │
                    OIDC flow  │                 JWT verify +
                     to/from   │                  /userinfo     │
                   Keycloak    ▼                PostgreSQL/SQLite
               ┌────────────────────────┐    ┌─────────────────┐
               │  Keycloak (OIDC)       │    │   Users DB      │
               │  hermes-dev client     │    │  (email, name,  │
               │  RS256 tokens          │    │   active, admin)│
               └────────────────────────┘    └─────────────────┘
```

## Key Files

| File | Purpose |
|------|---------|
| `frontend/src/OidcContext.jsx` | Auth context — login, logout, token management |
| `frontend/src/App.jsx` | Main app with admin panel and API test card |
| `backend/main.py` | FastAPI server — JWT verification, user CRUD, /api/me |
| `backend/requirements.txt` | Python dependencies (fastapi, uvicorn, python-jose) |

## Configuration

### Keycloak Client Setup

1. Create client with:
   - **Access Type:** `public` (for SPAs)
   - **Standard Flow:** Enabled
   - **Valid Redirect URIs:** `https://your-app.ngrok-free.dev/*`
   - **Valid Post Logout Redirect URIs:** `https://your-app.ngrok-free.dev/*`

2. Update `frontend/src/App.jsx`:
```js
const keycloakConfig = {
  authority: 'https://keycloak.netcraft.fr/realms/hermes',
  client_id: 'hermes-dev',
};
```

### Environment Variables (optional)

```bash
KEYCLOAK_URL=https://keycloak.netcraft.fr
KEYCLOAK_REALM=hermes
OIDC_CLIENT_ID=hermes-dev
DATABASE_URL=sqlite:///users.db  # or postgresql://...
```

## Common Gotchas (Already Fixed Here)

| Problem | How This Template Handles It |
|---------|-----------------------------|
| Logout stuck on Keycloak page | `post_logout_redirect_uri` in settings + logout call + signout callback handler |
| JWT audience mismatch | Accepts both `client_id` AND `"account"` as valid audiences |
| Token expiry during session | `automaticSilentRenew: true` in UserManager |
| Missing user claims after login | Fetches `/userinfo` endpoint for complete profile data |

## License

MIT — Use freely as a starting point for your projects.
