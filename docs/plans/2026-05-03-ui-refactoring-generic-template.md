# Demo-Auth UI Refactoring Plan — Generic Template

> **For Hermes:** Use subagent-driven-development skill to implement this plan task-by-task.

**Goal:** Transform demo-auth from a specific auth demo into a reusable generic template with proper layout, header navigation, and dedicated user management page.

**Architecture:** Single-page app with React Router for client-side routing. Thin persistent header with avatar dropdown menu. Blank content area as default route. Admin-only `/admin/users` route for user management.

**Tech Stack:** React 18+, shadcn/ui components (DropdownMenu, Avatar), Tailwind CSS, React Router v6, Keycloak OIDC via oidc-client-ts.

---

## Current State Analysis

### Existing Files
- `frontend/src/App.jsx` — Monolithic app with all UI in one component (330 lines)
- `frontend/src/OidcContext.jsx` — Auth context provider (working well, keep as-is)
- `frontend/src/components/ui/*` — shadcn components already installed
- `backend/main.py` — FastAPI backend with SPA serving + admin API endpoints

### What to Keep
✅ OidcContext authentication flow  
✅ Backend API endpoints (`/api/me`, `/api/admin/users`)  
✅ Existing shadcn UI components (Button, Card, Dialog, etc.)  
✅ Keycloak OIDC configuration  

### What to Change
❌ Monolithic App.jsx → Split into layout + routes + pages  
❌ Inline logout button → Header dropdown menu with avatar  
❌ No routing → React Router for `/` and `/admin/users`  
❌ Demo-specific content → Blank template page  

---

## Task 1: Install React Router Dependencies

**Objective:** Add react-router-dom to frontend package.json.

**Files:**
- Modify: `frontend/package.json`

**Step 1: Update dependencies**

```bash
cd /workspace/projects/demo-auth/frontend
npm install react-router-dom@6
```

**Step 2: Verify installation**

```bash
grep "react-router-dom" package.json
# Expected: "react-router-dom": "^6.x.x"
```

**Step 3: Commit**

```bash
git add frontend/package.json frontend/package-lock.json
git commit -m "deps: add react-router-dom for client-side routing"
```

---

## Task 2: Create Layout Component with Header

**Objective:** Build a persistent thin header layout component with avatar dropdown menu.

**Files:**
- Create: `frontend/src/components/Layout.jsx`

**Step 1: Install additional shadcn components**

```bash
cd /workspace/projects/demo-auth/frontend
npx shadcn@latest add dropdown-menu avatar separator
```

**Step 2: Create Layout component**

Create `frontend/src/components/Layout.jsx`:

```jsx
import { useState, useEffect } from 'react';
import { useAuth } from '../OidcContext';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

export default function Layout({ children }) {
  const { isAuthenticated, user, logout } = useAuth();
  
  // Get initials for avatar fallback
  const getInitials = (name) => {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  // Get Google profile picture URL from user claims
  const getAvatarUrl = () => {
    // Keycloak provides 'picture' claim in userinfo endpoint
    return user?.profile?.picture || null;
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Thin persistent header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="flex h-14 items-center justify-between px-4 md:px-8">
          {/* Left side - app title */}
          <div className="font-semibold text-lg tracking-tight">
            Hermes App
          </div>

          {/* Right side - user menu */}
          {isAuthenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={getAvatarUrl()} alt={user?.profile?.name || 'User'} />
                    <AvatarFallback>{getInitials(user?.profile?.name)}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user?.profile?.name || 'User'}</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user?.profile?.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout}>
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button size="sm" onClick={() => window.location.reload()}>
              Refresh
            </Button>
          )}
        </div>
      </header>

      {/* Main content area */}
      <main className="flex-1">
        {children}
      </main>
    </div>
  );
}
```

**Step 3: Verify component structure**

Check file exists and has correct exports:
```bash
ls -la frontend/src/components/Layout.jsx
grep "export default function Layout" frontend/src/components/Layout.jsx
# Expected: File exists with export statement
```

**Step 4: Commit**

