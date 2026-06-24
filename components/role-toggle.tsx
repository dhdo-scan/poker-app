"use client";

import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import type { Role } from "@/lib/types";

const ROLES: Role[] = ["player", "admin"];

/**
 * Dev-only role switcher. Flips the session's effective view between player and
 * admin so both sides can be shown during the pitch from a single account.
 */
export function RoleToggle() {
  const viewRole = useStore((s) => s.viewRole);
  const setViewRole = useStore((s) => s.setViewRole);

  return (
    <div
      className="flex items-center gap-0.5 rounded-full border border-border bg-secondary/60 p-0.5"
      title="Demo-only: switch between player and admin views"
    >
      {ROLES.map((r) => (
        <button
          key={r}
          type="button"
          onClick={() => setViewRole(r)}
          className={cn(
            "rounded-full px-2.5 py-1 text-xs font-medium capitalize transition-colors",
            viewRole === r
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          {r}
        </button>
      ))}
    </div>
  );
}
