"use client";

import Link from "next/link";
import { CalendarClock, ChevronRight, MapPin, Users } from "lucide-react";
import { GameStatusBadge } from "@/components/status-badge";
import { useStore } from "@/lib/store";
import { registrationFor, seatedFor } from "@/lib/selectors";
import { formatDateTime } from "@/lib/format";
import type { Game } from "@/lib/types";
import { cn } from "@/lib/utils";

/** Compact, clickable game summary for the calendar list. Action lives on detail. */
export function GameCard({ game }: { game: Game }) {
  const registrations = useStore((s) => s.registrations);
  const currentPlayerId = useStore((s) => s.currentPlayerId);

  const seatedCount = seatedFor(registrations, game.id).length;
  const reg = registrationFor(registrations, game.id, currentPlayerId);
  const isFull = seatedCount >= game.maxSeats;

  return (
    <Link
      href={`/games/${game.id}`}
      className="group block rounded-xl bg-card p-4 ring-1 ring-border transition-colors hover:ring-primary/40"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="font-heading text-lg leading-tight font-semibold text-foreground">
            {game.title}
          </h3>
          <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
            <CalendarClock className="size-3.5 shrink-0" />
            {formatDateTime(game.startsAt)}
          </p>
        </div>
        <GameStatusBadge status={game.status} />
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-sm text-muted-foreground">
        {game.location && (
          <span className="flex items-center gap-1.5">
            <MapPin className="size-3.5 shrink-0" />
            {game.location}
          </span>
        )}
        <span className="flex items-center gap-1.5">
          <Users className="size-3.5 shrink-0" />
          {seatedCount} / {game.maxSeats} seated
          {isFull && (
            <span className="text-foreground/50">· table full</span>
          )}
        </span>
      </div>

      <div className="mt-3 flex items-center justify-between">
        {reg ? (
          <span
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium",
              reg.status === "seated"
                ? "bg-primary/15 text-primary"
                : "bg-secondary text-muted-foreground"
            )}
          >
            {reg.status === "seated"
              ? "You're seated"
              : `In queue · #${reg.position}`}
          </span>
        ) : (
          <span className="text-xs text-muted-foreground">Tap for details</span>
        )}
        <ChevronRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
      </div>
    </Link>
  );
}
