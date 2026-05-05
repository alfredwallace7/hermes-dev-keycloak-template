# Demo Auth — Generic Template

A reusable authentication template with Keycloak OIDC, role-based access control, and a clean modular architecture for rapid project development.

## Architecture

### Frontend (React + Vite)
- **Routing**: React Router v6 with lazy-loaded route components (`routes/index.jsx`)
- **Layout**: Persistent header with user avatar dropdown menu
- **Theme**: Dark/Light/System mode toggle with localStorage persistence
- **Components**: shadcn/ui component library with Tailwind CSS

### Backend (FastAPI + SQLite)
- **Authentication**: Keycloak OIDC via oidc-client-ts
- **Authorization**: Role-based access control (admin/user roles)
- **Database**: SQLite for user management and admin data
- **SPA Serving**: Built frontend served from FastAPI static files
- **API Versioning**: All endpoints under `/api/v1` prefix

## Project Structure

```
demo-auth/
├── backend/                          # Python FastAPI application
│   ├── __init__.py                   # Package marker
│   ├── main.py                       # App entry point — creates FastAPI app, mounts routers
│   ├── config.py                     # Configuration constants (Keycloak, DB path)
│   ├── database.py                   # Database helpers (get_db, init_db, user lookups)
│   ├── auth.py                       # JWT validation, JWKS fetching, get_current_user
│   ├── models.py                     # Pydantic request/response models
│   ├── requirements.txt              # Python dependencies
│   └── routers/                      # API route modules
│       ├── __init__.py               # Exports all routers for easy import
│       ├── auth_router.py            # Public endpoints: /api/v1/auth/me, /api/v1/auth/protected
│       ├── admin_router.py           # Admin CRUD: /api/v1/admin/users (GET/POST/PUT/DELETE)
│       └── users_router.py           # User-facing endpoints (placeholder for future routes)
├── frontend/                         # React + Vite application
│   ├── src/
│   │   ├── App.jsx                   # Root component — wraps providers, renders <Routes>
│   │   ├── main.jsx                  # Entry point — mounts React to DOM
│   │   ├── index.css                 # Global styles (Tailwind imports)
│   │   ├── OidcContext.jsx           # Keycloak OIDC authentication context provider
│   │   ├── ThemeContext.jsx          # Theme switching context provider
│   │   ├── routes/                   # Route definitions with lazy loading
│   │   │   └── index.jsx             # All route configs + RequireAdmin wrapper
│   │   ├── pages/                    # Page components (one per route)
│   │   │   ├── HomePage.jsx          # Home page — requires authentication
│   │   │   ├── LoginPage.jsx         # Login trigger with auto-login and error handling
│   │   │   ├── CallbackPage.jsx      # OIDC callback processor
│   │   │   └── AdminUsersPage.jsx    # Admin user management interface
│   │   ├── components/               # Reusable UI components
│   │   │   ├── Layout.jsx            # Persistent header + main content layout
│   │   │   ├── RequireAuth.jsx       # Route guard — redirects unauthenticated users
│   │   │   └── ui/                   # shadcn/ui component library
│   │   ├── hooks/                    # Custom React hooks
│   │   │   └── useAdminCheck.js      # Hook to check admin status via /api/me
│   │   ├── utils/                    # Utility functions and constants
│   │   │   ├── constants.js          # KEYCLOAK_CONFIG, API_BASE exports
│   │   │   └── api.js                # Lightweight fetch helper with auth token injection
│   │   └── lib/                      # Shared library code (TypeScript utilities)
│   │       └── utils.ts              # cn() class merging utility
│   ├── package.json
│   └── vite.config.js
├── docs/                             # Implementation plans and documentation
│   └── plans/
└── README.md                         # This file
```

## Features

### Authentication Layer
- Keycloak OIDC integration (authorization_code + PKCE)
- Automatic token refresh and session management
- Protected routes with authentication guards
- Admin role verification via backend API

### User Interface
- Responsive design with mobile-first approach
- Persistent header layout across all pages
- User avatar dropdown menu with profile info
- Theme switching (Light/Dark/System) with persistence
- Clean component separation for easy customization

### User Management (Admin Only)
- Add new users with email, name, and role assignment
- Toggle user active/inactive status
- Promote/demote admin privileges
- Delete users with confirmation dialog
- Real-time updates after CRUD operations

## Getting Started

### Prerequisites
- Node.js 18+ for frontend development
- Python 3.11+ for backend
- Keycloak instance configured with OIDC

### Installation

1. **Backend Setup**
   ```bash
   cd backend
   python -m venv .venv
   source .venv/bin/activate
   pip install -r requirements.txt
   uvicorn main:app --host 0.0.0.0 --port 8000
   ```

