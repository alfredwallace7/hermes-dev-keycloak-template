import { useEffect, useMemo, useCallback, useReducer } from 'react';
import { useAuth } from '../OidcContext';
import { API_ADMIN_USERS } from '../utils/constants';
import { apiRequest } from '../utils/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Toaster, toast } from 'sonner';
import { Link } from 'react-router-dom';
import {
  Search, Users, RefreshCw, X, AlertCircle, UserCheck, UserX, Shield, ArrowLeft
} from 'lucide-react';

import { StatCards } from '../components/admin/StatCards';
import { AddUserForm } from '../components/admin/AddUserForm';
import { UserTableRow } from '../components/admin/UserTableRow';

const FILTER_TABS = [
  { key: 'all', label: 'All', icon: Users },
  { key: 'active', label: 'Active', icon: UserCheck },
  { key: 'inactive', label: 'Inactive', icon: UserX },
  { key: 'admin', label: 'Admins', icon: Shield },
];

const SKELETON_ROW_IDS = ['loading-user-a', 'loading-user-b', 'loading-user-c', 'loading-user-d'];

const initialState = {
  adminUsers: [],
  newUser: { email: '', name: '', active: true, admin: false },
  loading: false,
  initialLoading: true,
  refreshing: false,
  searchQuery: '',
  activeFilter: 'all',
  collapsedAddUser: false,
};

function adminReducer(state, action) {
  switch (action.type) {
    case 'SET_USERS':
      return { ...state, adminUsers: action.payload, initialLoading: false };
    case 'SET_NEW_USER':
      return { ...state, newUser: { ...state.newUser, ...action.payload } };
    case 'RESET_NEW_USER':
      return { ...state, newUser: { email: '', name: '', active: true, admin: false } };
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_INITIAL_LOADING':
      return { ...state, initialLoading: action.payload };
    case 'SET_REFRESHING':
      return { ...state, refreshing: action.payload };
    case 'SET_SEARCH':
      return { ...state, searchQuery: action.payload };
    case 'SET_FILTER':
      return { ...state, activeFilter: action.payload };
    case 'TOGGLE_COLLAPSE':
      return { ...state, collapsedAddUser: !state.collapsedAddUser };
    default:
      return state;
  }
}

export default function AdminUsersPage() {
  const { user } = useAuth();
  const [state, dispatch] = useReducer(adminReducer, initialState);
  const { adminUsers, newUser, loading, initialLoading, refreshing, searchQuery, activeFilter, collapsedAddUser } = state;

  const loadAdminUsers = useCallback(async ({ initial = false } = {}) => {
    try {
      dispatch({ type: initial ? 'SET_INITIAL_LOADING' : 'SET_REFRESHING', payload: true });
      const users = await apiRequest(API_ADMIN_USERS, { token: user?.access_token });
      dispatch({ type: 'SET_USERS', payload: users });
    } catch (e) {
      toast.error(e.message || 'Network error loading users');
    } finally {
      dispatch({ type: initial ? 'SET_INITIAL_LOADING' : 'SET_REFRESHING', payload: false });
    }
  }, [user]);

  useEffect(() => {
    loadAdminUsers({ initial: true });
  }, [loadAdminUsers]);

  async function addUser() {
    if (!newUser.email.trim()) {
      toast.warning('Email is required');
      return;
    }
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      await apiRequest(API_ADMIN_USERS, {
        token: user?.access_token,
        method: 'POST',
        body: newUser,
      });
      toast.success('User created successfully');
      dispatch({ type: 'RESET_NEW_USER' });
      await loadAdminUsers();
    } catch (e) {
      toast.error(e.message);
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }

  async function toggleUserField(email, field) {
    const current = adminUsers.find(u => u.email === email);
    if (!current) return;
    try {
      await apiRequest(`${API_ADMIN_USERS}/${encodeURIComponent(email)}`, {
        token: user?.access_token,
        method: 'PUT',
        body: { [field]: !current[field] },
      });
      toast.success(`User ${field} toggled`);
      await loadAdminUsers();
    } catch (e) {
      toast.error(e.message);
    }
  }

  async function confirmDelete(email) {
    try {
      await apiRequest(`${API_ADMIN_USERS}/${encodeURIComponent(email)}`, {
        token: user?.access_token,
        method: 'DELETE',
      });
      toast.success('User deleted successfully');
      await loadAdminUsers();
      return true;
    } catch (e) {
      toast.error(e.message);
      return false;
    }
  }

  async function saveEdit(originalUser, editForm) {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const body = {};
      if (editForm.name !== originalUser.name) body.name = editForm.name;
      if (editForm.email !== originalUser.email) body.email = editForm.email;

      await apiRequest(`${API_ADMIN_USERS}/${encodeURIComponent(originalUser.email)}`, {
        token: user?.access_token,
        method: 'PUT',
        body,
      });
      toast.success('User updated successfully');
      await loadAdminUsers();
      return true;
    } catch (e) {
      toast.error(e.message);
      return false;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
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

  const statCardsConfig = [
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
        <div className="flex items-start gap-3">
          <Button asChild variant="ghost" size="icon-sm" className="mt-0.5">
            <Link to="/" aria-label="Back to home">
              <ArrowLeft className="w-4 h-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Users className="w-6 h-6" />
              User Management
            </h1>
            <p className="text-muted-foreground mt-1">Manage and monitor all system users</p>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={() => loadAdminUsers()} disabled={initialLoading || refreshing}>
          <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      <StatCards stats={stats} initialLoading={initialLoading} statCardsConfig={statCardsConfig} />

      <AddUserForm
        newUser={newUser}
        setNewUser={(val) => dispatch({ type: 'SET_NEW_USER', payload: val })}
        addUser={addUser}
        loading={loading}
        collapsed={collapsedAddUser}
        setCollapsed={() => dispatch({ type: 'TOGGLE_COLLAPSE' })}
      />

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
                onChange={e => dispatch({ type: 'SET_SEARCH', payload: e.target.value })}
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
                onClick={() => dispatch({ type: 'SET_FILTER', payload: tab.key })}
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
              {SKELETON_ROW_IDS.map((id) => (
                <div key={id} className="flex items-center gap-4 p-3">
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
                  onClick={() => {
                    dispatch({ type: 'SET_SEARCH', payload: '' });
                    dispatch({ type: 'SET_FILTER', payload: 'all' });
                  }}
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
                  <UserTableRow
                    key={u.id}
                    user={u}
                    toggleUserField={toggleUserField}
                    confirmDelete={confirmDelete}
                    saveEdit={saveEdit}
                    loading={loading}
                  />
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
