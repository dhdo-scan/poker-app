"use client";

import { CalendarDays } from "lucide-react";
import { GameCard } from "@/components/game-card";
import { EmptyState } from "@/components/empty-state";
import { useStore } from "@/lib/store";
import { upcomingGames } from "@/lib/selectors";

export default function CalendarPage() {
  const games = useStore((s) => s.games);
  const upcoming = upcomingGames(games);

  return (
    <div className="space-y-5">
      <header className="space-y-1">
        <h1 className="font-heading text-2xl font-semibold">Calendar</h1>
        <p className="text-muted-foreground">
          Upcoming games at the club. Tap one to grab a seat.
        </p>
      </header>

      {upcoming.length === 0 ? (
        <EmptyState
          icon={CalendarDays}
          title="No games on the schedule"
          description="When the host books the next session it'll show up right here."
        />
      ) : (
        <div className="space-y-3">
          {upcoming.map((game) => (
            <GameCard key={game.id} game={game} />
          ))}
        </div>
      )}
    </div>
  );
}
