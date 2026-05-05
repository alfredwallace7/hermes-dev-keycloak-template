# Template

A full-stack template featuring **FastAPI**, **React (Vite/Bun)**, and **Keycloak (OIDC)** authentication with a built-in admin dashboard for user management.

## 🚀 Tech Stack

- **Backend**: FastAPI (Python 3.10+), SQLite, SQLAlchemy, Pydantic.
- **Frontend**: React 18, Vite, Bun, TailwindCSS, Shadcn UI, Lucide Icons.
- **Auth**: OpenID Connect (OIDC) via Keycloak.
- **Tooling**: Makefile for orchestration, `python-dotenv` for config.

## 📁 Project Structure

```text
├── backend/            # FastAPI server & Database
│   ├── routers/        # API endpoints
│   ├── models.py       # Database schemas
│   └── database.py     # Session & Init logic
├── frontend/           # React application
│   ├── src/components/ # Shared UI & logic
│   ├── src/pages/      # Route components
│   └── src/hooks/      # Shared state hooks
└── Makefile            # Common developer commands
```

## 🛠️ Getting Started

### 1. Prerequisites

- [Python 3.10+](https://www.python.org/)
- [Bun](https://bun.sh/)
- A running [Keycloak](https://www.keycloak.org/) instance.

### 2. Configuration

Create `.env` files in both `backend/` and `frontend/` based on their respective `.env.example` files.

**Backend (`backend/.env`):**

```env
ADMIN_EMAIL=your-admin@example.com
KEYCLOAK_ISSUER=https://your-keycloak/realms/your-realm
KEYCLOAK_AUDIENCE=your-client-id
CORS_ALLOW_ORIGINS=http://localhost:3000
```

**Frontend (`frontend/.env`):**

```env
VITE_APP_TITLE=Template
VITE_KEYCLOAK_ISSUER=https://your-keycloak/realms/your-realm
VITE_KEYCLOAK_CLIENT_ID=your-client-id
VITE_API_BASE_URL=/api/v1
```

### 3. Installation & Run

Use the provided `Makefile` for a seamless setup:

```bash
# Install all dependencies
make install

# Initialize the database and seed the admin user
make db-init ADMIN_EMAIL=your-admin@email.com

# Run both backend and frontend in dev mode
make dev
```

## 📜 Makefile Targets

| Target         | Description                                                            |
| :------------- | :--------------------------------------------------------------------- |
| `make install` | Installs both backend (pip) and frontend (bun) dependencies.           |
| `make dev`     | Launches both dev servers in parallel.                                 |
| `make db-init` | Initializes the SQLite database and seeds the specified `ADMIN_EMAIL`. |
| `make build`   | Generates the production build for the frontend.                       |
| `make clean`   | Removes `dist/` folders and the local SQLite database.                 |

## 🔐 Authentication Flow

1.  **Login**: User is redirected to Keycloak.
2.  **Callback**: Keycloak redirects back to `/callback`, where tokens are processed.
3.  **Authorization**: The backend verifies the JWT on every request.
4.  **Admin Access**: Users with the `ADMIN_EMAIL` specified in the environment are granted access to the `/admin/users` dashboard.

## 🎨 UI & UX

The frontend uses **Shadcn UI** for a premium, accessible interface. It supports dark mode (via `ThemeProvider`) and includes a responsive sidebar/header layout.

---

Created with ❤️ as a foundation for secure, modern web applications.
