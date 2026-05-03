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
