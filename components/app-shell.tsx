"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CalendarDays,
  Home,
  MessagesSquare,
  Settings as SettingsIcon,
  Shield,
} from "lucide-react";
import { Brand } from "@/components/brand";
import { RoleToggle } from "@/components/role-toggle";
import { UserMenu } from "@/components/user-menu";
import { useIsAdmin } from "@/lib/hooks";
import { cn } from "@/lib/utils";

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  adminOnly?: boolean;
}

const NAV: NavItem[] = [
  { href: "/", label: "Home", icon: Home },
  { href: "/calendar", label: "Calendar", icon: CalendarDays },
  { href: "/forum", label: "Forum", icon: MessagesSquare },
  { href: "/settings", label: "Settings", icon: SettingsIcon },
  { href: "/admin", label: "Admin", icon: Shield, adminOnly: true },
];

function isActive(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = useIsAdmin();
  const items = NAV.filter((i) => !i.adminOnly || isAdmin);

  return (
    <div className="flex min-h-screen flex-1 flex-col">
      <header className="sticky top-0 z-40">
        {/* Persistent gold bar makes the admin view unmistakable. */}
        {isAdmin && <div className="h-1 w-full bg-primary" />}
        <div className="border-b border-border bg-background/90 backdrop-blur supports-[backdrop-filter]:bg-background/75">
          <div className="mx-auto flex h-14 w-full max-w-5xl items-center gap-3 px-4">
            <Brand />
            {isAdmin && (
              <span className="hidden rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-semibold tracking-wider text-primary uppercase sm:inline">
                Admin
              </span>
            )}

            {/* Desktop primary nav */}
            <nav className="ml-4 hidden items-center gap-1 md:flex">
              {items.map((item) => {
                const active = isActive(pathname, item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                      active
                        ? "text-gold-bright"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            <div className="ml-auto flex items-center gap-2">
              <RoleToggle />
              <UserMenu />
            </div>
          </div>
        </div>
      </header>

      {/* Extra bottom padding on mobile so content clears the tab bar. */}
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 pt-6 pb-24 md:pb-10">
        {children}
      </main>

      {/* Mobile bottom tab bar */}
      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 backdrop-blur md:hidden">
        <div className="mx-auto flex max-w-5xl items-stretch justify-around">
          {items.map((item) => {
            const active = isActive(pathname, item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex flex-1 flex-col items-center gap-1 py-2.5 text-[11px] font-medium transition-colors",
                  active
                    ? "text-gold-bright"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Icon className="size-5" />
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
