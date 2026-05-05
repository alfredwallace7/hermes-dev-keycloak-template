import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../OidcContext';
import { useTheme } from '../ThemeContext';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

import { useAdmin } from '../hooks/useAdmin';

export default function Layout({ children }) {
  const { isAuthenticated, user, logout, login } = useAuth();
  const { theme, setTheme } = useTheme();
  const { isAdmin } = useAdmin();
  const navigate = useNavigate();
  const userName = user?.profile?.name || user?.profile?.email || 'User';
  const userEmail = user?.profile?.email;
  
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

  const handleLogout = () => {
    logout();
  };

  const handleLogin = () => {
    navigate('/login');
    login();
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Thin persistent header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="flex h-14 items-center justify-between px-4 md:px-8">
          {/* Left side - app title */}
          <Link to="/" className="font-semibold text-lg tracking-tight hover:text-muted-foreground transition-colors">
            {import.meta.env.VITE_APP_TITLE || 'Hermes App'}
          </Link>

          {/* Right side - admin navigation and user menu */}
          {isAuthenticated ? (
            <div className="flex items-center gap-2">
              {isAdmin && (
                <Button asChild variant="ghost" size="sm">
                  <Link to="/admin/users">Admin</Link>
                </Button>
              )}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="rounded-full hover:bg-accent p-1 transition-colors outline-none cursor-pointer">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={getAvatarUrl()} alt={userName} />
                      <AvatarFallback>{getInitials(userName)}</AvatarFallback>
                    </Avatar>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{userName}</p>
                      {userEmail && (
                        <p className="text-xs leading-none text-muted-foreground">
                          {userEmail}
                        </p>
                      )}
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => setTheme('light')}>
                    <span className={theme === 'light' ? 'font-bold' : ''}>Light</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setTheme('dark')}>
                    <span className={theme === 'dark' ? 'font-bold' : ''}>Dark</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setTheme('system')}>
                    <span className={theme === 'system' ? 'font-bold' : ''}>System</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ) : (
            <Button size="sm" onClick={handleLogin}>
              Sign in
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
