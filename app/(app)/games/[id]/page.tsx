"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, CalendarClock, MapPin, StickyNote } from "lucide-react";
import { FeltTable } from "@/components/felt-table";
import { RegistrationButton } from "@/components/registration-button";
import { GameStatusBadge } from "@/components/status-badge";
import { EmptyState } from "@/components/empty-state";
import { Button } from "@/components/ui/button";
import { useStore } from "@/lib/store";
import { registrationFor, seatedFor } from "@/lib/selectors";
import { formatDateTime } from "@/lib/format";

export default function GameDetailPage() {
  const params = useParams<{ id: string }>();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;

  const game = useStore((s) => s.games.find((g) => g.id === id));
  const registrations = useStore((s) => s.registrations);
  const currentPlayerId = useStore((s) => s.currentPlayerId);

  if (!game) {
    return (
      <div className="space-y-5">
        <BackLink />
        <EmptyState
          title="Game not found"
          description="This game may have been removed."
          action={
            <Button nativeButton={false} render={<Link href="/calendar" />}>
              Back to calendar
            </Button>
          }
        />
      </div>
    );
  }

  const reg = registrationFor(registrations, game.id, currentPlayerId);
  const seatedCount = seatedFor(registrations, game.id).length;
  const isFull = seatedCount >= game.maxSeats;

  return (
    <div className="space-y-6">
      <BackLink />

      <header className="space-y-3">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="font-heading text-2xl font-semibold">{game.title}</h1>
          <GameStatusBadge status={game.status} />
        </div>
        <div className="flex flex-wrap gap-x-5 gap-y-1.5 text-sm text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <CalendarClock className="size-4 shrink-0" />
            {formatDateTime(game.startsAt)}
          </span>
          {game.location && (
            <span className="flex items-center gap-1.5">
              <MapPin className="size-4 shrink-0" />
              {game.location}
            </span>
          )}
        </div>
        {game.notes && (
          <p className="flex items-start gap-2 rounded-lg bg-muted/40 px-3 py-2 text-sm text-muted-foreground">
            <StickyNote className="mt-0.5 size-4 shrink-0" />
            {game.notes}
          </p>
        )}
      </header>

      {/* Action row — the single gold CTA on this view. */}
      {game.status === "scheduled" ? (
        <div className="flex flex-col gap-3 rounded-xl bg-card p-4 ring-1 ring-border sm:flex-row sm:items-center sm:justify-between">
          <div className="text-sm">
            {reg?.status === "seated" && (
              <span className="text-primary">You have a seat at this table.</span>
            )}
            {reg?.status === "queued" && (
              <span className="text-muted-foreground">
                You're #{reg.position} in the queue.
              </span>
            )}
            {!reg && (
              <span className="text-muted-foreground">
                {isFull
                  ? "The table is full — join the queue and we'll seat you when a spot opens."
                  : `${game.maxSeats - seatedCount} seat${
                      game.maxSeats - seatedCount === 1 ? "" : "s"
                    } open.`}
              </span>
            )}
          </div>
          <RegistrationButton gameId={game.id} size="lg" block className="sm:w-auto" />
        </div>
      ) : (
        <p className="rounded-xl bg-muted/40 px-4 py-3 text-sm text-muted-foreground">
          {game.status === "cancelled"
            ? "This game was cancelled."
            : game.status === "completed"
              ? "This game has wrapped. Here's who played."
              : "This game is in progress."}
        </p>
      )}

      <FeltTable gameId={game.id} maxSeats={game.maxSeats} />
    </div>
  );
}

function BackLink() {
  return (
    <Link
      href="/calendar"
      className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
    >
      <ArrowLeft className="size-4" />
      Calendar
    </Link>
  );
}
