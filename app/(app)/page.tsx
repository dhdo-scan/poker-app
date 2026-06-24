"use client";

import Link from "next/link";
import {
  CalendarClock,
  CalendarDays,
  ChevronRight,
  MapPin,
  Pin,
  Users,
} from "lucide-react";
import { GameCard } from "@/components/game-card";
import { GameStatusBadge } from "@/components/status-badge";
import { RegistrationButton } from "@/components/registration-button";
import { EmptyState } from "@/components/empty-state";
import { Button } from "@/components/ui/button";
import { useStore } from "@/lib/store";
import { useCurrentPlayer } from "@/lib/hooks";
import {
  mostRecentPinned,
  myUpcomingRegistrations,
  nextGame,
  registrationFor,
  seatedFor,
} from "@/lib/selectors";
import { formatDateTime, formatPostedDate } from "@/lib/format";

export default function DashboardPage() {
  const player = useCurrentPlayer();
  const games = useStore((s) => s.games);
  const registrations = useStore((s) => s.registrations);
  const forumPosts = useStore((s) => s.forumPosts);
  const currentPlayerId = useStore((s) => s.currentPlayerId);

  const next = nextGame(games);
  const pinned = mostRecentPinned(forumPosts);
  const myGames = myUpcomingRegistrations(registrations, games, currentPlayerId)
    // The featured game is shown above; don't repeat it in the list.
    .filter((x) => x.game.id !== next?.id);

  return (
    <div className="space-y-8">
      <header className="space-y-1">
        <h1 className="font-heading text-2xl font-semibold">
          Welcome back, {player?.realName.split(" ")[0]}
        </h1>
        <p className="text-muted-foreground">Here&apos;s what&apos;s on deck.</p>
      </header>

      {/* Featured next game */}
      <section className="space-y-3">
        <SectionLabel>Next game</SectionLabel>
        {next ? (
          <NextGameCard gameId={next.id} />
        ) : (
          <EmptyState
            icon={CalendarDays}
            title="Nothing scheduled yet"
            description="The next session will appear here as soon as it's booked."
          />
        )}
      </section>

      {/* Your other upcoming games */}
      {myGames.length > 0 && (
        <section className="space-y-3">
          <SectionLabel>Your other games</SectionLabel>
          <div className="space-y-3">
            {myGames.map(({ game }) => (
              <GameCard key={game.id} game={game} />
            ))}
          </div>
        </section>
      )}

      {/* Most recent pinned post */}
      {pinned && (
        <section className="space-y-3">
          <SectionLabel>Pinned from the host</SectionLabel>
          <Link
            href={`/forum/${pinned.id}`}
            className="group block rounded-xl border-l-2 border-l-primary bg-card p-4 ring-1 ring-border transition-colors hover:ring-primary/40"
          >
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-semibold tracking-wider text-primary uppercase">
                <Pin className="size-3" />
                Pinned
              </span>
              <span className="text-xs text-muted-foreground">
                {formatPostedDate(pinned.createdAt)}
              </span>
            </div>
            <h3 className="mt-2 font-heading text-lg leading-tight font-semibold">
              {pinned.title}
            </h3>
            <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
              {pinned.body}
            </p>
            <span className="mt-2 inline-flex items-center gap-1 text-sm text-gold-bright">
              Read post
              <ChevronRight className="size-4 transition-transform group-hover:translate-x-0.5" />
            </span>
          </Link>
        </section>
      )}
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-xs font-medium tracking-[0.15em] text-muted-foreground uppercase">
      {children}
    </h2>
  );
}

/** The featured next-game card — carries the dashboard's single gold CTA. */
function NextGameCard({ gameId }: { gameId: string }) {
  const game = useStore((s) => s.games.find((g) => g.id === gameId));
  const registrations = useStore((s) => s.registrations);
  const currentPlayerId = useStore((s) => s.currentPlayerId);

  if (!game) return null;

  const seatedCount = seatedFor(registrations, game.id).length;
  const reg = registrationFor(registrations, game.id, currentPlayerId);

  return (
    <div className="rounded-xl bg-card p-5 ring-1 ring-border">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="font-heading text-xl leading-tight font-semibold">
            {game.title}
          </h3>
          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1.5 text-sm text-muted-foreground">
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
            <span className="flex items-center gap-1.5">
              <Users className="size-4 shrink-0" />
              {seatedCount} / {game.maxSeats} seated
            </span>
          </div>
        </div>
        <GameStatusBadge status={game.status} />
      </div>

      {reg && (
        <p className="mt-3 text-sm">
          {reg.status === "seated" ? (
            <span className="text-primary">You&apos;re seated at this one.</span>
          ) : (
            <span className="text-muted-foreground">
              You&apos;re #{reg.position} in the queue.
            </span>
          )}
        </p>
      )}

      <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center">
        <RegistrationButton gameId={game.id} block className="sm:w-auto" />
        <Button
          variant="outline"
          nativeButton={false}
          render={<Link href={`/games/${game.id}`} />}
          className="w-full sm:w-auto"
        >
          View table
        </Button>
      </div>
    </div>
  );
}
