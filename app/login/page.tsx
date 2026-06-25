"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { ChevronRight, Lock } from "lucide-react";
import { BrandHero } from "@/components/brand-hero";
import { SuitBackdrop } from "@/components/suit-backdrop";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useStore } from "@/lib/store";
import { initials } from "@/lib/format";

export default function LoginPage() {
  const router = useRouter();
  const players = useStore((s) => s.players);
  const currentPlayerId = useStore((s) => s.currentPlayerId);
  const signInAs = useStore((s) => s.signInAs);

  // Already signed in → straight to the dashboard.
  useEffect(() => {
    if (currentPlayerId) router.replace("/");
  }, [currentPlayerId, router]);

  function handleSignIn(playerId: string) {
    signInAs(playerId);
    router.replace("/");
  }

  return (
    <div className="relative flex min-h-screen flex-1 flex-col items-center justify-center overflow-hidden px-4 py-10">
      <SuitBackdrop />

      <div className="relative z-10 w-full max-w-sm">
        <div className="mb-8">
          <BrandHero tagline="Private, invite-only club. Members only." />
        </div>

        <div className="rounded-xl bg-card p-1.5 ring-1 ring-border">
          <div className="flex items-center gap-2 px-3 py-2 text-xs text-muted-foreground">
            <Lock className="size-3.5" />
            <span>Demo sign-in — pick a player to continue</span>
          </div>
          <ul className="space-y-1">
            {players.map((p) => (
              <li key={p.id}>
                <button
                  type="button"
                  onClick={() => handleSignIn(p.id)}
                  className="group flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors hover:bg-secondary"
                >
                  <Avatar>
                    <AvatarFallback className="bg-secondary text-primary group-hover:bg-muted">
                      {initials(p.realName)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="flex-1">
                    <span className="block text-sm font-medium text-foreground">
                      {p.realName}
                    </span>
                  </span>
                  {p.role === "admin" ? (
                    <Badge className="bg-primary text-primary-foreground">
                      Host
                    </Badge>
                  ) : (
                    <Badge variant="secondary">Player</Badge>
                  )}
                  <ChevronRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
                </button>
              </li>
            ))}
          </ul>
        </div>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          New here? Account creation is by invite link only.
        </p>
      </div>
    </div>
  );
}