2. **Frontend Development**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

3. **Production Build**
   ```bash
   cd frontend
   npm run build
   # Built files automatically served by FastAPI backend
   ```

## Configuration

### Keycloak Settings
Update `frontend/src/utils/constants.js` with your Keycloak configuration:
```javascript
export const KEYCLOAK_CONFIG = {
  authority: 'https://your-keycloak-instance/realms/your-realm',
  client_id: 'your-client-id',
  redirect_uri: window.location.origin + '/callback',
  response_type: 'code',
  scope: 'openid profile email',
};
```

### Backend Configuration
Update `backend/config.py` to match your Keycloak setup:
```python
KEYCLOAK_ISSUER = "https://your-keycloak/realms/your-realm"
JWKS_URL = f"{KEYCLOAK_ISSUER}/protocol/openid-connect/certs"
```

## API Endpoints

All endpoints are under the `/api/v1` prefix.

### Auth (public)
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/v1/auth/me` | Get current user info | Yes |
| GET | `/api/v1/auth/protected` | Protected demo endpoint | Yes |

### Admin (requires admin role)
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/v1/admin/users` | List all managed users | Admin |
| POST | `/api/v1/admin/users` | Create new user | Admin |
| PUT | `/api/v1/admin/users/{email}` | Update user settings | Admin |
| DELETE | `/api/v1/admin/users/{email}` | Delete user | Admin |

## How to Add New Routes/Pages

### Adding a Backend Route

1. **Create a new router file** in `backend/routers/`:
   ```python
   # backend/routers/my_feature_router.py
   from fastapi import APIRouter, Depends
   from auth import get_current_user
   
   router = APIRouter(prefix="/my-feature", tags=["my-feature"])
   
   @router.get("/items")
   async def list_items(user=Depends(get_current_user)):
       return {"message": "Hello from my feature!"}
   ```

2. **Register the router** in `backend/routers/__init__.py`:
   ```python
   from routers.my_feature_router import router as my_feature_router
   __all__ = ["auth_router", "admin_router", "users_router", "my_feature_router"]
   ```

3. **Mount the router** in `backend/main.py`:
   ```python
   from routers import auth_router, admin_router, users_router, my_feature_router
   
   app.include_router(auth_router, prefix="/api/v1")
   app.include_router(admin_router, prefix="/api/v1")
   app.include_router(users_router, prefix="/api/v1")
   app.include_router(my_feature_router, prefix="/api/v1")  # <-- add this line
   ```

### Adding a Frontend Page/Route

1. **Create the page component** in `frontend/src/pages/`:
   ```jsx
   // frontend/src/pages/MyFeaturePage.jsx
   export default function MyFeaturePage() {
     return (
       <div className="container mx-auto py-8 px-4">
         <h1>My Feature</h1>
       </div>
     );
   }
   ```

2. **Add the route** in `frontend/src/routes/index.jsx`:
   ```jsx
   import MyFeaturePage from '../pages/MyFeaturePage';
   
   // In ROUTES array:
   {
     path: '/my-feature',
     element: <RequireAuth><MyFeaturePage /></RequireAuth>,
     description: 'My feature page — requires authentication',
   },
   ```

3. **Add a `<Route>` entry** in `frontend/src/App.jsx`:
   ```jsx
   // Add after the existing routes, before catch-all:
   <Route path="/my-feature" element={<ROUTES[4].element />} />
   ```

### Adding a Custom Hook

1. Create a file in `frontend/src/hooks/`:
   ```js
   // frontend/src/hooks/useMyFeature.js
   import { useState, useEffect } from 'react';
   
   export function useMyFeature() {
     const [data, setData] = useState(null);
     
     useEffect(() => {
       fetch('/api/v1/my-feature/items')
         .then(res => res.json())
         .then(setData);
     }, []);
     
     return data;
   }
   ```

2. Use it in any component:
   ```jsx
   import { useMyFeature } from '../hooks/useMyFeature';
   
   function MyComponent() {
     const data = useMyFeature();
     // ...
   }
   ```

## Development Workflow

1. Make changes to frontend components or backend routers
2. Test locally with `npm run dev` (frontend) and `uvicorn main:app` (backend)
3. Build production assets with `npm run build`
4. Verify integration through your deployment tunnel
5. Commit changes with conventional commit messages

## Deployment Notes

- Use environment variables for sensitive configuration
- Ensure CORS settings allow your deployment domain
- Configure proper HTTPS certificates for production
- Set up database backups and monitoring

## License

MIT License — feel free to use this template as a starting point for your projects.
