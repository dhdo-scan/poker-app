"use client";

import { useState } from "react";
import { useStore } from "@/lib/store";
import { allGamesSorted } from "@/lib/selectors";
import { FeltTable } from "@/components/felt-table";
import { EmptyState } from "@/components/empty-state";
import { GameStatusBadge } from "@/components/status-badge";
import { formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";

export function RegistrationsTab() {
  const games = useStore((s) => s.games);
  const sorted = allGamesSorted(games);
  const [selectedId, setSelectedId] = useState<string | undefined>(
    sorted[0]?.id
  );

  if (sorted.length === 0) {
    return (
      <EmptyState
        title="No games to manage"
        description="Create a game first, then manage its seats here."
      />
    );
  }

  const selected =
    sorted.find((g) => g.id === selectedId) ?? sorted[0];

  return (
    <div className="space-y-4">
      {/* Game picker */}
      <div className="no-scrollbar -mx-4 overflow-x-auto px-4">
        <div className="flex w-max gap-2">
          {sorted.map((g) => {
            const active = g.id === selected.id;
            return (
              <button
                key={g.id}
                type="button"
                onClick={() => setSelectedId(g.id)}
                className={cn(
                  "rounded-lg border px-3 py-2 text-left transition-colors",
                  active
                    ? "border-primary/60 bg-primary/10"
                    : "border-border bg-card hover:border-primary/30"
                )}
              >
                <span className="block text-sm font-medium text-foreground">
                  {g.title}
                </span>
                <span className="block text-xs text-muted-foreground">
                  {formatDate(g.startsAt)}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <h3 className="font-heading text-lg font-semibold">{selected.title}</h3>
        <GameStatusBadge status={selected.status} />
      </div>
      <p className="text-sm text-muted-foreground">
        Remove a seated player and the next person in the queue takes their seat.
      </p>

      <FeltTable
        gameId={selected.id}
        maxSeats={selected.maxSeats}
        showKick
      />
    </div>
  );
}
