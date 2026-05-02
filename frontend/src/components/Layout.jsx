import { useState, useEffect } from 'react';
import { useAuth } from '../OidcContext';
import { useTheme } from '../ThemeContext';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

export default function Layout({ children }) {
  const { isAuthenticated, user, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  
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
                <DropdownMenuItem onClick={() => setTheme('light')} className={theme === 'light' ? 'bg-accent' : ''}>
                  Light
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme('dark')} className={theme === 'dark' ? 'bg-accent' : ''}>
                  Dark
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme('system')} className={theme === 'system' ? 'bg-accent' : ''}>
                  System
                </DropdownMenuItem>
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
