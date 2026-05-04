import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../OidcContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Label } from '@/components/ui/label';
import { Toaster, toast } from 'sonner';
import {
  Search, Plus, Edit2, Trash2, UserCheck, UserX, Shield, Users,
  RefreshCw, X, CheckCircle2, AlertCircle, Filter, ChevronDown, ChevronUp
} from 'lucide-react';

const FILTER_TABS = [
  { key: 'all', label: 'All', icon: Users },
  { key: 'active', label: 'Active', icon: UserCheck },
  { key: 'inactive', label: 'Inactive', icon: UserX },
  { key: 'admin', label: 'Admins', icon: Shield },
];

export default function AdminUsersPage() {
  const { user } = useAuth();
  const [adminUsers, setAdminUsers] = useState([]);
  const [newUser, setNewUser] = useState({ email: '', name: '', active: true, admin: false });
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [editTarget, setEditTarget] = useState(null);
  const [editForm, setEditForm] = useState({ name: '', email: '' });
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [collapsedAddUser, setCollapsedAddUser] = useState(false);

  useEffect(() => {
    loadAdminUsers();
  }, []);

  async function loadAdminUsers() {
    try {
      setInitialLoading(true);
      const res = await fetch('/api/admin/users', {
        headers: { 'Authorization': `Bearer ${user?.access_token}` },
      });
      if (res.ok) {
        setAdminUsers(await res.json());
      } else {
        toast.error('Failed to load users');
      }
    } catch (e) {
      toast.error('Network error loading users');
    } finally {
      setInitialLoading(false);
    }
  }

  async function addUser() {
    if (!newUser.email.trim()) {
      toast.warning('Email is required');
      return;
    }
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
        toast.success('User created successfully');
        setNewUser({ email: '', name: '', active: true, admin: false });
        await loadAdminUsers();
      } else {
        const err = await res.json();
        toast.error(err.detail || 'Failed to add user');
      }
    } catch (e) {
      toast.error(e.message);
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
      toast.success(`User ${field} toggled`);
      await loadAdminUsers();
    } catch (e) {
      toast.error(e.message);
    }
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    try {
      await fetch(`/api/admin/users/${encodeURIComponent(deleteTarget)}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${user?.access_token}` },
      });
      toast.success('User deleted successfully');
      await loadAdminUsers();
    } catch (e) {
      toast.error(e.message);
    } finally {
      setDeleteTarget(null);
    }
  }

  async function saveEdit() {
    if (!editTarget || !editForm.email.trim()) {
      toast.warning('Email is required');
      return;
    }
    setLoading(true);
    try {
      const body = {};
      if (editForm.name !== editTarget.name) body.name = editForm.name;
      if (editForm.email !== editTarget.email) body.email = editForm.email;

      await fetch(`/api/admin/users/${encodeURIComponent(editTarget.email)}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user?.access_token}`,
        },
        body: JSON.stringify(body),
      });
      toast.success('User updated successfully');
      setEditTarget(null);
      await loadAdminUsers();
    } catch (e) {
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  }

  const filteredUsers = useMemo(() => {
    return adminUsers.filter(u => {
      const matchesSearch = !searchQuery ||
        u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (u.name && u.name.toLowerCase().includes(searchQuery.toLowerCase()));
      if (!matchesSearch) return false;

      switch (activeFilter) {
        case 'active': return u.active;
        case 'inactive': return !u.active;
        case 'admin': return u.admin;
        default: return true;
      }
    });
  }, [adminUsers, searchQuery, activeFilter]);

  const stats = useMemo(() => ({
    total: adminUsers.length,
    active: adminUsers.filter(u => u.active).length,
    inactive: adminUsers.filter(u => !u.active).length,
    admins: adminUsers.filter(u => u.admin).length,
  }), [adminUsers]);

  const statCards = [
    { label: 'Total Users', value: stats.total, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Active', value: stats.active, icon: UserCheck, color: 'text-green-600', bg: 'bg-green-50' },
    { label: 'Inactive', value: stats.inactive, icon: UserX, color: 'text-red-600', bg: 'bg-red-50' },
    { label: 'Admins', value: stats.admins, icon: Shield, color: 'text-purple-600', bg: 'bg-purple-50' },
  ];

  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl">
      <Toaster position="top-right" richColors />

      {/* Page Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Users className="w-6 h-6" />
            User Management
          </h1>
          <p className="text-muted-foreground mt-1">Manage and monitor all system users</p>
        </div>
        <Button variant="outline" size="sm" onClick={loadAdminUsers} disabled={initialLoading}>
          <RefreshCw className={`w-4 h-4 mr-2 ${initialLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {statCards.map((card) => (
          initialLoading ? (
            <Card key={card.label}>
              <CardContent className="p-4 flex items-center gap-3">
                <Skeleton className="w-10 h-10 rounded-lg" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-7 w-8" />
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card key={card.label}>
              <CardContent className="p-4 flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg ${card.bg} flex items-center justify-center`}>
                  <card.icon className={`w-5 h-5 ${card.color}`} />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{card.label}</p>
                  <p className="text-2xl font-bold">{card.value}</p>
                </div>
              </CardContent>
            </Card>
          )
        ))}
      </div>

      {/* Add User Card */}
      <Card className="mb-6">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div>
            <CardTitle>Add New User</CardTitle>
            <CardDescription>Create a new managed user.</CardDescription>
          </div>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => setCollapsedAddUser(!collapsedAddUser)}
            className="h-8 w-8"
          >
            {collapsedAddUser ? (
              <ChevronDown className="w-4 h-4" />
            ) : (
              <ChevronUp className="w-4 h-4" />
            )}
          </Button>
        </CardHeader>
        {!collapsedAddUser && (
          <CardContent className="flex flex-col gap-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="new-email">Email address</Label>
                <Input
                  id="new-email"
                  type="email"
                  placeholder="user@example.com"
                  value={newUser.email}
                  onChange={e => setNewUser({ ...newUser, email: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-name">Display name</Label>
                <Input
                  id="new-name"
                  type="text"
                  placeholder="Optional display name"
                  value={newUser.name}
                  onChange={e => setNewUser({ ...newUser, name: e.target.value })}
                />
              </div>
            </div>
            <div className="flex items-center gap-6">
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
            <Button onClick={addUser} disabled={loading}>
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-2" />
                  Add User
                </>
              )}
            </Button>
          </CardContent>
        )}
      </Card>

      {/* Users Table Card */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <CardTitle>Managed Users ({filteredUsers.length})</CardTitle>

            {/* Search Bar */}
            <div className="relative w-full md:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search by email or name..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="flex gap-1 mt-4 bg-muted/50 p-1 rounded-lg w-fit">
            {FILTER_TABS.map(tab => (
              <Button
                key={tab.key}
                variant={activeFilter === tab.key ? 'default' : 'ghost'}
                size="sm"
                className="gap-2 text-xs"
                onClick={() => setActiveFilter(tab.key)}
              >
                <tab.icon className="w-3.5 h-3.5" />
                {tab.label}
              </Button>
            ))}
          </div>
        </CardHeader>

        <CardContent>
          {initialLoading ? (
            <div className="space-y-3">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="flex items-center gap-4 p-3">
                  <Skeleton className="h-4 w-48" />
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-5 w-16 rounded-full" />
                  <Skeleton className="h-5 w-16 rounded-full" />
                  <div className="ml-auto flex gap-2">
                    <Skeleton className="h-8 w-20" />
                    <Skeleton className="h-8 w-20" />
                    <Skeleton className="h-8 w-16" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <AlertCircle className="w-12 h-12 text-muted-foreground mb-4" />
              <h3 className="font-medium text-lg mb-1">No users found</h3>
              <p className="text-sm text-muted-foreground max-w-xs">
                {searchQuery || activeFilter !== 'all'
                  ? 'Try adjusting your search or filter criteria.'
                  : 'There are no managed users yet. Add one above to get started.'}
              </p>
              {(searchQuery || activeFilter !== 'all') && (
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-4"
                  onClick={() => { setSearchQuery(''); setActiveFilter('all'); }}
                >
                  <X className="w-3.5 h-3.5 mr-1" />
                  Clear filters
                </Button>
              )}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map(u => (
                  <TableRow key={u.id} className={!u.active ? 'opacity-60' : ''}>
                    <TableCell className="font-medium">{u.email}</TableCell>
                    <TableCell>{u.name || <span className="text-muted-foreground italic">No name</span>}</TableCell>
                    <TableCell>
                      <Badge variant={u.active ? 'default' : 'destructive'}>
                        {u.active ? (
                          <>
                            <CheckCircle2 className="w-3 h-3 mr-1" />
                            Active
                          </>
                        ) : (
                          <>
                            <AlertCircle className="w-3 h-3 mr-1" />
                            Inactive
                          </>
                        )}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {u.admin ? (
                        <Badge variant="secondary">
                          <Shield className="w-3 h-3 mr-1" />
                          Admin
                        </Badge>
                      ) : (
                        <Badge variant="outline">User</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        {/* Edit Dialog */}
                        <Dialog open={!!editTarget && editTarget.id === u.id} onOpenChange={(open) => !open && setEditTarget(null)}>
                          <DialogTrigger asChild>
                            <Button size="sm" variant="outline" onClick={() => { setEditTarget(u); setEditForm({ name: u.name || '', email: u.email }); }}>
                              <Edit2 className="w-3.5 h-3.5 mr-1" />
                              Edit
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Edit User</DialogTitle>
                              <DialogDescription>Update user details below.</DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4 py-2">
                              <div className="space-y-2">
                                <Label htmlFor="edit-email">Email</Label>
                                <Input
                                  id="edit-email"
                                  type="email"
                                  value={editForm.email}
                                  onChange={e => setEditForm({ ...editForm, email: e.target.value })}
                                />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="edit-name">Name</Label>
                                <Input
                                  id="edit-name"
                                  type="text"
                                  value={editForm.name}
                                  onChange={e => setEditForm({ ...editForm, name: e.target.value })}
                                />
                              </div>
                            </div>
                            <DialogFooter>
                              <Button variant="outline" onClick={() => setEditTarget(null)}>
                                Cancel
                              </Button>
                              <Button onClick={saveEdit} disabled={loading}>
                                {loading ? 'Saving...' : 'Save Changes'}
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>

                        {/* Toggle Active */}
                        <Button
                          size="sm"
                          variant={u.active ? "outline" : "secondary"}
                          onClick={() => toggleUserField(u.email, 'active')}
                          title={u.active ? 'Deactivate' : 'Activate'}
                        >
                          {u.active ? (
                            <>
                              <UserCheck className="w-3.5 h-3.5 mr-1" />
                              Active
                            </>
                          ) : (
                            <>
                              <UserX className="w-3.5 h-3.5 mr-1" />
                              Inactive
                            </>
                          )}
                        </Button>

                        {/* Toggle Admin */}
                        <Button
                          size="sm"
                          variant={u.admin ? "outline" : "secondary"}
                          onClick={() => toggleUserField(u.email, 'admin')}
                          title={u.admin ? 'Remove admin' : 'Make admin'}
                        >
                          {u.admin ? (
                            <>
                              <Shield className="w-3.5 h-3.5 mr-1" />
                              Admin
                            </>
                          ) : (
                            <>
                              <Users className="w-3.5 h-3.5 mr-1" />
                              User
                            </>
                          )}
                        </Button>

                        {/* Delete Dialog */}
                        <Dialog open={!!deleteTarget && deleteTarget === u.email} onOpenChange={(open) => !open && setDeleteTarget(null)}>
                          <DialogTrigger asChild>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => setDeleteTarget(u.email)}
                            >
                              <Trash2 className="w-3.5 h-3.5 mr-1" />
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
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
