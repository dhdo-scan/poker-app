"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useStore } from "@/lib/store";
import { AppShell } from "@/components/app-shell";

/**
 * Session gate for every authenticated route. Hydration is already resolved by
 * <Providers>, so `currentPlayerId` here reflects the persisted session. No
 * session → bounce to /login.
 */
export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const currentPlayerId = useStore((s) => s.currentPlayerId);

  useEffect(() => {
    if (!currentPlayerId) router.replace("/login");
  }, [currentPlayerId, router]);

  if (!currentPlayerId) return null;

  return <AppShell>{children}</AppShell>;
}
