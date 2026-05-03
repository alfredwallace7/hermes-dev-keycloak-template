import { useState } from 'react';
import { useAuth } from '../OidcContext';
import { useTheme } from '../ThemeContext';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

export default function Layout({ children }) {
  const { isAuthenticated, user, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
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
    setUserMenuOpen(false);
    logout();
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
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="rounded-full hover:bg-accent p-1 transition-colors"
              >
                <Avatar className="h-8 w-8">
                  <AvatarImage src={getAvatarUrl()} alt={userName} />
                  <AvatarFallback>{getInitials(userName)}</AvatarFallback>
                </Avatar>
              </button>

              {userMenuOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setUserMenuOpen(false)}
                  />
                  <div className="absolute right-0 mt-2 w-56 rounded-lg border bg-popover p-1 text-popover-foreground shadow-md z-50 animate-in fade-in-0 zoom-in-95">
                    <div className="px-1.5 py-1">
                      <p className="truncate text-sm font-medium leading-none">{userName}</p>
                      {userEmail && (
                        <p className="truncate text-xs leading-none text-muted-foreground">
                          {userEmail}
                        </p>
                      )}
                    </div>
                    <div className="-mx-1 my-1 h-px bg-border" />
                    <button
                      onClick={() => { setTheme('light'); setUserMenuOpen(false); }}
                      className={`w-full text-left px-1.5 py-1 text-sm rounded-md hover:bg-accent ${theme === 'light' ? 'bg-accent' : ''}`}
                    >
                      Light
                    </button>
                    <button
                      onClick={() => { setTheme('dark'); setUserMenuOpen(false); }}
                      className={`w-full text-left px-1.5 py-1 text-sm rounded-md hover:bg-accent ${theme === 'dark' ? 'bg-accent' : ''}`}
                    >
                      Dark
                    </button>
                    <button
                      onClick={() => { setTheme('system'); setUserMenuOpen(false); }}
                      className={`w-full text-left px-1.5 py-1 text-sm rounded-md hover:bg-accent ${theme === 'system' ? 'bg-accent' : ''}`}
                    >
                      System
                    </button>
                    <div className="-mx-1 my-1 h-px bg-border" />
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-1.5 py-1 text-sm rounded-md hover:bg-accent"
                    >
                      Logout
                    </button>
                  </div>
                </>
              )}
            </div>
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
