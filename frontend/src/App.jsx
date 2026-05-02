import { useState, useEffect } from 'react';
import { OidcProvider, useAuth } from './OidcContext';

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

  async function deleteUser(email) {
    if (!confirm(`Delete user ${email}?`)) return;
    try {
      await fetch(`/api/admin/users/${encodeURIComponent(email)}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${user?.access_token}` },
      });
      await loadAdminUsers();
    } catch (e) {
      alert(e.message);
    }
  }

  useEffect(() => {
    if (isAuthenticated && !user) fetchUserProfile();
  }, [isAuthenticated]);

  return (
    <div className="container">
      <header>
        <h1>Hermes Auth Demo</h1>
        <p className="subtitle">React + FastAPI + Keycloak OIDC</p>
      </header>

      {!isAuthenticated ? (
        <div className="card login-card">
          <h2>Welcome!</h2>
          <p>Login with your Hermes account to continue.</p>
          <button onClick={login} className="btn btn-primary">
            Login with Keycloak
          </button>
        </div>
      ) : (
        <>
          {/* User Card */}
          <div className="card user-card">
            <h2>Hello, {user?.profile?.preferred_username || 'User'}!</h2>
            <div className="user-info">
              {user?.profile?.email && (
                <p><strong>Email:</strong> {user.profile.email}</p>
              )}
              {user?.profile?.name && (
                <p><strong>Name:</strong> {user.profile.name}</p>
              )}
              {isAdmin && <span className="badge admin-badge">⚡ Admin</span>}
            </div>
            <button onClick={logout} className="btn btn-secondary">
              Logout
            </button>
          </div>

          {/* API Test Card */}
          <div className="card api-card">
            <h2>Backend API Test</h2>
            <p>Click to call the protected FastAPI endpoint:</p>
            <button onClick={fetchUserProfile} className="btn btn-primary" disabled={loading}>
              {loading ? 'Loading...' : 'Call /api/me'}
            </button>
            {apiMessage && (
              <pre className="response">
                {JSON.stringify(apiMessage, null, 2)}
              </pre>
            )}
          </div>

          {/* Admin Panel */}
          {isAdmin && (
            <>
              {/* Add User Card */}
              <div className="card admin-card">
                <h2>Add New User</h2>
                <div className="form-group">
                  <input
                    type="email"
                    placeholder="Email address"
                    value={newUser.email}
                    onChange={e => setNewUser({ ...newUser, email: e.target.value })}
                    className="admin-input"
                  />
                </div>
                <div className="form-group">
                  <input
                    type="text"
                    placeholder="Display name (optional)"
                    value={newUser.name}
                    onChange={e => setNewUser({ ...newUser, name: e.target.value })}
                    className="admin-input"
                  />
                </div>
                <div className="form-group checkbox-row">
                  <label>
                    <input
                      type="checkbox"
                      checked={newUser.active}
                      onChange={e => setNewUser({ ...newUser, active: e.target.checked })}
                    />
                    Active
                  </label>
                  <label>
                    <input
                      type="checkbox"
                      checked={newUser.admin}
                      onChange={e => setNewUser({ ...newUser, admin: e.target.checked })}
                    />
                    Admin
                  </label>
                </div>
                <button onClick={addUser} className="btn btn-primary" disabled={!newUser.email || loading}>
                  {loading ? 'Adding...' : 'Add User'}
                </button>
              </div>

              {/* Users Table Card */}
              <div className="card admin-card">
                <h2>Managed Users ({adminUsers.length})</h2>
                <div className="user-table">
                  {adminUsers.map(u => (
                    <div key={u.id} className={`user-row ${!u.active ? 'inactive' : ''}`}>
                      <div className="user-main">
                        <span className="user-email">{u.email}</span>
                        {u.name && <span className="user-name">{u.name}</span>}
                        <div className="badges">
                          {u.admin && <span className="badge admin-badge">⚡ Admin</span>}
                          {!u.active && <span className="badge inactive-badge">Inactive</span>}
                        </div>
                      </div>
                      <div className="user-actions">
                        <button
                          onClick={() => toggleUserField(u.email, 'active')}
                          className={`btn-toggle ${u.active ? 'on' : 'off'}`}
                          title={u.active ? 'Deactivate' : 'Activate'}
                        >
                          {u.active ? '✓' : '✗'}
                        </button>
                        <button
                          onClick={() => toggleUserField(u.email, 'admin')}
                          className={`btn-toggle ${u.admin ? 'on' : 'off'}`}
                          title={u.admin ? 'Remove admin' : 'Make admin'}
                        >
                          {u.admin ? '⚡' : '○'}
                        </button>
                        <button
                          onClick={() => deleteUser(u.email)}
                          className="btn-toggle delete"
                          title="Delete user"
                        >
                          🗑
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </>
      )}

      <footer>
        <p>Built with Hermes • Powered by Keycloak OIDC</p>
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