```bash
git add frontend/src/components/Layout.jsx
git commit -m "feat: create persistent header layout with avatar dropdown menu"
```

---

## Task 3: Create Blank Home Page Component

**Objective:** Simple blank content page as the default route.

**Files:**
- Create: `frontend/src/pages/HomePage.jsx`

**Step 1: Create HomePage component**

Create `frontend/src/pages/HomePage.jsx`:

```jsx
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function HomePage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <Card>
        <CardHeader>
          <CardTitle>Welcome</CardTitle>
          <CardDescription>This is your application template.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Start building your features here.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
```

**Step 2: Verify file creation**

```bash
ls -la frontend/src/pages/HomePage.jsx
# Expected: File exists with correct content
```

**Step 3: Commit**

```bash
git add frontend/src/pages/HomePage.jsx
git commit -m "feat: create blank home page component"
```

---

## Task 4: Create Admin Users Page Component

**Objective:** Dedicated user management page extracted from old App.jsx.

**Files:**
- Create: `frontend/src/pages/AdminUsersPage.jsx`

**Step 1: Create AdminUsersPage component**

Create `frontend/src/pages/AdminUsersPage.jsx`:

```jsx
import { useState, useEffect } from 'react';
import { useAuth } from '../OidcContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';

export default function AdminUsersPage() {
  const { user } = useAuth();
  const [adminUsers, setAdminUsers] = useState([]);
  const [newUser, setNewUser] = useState({ email: '', name: '', active: true, admin: false });
  const [loading, setLoading] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  useEffect(() => {
    loadAdminUsers();
  }, []);

  async function loadAdminUsers() {
    try {
      const res = await fetch('/api/admin/users', {
        headers: { 'Authorization': `Bearer ${user?.access_token}` },
      });
      if (res.ok) setAdminUsers(await res.json());
    } catch (e) {
      console.error('Failed to load users:', e);
    }
  }

  async function addUser() {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user?.access_token}`,
        },
        body: JSON.stringify(newUser),
      });
      if (res.ok) {
        setNewUser({ email: '', name: '', active: true, admin: false });
        await loadAdminUsers();
      } else {
        const err = await res.json();
        alert(err.detail || 'Failed to add user');
      }
    } catch (e) {
      alert(e.message);
    } finally {
      setLoading(false);
    }
  }

  async function toggleUserField(email, field) {
    const current = adminUsers.find(u => u.email === email);
    if (!current) return;
    try {
      await fetch(`/api/admin/users/${encodeURIComponent(email)}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user?.access_token}`,
        },
        body: JSON.stringify({ [field]: !current[field] }),
      });
      await loadAdminUsers();
    } catch (e) {
      alert(e.message);
    }
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    try {
      await fetch(`/api/admin/users/${encodeURIComponent(deleteTarget)}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${user?.access_token}` },
      });
      await loadAdminUsers();
    } catch (e) {
      alert(e.message);
    } finally {
      setDeleteTarget(null);
    }
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      {/* Add User Card */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Add New User</CardTitle>
          <CardDescription>Create a new managed user.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <Input
            type="email"
            placeholder="Email address"
            value={newUser.email}
            onChange={e => setNewUser({ ...newUser, email: e.target.value })}
          />
          <Input
            type="text"
            placeholder="Display name (optional)"
            value={newUser.name}
            onChange={e => setNewUser({ ...newUser, name: e.target.value })}
          />
          <div className="flex gap-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <Checkbox
                checked={newUser.active}
                onCheckedChange={checked => setNewUser({ ...newUser, active: checked })}
              />
              Active
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <Checkbox
                checked={newUser.admin}
                onCheckedChange={checked => setNewUser({ ...newUser, admin: checked })}
              />
              Admin
            </label>
          </div>
        </CardContent>
      </Card>

      {/* Users List Card */}
      <Card>
        <CardHeader>
          <CardTitle>Managed Users ({adminUsers.length})</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          {adminUsers.map(u => (
            <div
              key={u.id}
              className={`flex items-center justify-between p-3 rounded-lg border ${!u.active ? 'opacity-60' : ''}`}
            >
              <div className="flex flex-col gap-1">
                <span className="font-medium">{u.email}</span>
                {u.name && <span className="text-sm text-muted-foreground">{u.name}</span>}
                <div className="flex gap-1 mt-1">
                  {u.admin && <Badge variant="secondary">Admin</Badge>}
                  {!u.active && <Badge variant="destructive">Inactive</Badge>}
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant={u.active ? "outline" : "secondary"}
                  onClick={() => toggleUserField(u.email, 'active')}
                  title={u.active ? 'Deactivate' : 'Activate'}
                >
                  {u.active ? 'Active' : 'Inactive'}
                </Button>
                <Button
                  size="sm"
                  variant={u.admin ? "outline" : "secondary"}
                  onClick={() => toggleUserField(u.email, 'admin')}
                  title={u.admin ? 'Remove admin' : 'Make admin'}
                >
                  {u.admin ? 'Admin' : 'User'}
                </Button>
                <Dialog open={!!deleteTarget && deleteTarget === u.email} onOpenChange={(open) => !open && setDeleteTarget(null)}>
                  <DialogTrigger asChild>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => setDeleteTarget(u.email)}
                    >
                      Delete
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Delete User</DialogTitle>
                      <DialogDescription>
                        Are you sure you want to delete <strong>{u.email}</strong>? This action cannot be undone.
                      </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setDeleteTarget(null)}>
                        Cancel
                      </Button>
                      <Button variant="destructive" onClick={confirmDelete}>
                        Delete
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
```

**Step 2: Verify file creation**

```bash
ls -la frontend/src/pages/AdminUsersPage.jsx
# Expected: File exists with correct content
```

**Step 3: Commit**

```bash
git add frontend/src/pages/AdminUsersPage.jsx
git commit -m "feat: create dedicated admin users management page"
```

---

## Task 5: Refactor App.jsx to Use Routing

**Objective:** Replace monolithic App with routed layout structure.

**Files:**
- Modify: `frontend/src/App.jsx`

**Step 1: Rewrite App.jsx with routing**

Replace entire content of `frontend/src/App.jsx`:

```jsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { OidcProvider, useAuth } from './OidcContext';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import AdminUsersPage from './pages/AdminUsersPage';

const KEYCLOAK_CONFIG = {
  authority: 'https://keycloak.netcraft.fr/realms/hermes',
  client_id: 'hermes-dev',
  redirect_uri: window.location.origin + '/callback',
  response_type: 'code',
  scope: 'openid profile email',
};

function AppContent() {
  const { isAuthenticated, user } = useAuth();

  // Protected route wrapper
  function RequireAdmin({ children }) {
    const [isAdmin, setIsAdmin] = useState(false);
    
    useEffect(() => {
      async function checkAdmin() {
        try {
          const res = await fetch('/api/me', {
            headers: { 'Authorization': `Bearer ${user?.access_token}` },
          });
          if (res.ok) {
            const data = await res.json();
            setIsAdmin(!!data.admin);
          }
        } catch (e) {
          console.error('Failed to check admin status:', e);
        }
      }
      
      if (isAuthenticated && user) checkAdmin();
    }, [isAuthenticated, user]);

    if (!isAdmin) {
      return <HomePage />; // Redirect non-admins to home
    }

    return children;
  }

  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route 
            path="/admin/users" 
            element={
              <RequireAdmin>
                <AdminUsersPage />
              </RequireAdmin>
            } 
          />
          {/* Catch-all redirect to home */}
          <Route path="*" element={<HomePage />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default function App() {
  return (
    <OidcProvider config={KEYCLOAK_CONFIG}>
      <AppContent />
    </OidcProvider>
  );
}
```

**Step 2: Add missing imports to AdminUsersPage**

The AdminUsersPage needs useState and useEffect imported. Fix the import line:

In `frontend/src/pages/AdminUsersPage.jsx`, ensure top has:
```jsx
import { useState, useEffect } from 'react';
```

**Step 3: Verify routing structure**

Check that App.jsx uses BrowserRouter and Routes:
```bash
grep "BrowserRouter" frontend/src/App.jsx
grep "Routes" frontend/src/App.jsx
# Expected: Both present
```

**Step 4: Commit**

```bash
git add frontend/src/App.jsx
git commit -m "refactor: replace monolithic app with routed layout structure"
```

---

## Task 6: Add Dark/Light Mode Toggle to Dropdown Menu

**Objective:** Theme switching capability in the header dropdown menu.

**Files:**
- Modify: `frontend/src/components/Layout.jsx`
- Create: `frontend/src/ThemeContext.jsx`

**Step 1: Create ThemeContext**

Create `frontend/src/ThemeContext.jsx`:

```jsx
import { createContext, useContext, useEffect, useState } from 'react';

const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => {
    // Check localStorage first, then system preference
    if (typeof window !== 'undefined') {
      return localStorage.getItem('theme') || 
        (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    }
    return 'light';
  });

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

const ThemeContext = createContext();

function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

export { ThemeProvider, useTheme };
```

**Step 2: Update Layout.jsx to include theme toggle**

Add these imports at the top of `frontend/src/components/Layout.jsx`:
```jsx
import { useTheme } from '../ThemeContext';
import { Moon, Sun } from 'lucide-react'; // Or use text icons if lucide not installed
```

Then add this DropdownMenuItem before the logout item:
```jsx
<DropdownMenuSeparator />
<DropdownMenuItem onClick={toggleTheme}>
  <span className="mr-2">{theme === 'dark' ? '☀️' : '🌙'}</span>
  {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
</DropdownMenuItem>
```

**Step 3: Update App.jsx to wrap with ThemeProvider**

In `frontend/src/App.jsx`, add import and wrap the app:
```jsx
import { ThemeProvider } from './ThemeContext';

export default function App() {
  return (
    <ThemeProvider>
      <OidcProvider config={KEYCLOAK_CONFIG}>
        <AppContent />
      </OidcProvider>
    </ThemeProvider>
  );
}
```

**Step 4: Verify theme switching works**

Test that clicking the toggle changes the class on html element and persists in localStorage.

**Step 5: Commit**

```bash
git add frontend/src/ThemeContext.jsx frontend/src/components/Layout.jsx frontend/src/App.jsx
git commit -m "feat: add dark/light mode toggle to header dropdown menu"
```

---

## Task 7: Update Backend SPA Serving for Router Compatibility

**Objective:** Ensure FastAPI serves index.html correctly for all client-side routes.

**Files:**
- Modify: `backend/main.py` (if needed)

**Step 1: Verify current SPA serving logic**

Check that the catch-all route in main.py properly handles React Router paths:
```python
@app.get("/{full_path:path}")
async def serve_spa(full_path: str):
    """Serve the SPA for any non-API route."""
    if full_path.startswith("api/"):
        raise HTTPException(status_code=404)
    html_file = FRONTEND_DIST / "index.html"
    if html_file.exists():
        return FileResponse(str(html_file))
    raise HTTPException(status_code=404, detail="Frontend not built")
```

This should already work correctly - it serves index.html for any non-API path.

**Step 2: Test routing works through ngrok**

After building and deploying, test that `/admin/users` loads the correct page when accessed directly.

**Step 3: Commit (if changes needed)**

If no backend changes required, skip this commit.

---

## Task 8: Build Frontend and Test End-to-End

**Objective:** Verify everything works together before finalizing.

**Files:**
- N/A (build/test only)

**Step 1: Install dependencies and build**

```bash
cd /workspace/projects/demo-auth/frontend
npm install
npm run build
```

Expected output: Successful build with no errors, dist/ folder created.

**Step 2: Start backend server**

```bash
cd /workspace/projects/demo-auth/backend
source .venv/bin/activate
uvicorn main:app --host 0.0.0.0 --port 8000
```

**Step 3: Test locally**

```bash
curl -s http://localhost:8000/ | head -5
# Expected: HTML content from index.html

curl -s http://localhost:8000/admin/users | head -5
# Expected: Same HTML (SPA routing)

curl -s http://localhost:8000/api/me 2>/dev/null | python3 -m json.tool
# Expected: {"detail": "Missing or invalid Authorization header"}
```

**Step 4: Start ngrok tunnel**

```bash
ngrok http 8000
sleep 3
curl -s http://localhost:4040/api/tunnels | python3 -c "import sys,json; d=json.load(sys.stdin); print(d['tunnels'][0]['public_url'])"
```

**Step 5: Test through ngrok URL**

Visit the ngrok URL in browser and verify:
- [ ] Login with Keycloak works
- [ ] Header shows avatar dropdown menu
- [ ] Home page displays correctly
- [ ] Admin users page accessible at `/admin/users` (for admin users)
- [ ] Dark/light mode toggle works
- [ ] Logout works

**Step 6: Commit any test fixes**

If any issues found during testing, fix and commit them.

---

## Task 9: Update README with New Structure

**Objective:** Document the new template structure for future projects.

**Files:**
- Modify: `README.md`

**Step 1: Update README content**

Add sections about:
- Project structure overview
- How to use as a template
- Available routes (`/`, `/admin/users`)
- Authentication setup (Keycloak OIDC)
- Theme switching feature
- Development workflow

Example addition:
```markdown
## Template Structure

This project serves as a reusable authentication template with:
- Persistent header layout with user avatar dropdown menu
- Client-side routing via React Router
- Dark/light mode theme toggle
- Admin-only user management page at `/admin/users`
- Keycloak OIDC integration for Google login

### Routes
- `/` - Home page (blank template)
- `/admin/users` - User management (admin only)

### Customization
To create a new project from this template:
1. Clone the repository
2. Replace HomePage content with your features
3. Add new routes as needed in App.jsx
4. Configure Keycloak client ID if different
```

**Step 2: Commit**

```bash
git add README.md
git commit -m "docs: update README with template structure documentation"
```

---

## Task 10: Final Cleanup and Verification

**Objective:** Ensure code quality and remove any demo-specific artifacts.

**Files:**
- Multiple files (cleanup)

**Step 1: Remove demo-specific content**

Check for any remaining "demo" references in component text that should be generic:
```bash
grep -r "demo\|Demo\|DEMO" frontend/src/ --include="*.jsx" | grep -v node_modules
# Review and update any hardcoded demo text
```

**Step 2: Verify all imports are correct**

Check for unused imports or missing dependencies:
```bash
cd /workspace/projects/demo-auth/frontend
npm run build
# Should complete without errors
```

**Step 3: Final test through ngrok**

Deploy and verify the complete flow one more time.

**Step 4: Tag release (optional)**

```bash
git tag -a v1.0-template -m "Generic auth template with layout, routing, and admin users page"
git push origin main --tags
```

---

## Summary of Changes

### New Files Created
- `frontend/src/components/Layout.jsx` — Persistent header with avatar dropdown
- `frontend/src/pages/HomePage.jsx` — Blank home page component  
- `frontend/src/pages/AdminUsersPage.jsx` — Dedicated user management page
- `frontend/src/ThemeContext.jsx` — Dark/light mode context provider

### Modified Files
- `frontend/src/App.jsx` — Replaced monolithic app with routed structure
- `frontend/package.json` — Added react-router-dom dependency
- `README.md` — Updated documentation for template usage

### Deleted Files
None (old App.jsx content replaced in-place)

### Key Features Delivered
✅ Thin persistent header layout  
✅ User avatar dropdown menu with logout  
✅ Dark/light mode theme toggle  
✅ Client-side routing via React Router  
✅ Blank home page as default route  
✅ Admin-only `/admin/users` route for user management  
✅ Generic template ready for customization  

---

**Total Estimated Time:** ~45 minutes across all tasks
**Risk Level:** Low (mostly refactoring, no backend changes)
**Rollback Plan:** Git revert to previous commit if needed
