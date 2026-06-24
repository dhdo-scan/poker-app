"use client";

import { useEffect, useState } from "react";
import { Spade } from "lucide-react";
import { useStore } from "@/lib/store";

/**
 * Gates the whole app on store hydration from localStorage.
 *
 * `mounted` guarantees the first client render matches the server (both show
 * the splash), avoiding hydration mismatches from synchronous localStorage
 * reads. `_hasHydrated` then waits for persisted data to load before we render
 * anything that depends on it (session, seed data, etc.).
 */
export function Providers({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  const hydrated = useStore((s) => s._hasHydrated);

  useEffect(() => setMounted(true), []);

  if (!mounted || !hydrated) {
    return (
      <div className="flex min-h-screen flex-1 flex-col items-center justify-center gap-4 bg-background">
        <Spade className="size-10 animate-pulse text-primary" />
        <p className="font-heading text-sm tracking-[0.3em] text-muted-foreground uppercase">
          The Felt
        </p>
      </div>
    );
  }

  return <>{children}</>;
}
