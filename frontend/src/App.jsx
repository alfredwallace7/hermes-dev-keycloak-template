import { useState, useEffect } from 'react';
import { OidcProvider, useAuth } from './OidcContext';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';

const KEYCLOAK_CONFIG = {
  authority: 'https://keycloak.netcraft.fr/realms/hermes',
  client_id: 'hermes-dev',
  redirect_uri: window.location.origin + '/callback',
  response_type: 'code',
  scope: 'openid profile email',
};

function AppContent() {
  const { isAuthenticated, user, login, logout } = useAuth();
  const [apiMessage, setApiMessage] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminUsers, setAdminUsers] = useState([]);
  const [newUser, setNewUser] = useState({ email: '', name: '', active: true, admin: false });
  const [loading, setLoading] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  async function fetchUserProfile() {
    try {
      const res = await fetch('/api/me', {
        headers: { 'Authorization': `Bearer ${user?.access_token}` },
      });
      const data = await res.json();
      setApiMessage(data);
      setIsAdmin(!!data.admin);
      if (data.admin) loadAdminUsers();
    } catch (e) {
      setApiMessage({ error: e.message });
    }
  }

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

  useEffect(() => {
    if (isAuthenticated && !user) fetchUserProfile();
  }, [isAuthenticated]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-start px-4 py-8">
      {/* Header */}
      <header className="text-center mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Hermes Auth Demo</h1>
        <p className="text-muted-foreground mt-2">React + FastAPI + Keycloak OIDC</p>
      </header>

      {!isAuthenticated ? (
        /* Login Card */
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Welcome!</CardTitle>
            <CardDescription>Login with your Hermes account to continue.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={login} className="w-full" size="lg">
              Login with Keycloak
            </Button>
          </CardContent>
        </Card>
      ) : (
        /* Authenticated Content */
        <div className="w-full max-w-2xl flex flex-col gap-6">
          {/* User Profile Card */}
          <Card>
            <CardHeader>
              <CardTitle>Hello, {user?.profile?.preferred_username || 'User'}!</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
              {user?.profile?.email && (
                <p className="text-sm text-muted-foreground">
                  <strong>Email:</strong> {user.profile.email}
                </p>
              )}
              {user?.profile?.name && (
                <p className="text-sm text-muted-foreground">
                  <strong>Name:</strong> {user.profile.name}
                </p>
              )}
              {isAdmin && (
                <Badge variant="secondary" className="mt-1">Admin</Badge>
              )}
            </CardContent>
            <CardFooter>
              <Button onClick={logout} variant="outline" className="w-full">
                Logout
              </Button>
            </CardFooter>
          </Card>

          {/* API Test Card */}
          <Card>
            <CardHeader>
              <CardTitle>Backend API Test</CardTitle>
              <CardDescription>Click to call the protected FastAPI endpoint.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <Button onClick={fetchUserProfile} disabled={loading}>
                {loading && <Skeleton className="size-4" />}
                Call /api/me
              </Button>
              {apiMessage && (
                <Alert variant={apiMessage.error ? "destructive" : "default"}>
                  <AlertDescription>
                    <pre className="text-xs mt-2 overflow-x-auto">
                      {JSON.stringify(apiMessage, null, 2)}
                    </pre>
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          {/* Admin Panel */}
          {isAdmin && (
            <>
              <Separator />

              {/* Add User Card */}
              <Card>
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
                <CardFooter>
                  <Button
                    onClick={addUser}
                    disabled={!newUser.email || loading}
                    className="w-full"
                  >
                    {loading ? 'Adding...' : 'Add User'}
                  </Button>
                </CardFooter>
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
            </>
          )}
        </div>
      )}

      {/* Footer */}
      <footer className="mt-auto pt-8 text-center text-sm text-muted-foreground">
        Built with Hermes &middot; Powered by Keycloak OIDC
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <OidcProvider config={KEYCLOAK_CONFIG}>
      <AppContent />
    </OidcProvider>
  );
}
