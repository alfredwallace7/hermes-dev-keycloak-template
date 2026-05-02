# Demo Auth — Generic Template

A reusable authentication template with Keycloak OIDC, role-based access control, and a clean component architecture for rapid project development.

## Architecture

### Frontend (React + Vite)
- **Routing**: React Router v6 for client-side navigation
- **Layout**: Persistent header with user avatar dropdown menu
- **Theme**: Dark/Light/System mode toggle with localStorage persistence
- **Components**: shadcn/ui component library with Tailwind CSS

### Backend (FastAPI + PostgreSQL)
- **Authentication**: Keycloak OIDC via oidc-client-ts
- **Authorization**: Role-based access control (admin/user roles)
- **Database**: PostgreSQL for user management and admin data
- **SPA Serving**: Built frontend served from FastAPI static files

## Project Structure

```
demo-auth/
├── backend/
│   ├── main.py              # FastAPI application with API routes + SPA serving
│   └── requirements.txt     # Python dependencies
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   └── Layout.jsx   # Persistent header with avatar dropdown
│   │   ├── pages/
│   │   │   ├── HomePage.jsx          # Blank template home page
│   │   │   └── AdminUsersPage.jsx    # User management interface
│   │   ├── App.jsx              # React Router setup and route guards
│   │   ├── OidcContext.jsx      # Keycloak OIDC authentication context
│   │   └── ThemeContext.jsx     # Theme switching provider
│   └── package.json
├── docs/
│   └── plans/               # Implementation plans and documentation
└── README.md
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
- PostgreSQL database
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
Update `frontend/src/App.jsx` with your Keycloak configuration:
```javascript
const KEYCLOAK_CONFIG = {
  authority: 'https://your-keycloak-instance/realms/your-realm',
  client_id: 'your-client-id',
  redirect_uri: window.location.origin + '/callback',
  response_type: 'code',
  scope: 'openid profile email',
};
```

### Database Connection
Set environment variables for PostgreSQL connection in backend.

## API Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/me` | Get current user info | Yes |
| GET | `/api/admin/users` | List all managed users | Admin |
| POST | `/api/admin/users` | Create new user | Admin |
| PUT | `/api/admin/users/{email}` | Update user settings | Admin |
| DELETE | `/api/admin/users/{email}` | Delete user | Admin |

## Customization Guide

### Adding New Pages
1. Create component in `frontend/src/pages/YourPage.jsx`
2. Add route in `App.jsx`: `<Route path="/your-path" element={<YourPage />} />`
3. Optionally wrap with `RequireAdmin` for admin-only access

### Extending User Management
- Modify `AdminUsersPage.jsx` to add new fields or actions
- Update backend API endpoints as needed
- Ensure proper role-based access control

### Theme Customization
- Edit Tailwind config in `frontend/tailwind.config.js`
- Add custom colors, fonts, or spacing scales
- Use CSS variables for dynamic theming

## Development Workflow

1. Make changes to frontend components
2. Test locally with `npm run dev` (hot reload enabled)
3. Build production assets with `npm run build`
4. Verify backend integration through ngrok tunnel
5. Commit changes with conventional commit messages

## Deployment Notes

- Use environment variables for sensitive configuration
- Ensure CORS settings allow your deployment domain
- Configure proper HTTPS certificates for production
- Set up database backups and monitoring

## License

MIT License — feel free to use this template as a starting point for your projects.
