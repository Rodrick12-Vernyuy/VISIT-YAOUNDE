'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Compass, LogOut, Menu, ShieldCheck, User as UserIcon } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { ThemeToggle } from '@/components/layout/ThemeToggle';
import { useAuthStore } from '@/stores/auth.store';
import { useLogout } from '@/lib/queries/auth';
import { cn } from '@/lib/utils';

const NAV_LINKS = [
  { href: '/', label: 'Home' },
  { href: '/attractions', label: 'Attractions' },
  { href: '/map', label: 'Live Map' },
  { href: '/chat', label: 'Chat' },
];

export function Header() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const user = useAuthStore((state) => state.user);
  const logout = useLogout();

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2 font-display text-lg font-semibold">
          <Compass className="h-6 w-6 text-primary" />
          Visit Yaoundé
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                'text-sm font-medium text-muted-foreground transition-colors hover:text-foreground',
                pathname === link.href && 'text-foreground'
              )}
            >
              {link.label}
            </Link>
          ))}
          {user?.role === 'ADMIN' && (
            <Link
              href="/admin/attractions"
              className="flex items-center gap-1 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              <ShieldCheck className="h-4 w-4" /> Admin
            </Link>
          )}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          <ThemeToggle />
          {user ? (
            <div className="flex items-center gap-2">
              <Link
                href="/profile"
                className="flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                <UserIcon className="h-4 w-4" /> {user.fullName.split(' ')[0]}
              </Link>
              <Button variant="ghost" size="icon" aria-label="Log out" onClick={() => logout.mutate()}>
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <>
              <Button variant="ghost" asChild>
                <Link href="/login">Log in</Link>
              </Button>
              <Button asChild>
                <Link href="/register">Sign up</Link>
              </Button>
            </>
          )}
        </div>

        <div className="flex items-center gap-2 md:hidden">
          <ThemeToggle />
          <Button variant="ghost" size="icon" aria-label="Open menu" onClick={() => setMobileOpen(true)}>
            <Menu className="h-5 w-5" />
          </Button>
        </div>
      </div>

      <Dialog open={mobileOpen} onOpenChange={setMobileOpen}>
        <DialogContent className="top-0 max-w-full translate-y-0 rounded-none border-x-0 border-t-0 p-6">
          <DialogTitle className="sr-only">Menu</DialogTitle>
          <nav className="flex flex-col gap-4">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="text-base font-medium"
              >
                {link.label}
              </Link>
            ))}
            {user?.role === 'ADMIN' && (
              <Link href="/admin/attractions" onClick={() => setMobileOpen(false)} className="text-base font-medium">
                Admin dashboard
              </Link>
            )}
            <div className="mt-2 flex flex-col gap-2 border-t border-border pt-4">
              {user ? (
                <>
                  <Link href="/profile" onClick={() => setMobileOpen(false)} className="text-base font-medium">
                    Profile
                  </Link>
                  <Button
                    variant="outline"
                    onClick={() => {
                      logout.mutate();
                      setMobileOpen(false);
                    }}
                  >
                    Log out
                  </Button>
                </>
              ) : (
                <>
                  <Button variant="outline" asChild>
                    <Link href="/login" onClick={() => setMobileOpen(false)}>
                      Log in
                    </Link>
                  </Button>
                  <Button asChild>
                    <Link href="/register" onClick={() => setMobileOpen(false)}>
                      Sign up
                    </Link>
                  </Button>
                </>
              )}
            </div>
          </nav>
        </DialogContent>
      </Dialog>
    </header>
  );
}
