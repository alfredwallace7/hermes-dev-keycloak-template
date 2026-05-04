import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../OidcContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default function AdminUsersPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [adminUsers, setAdminUsers] = useState([]);
  const [newUser, setNewUser] = useState({ email: '', name: '', active: true, admin: false });
  const [loading, setLoading] = useState(false);
  const [fetchingUsers, setFetchingUsers] = useState(false);
  const [message, setMessage] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  useEffect(() => {
    loadAdminUsers();
  }, []);

  async function getErrorMessage(res, fallback) {
    try {
      const err = await res.json();
      return err.detail || fallback;
    } catch {
      return fallback;
    }
  }

  async function loadAdminUsers() {
    setFetchingUsers(true);
    try {
      const res = await fetch('/api/admin/users', {
        headers: { 'Authorization': `Bearer ${user?.access_token}` },
      });
      if (res.ok) {
        setAdminUsers(await res.json());
      } else {
        setMessage({
          type: 'error',
          title: 'Failed to load users',
          description: await getErrorMessage(res, 'Could not fetch managed users.'),
        });
      }
    } catch (e) {
      console.error('Failed to load users:', e);
      setMessage({
        type: 'error',
        title: 'Failed to load users',
        description: e.message || 'Could not fetch managed users.',
      });
    } finally {
      setFetchingUsers(false);
    }
  }

  async function addUser() {
    setLoading(true);
    setMessage(null);
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
        setMessage({
          type: 'success',
          title: 'User added',
          description: `${newUser.email} was added successfully.`,
        });
      } else {
        setMessage({
          type: 'error',
          title: 'Failed to add user',
          description: await getErrorMessage(res, 'Could not add the user.'),
        });
      }
    } catch (e) {
      setMessage({
        type: 'error',
        title: 'Failed to add user',
        description: e.message || 'Could not add the user.',
      });
    } finally {
      setLoading(false);
    }
  }

  async function toggleUserField(email, field) {
    const current = adminUsers.find(u => u.email === email);
    if (!current) return;
    setMessage(null);
    try {
      const res = await fetch(`/api/admin/users/${encodeURIComponent(email)}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user?.access_token}`,
        },
        body: JSON.stringify({ [field]: !current[field] }),
      });
      if (res.ok) {
        await loadAdminUsers();
        setMessage({
          type: 'success',
          title: 'User updated',
          description: `${email} was updated successfully.`,
        });
      } else {
        setMessage({
          type: 'error',
          title: 'Failed to update user',
          description: await getErrorMessage(res, 'Could not update the user.'),
        });
      }
    } catch (e) {
      setMessage({
        type: 'error',
        title: 'Failed to update user',
        description: e.message || 'Could not update the user.',
      });
    }
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    setMessage(null);
    try {
      const res = await fetch(`/api/admin/users/${encodeURIComponent(deleteTarget)}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${user?.access_token}` },
      });
      if (res.ok) {
        await loadAdminUsers();
        setMessage({
          type: 'success',
          title: 'User deleted',
          description: `${deleteTarget} was deleted successfully.`,
        });
      } else {
        setMessage({
          type: 'error',
          title: 'Failed to delete user',
          description: await getErrorMessage(res, 'Could not delete the user.'),
        });
      }
    } catch (e) {
      setMessage({
        type: 'error',
        title: 'Failed to delete user',
        description: e.message || 'Could not delete the user.',
      });
    } finally {
      setDeleteTarget(null);
    }
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <div className="mb-6">
        <Button variant="outline" onClick={() => navigate('/')}>
          Back
        </Button>
      </div>

      {message && (
        <Alert
          variant={message.type === 'error' ? 'destructive' : 'default'}
          className="mb-6"
        >
          <AlertTitle>{message.title}</AlertTitle>
          <AlertDescription>{message.description}</AlertDescription>
        </Alert>
      )}

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
          <div>
            <Button onClick={addUser} disabled={loading}>
              {loading ? 'Adding...' : 'Add User'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Users List Card */}
      <Card>
        <CardHeader>
          <CardTitle>Managed Users ({adminUsers.length})</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          {fetchingUsers ? (
            <div className="rounded-lg border p-4 text-sm text-muted-foreground">
              Loading users...
            </div>
          ) : adminUsers.length === 0 ? (
            <div className="rounded-lg border p-4 text-sm text-muted-foreground">
              No managed users found.
            </div>
          ) : adminUsers.map(u => (
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
