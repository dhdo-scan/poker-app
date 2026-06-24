"use client";

import { toast } from "sonner";
import { UserMinus } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { useStore } from "@/lib/store";
import { playerById, queuedFor, seatedFor } from "@/lib/selectors";
import { initials } from "@/lib/format";
import { cn } from "@/lib/utils";

/**
 * The felt poker-table surface: seated players read as chairs at a green felt
 * table with a gold rim; the queue sits below in a dimmer, smaller "waiting"
 * style so the table visually dominates. Used on the player game-detail view
 * and the admin Registrations view (the only two places green appears).
 */
export function FeltTable({
  gameId,
  maxSeats,
  showKick = false,
}: {
  gameId: string;
  maxSeats: number;
  showKick?: boolean;
}) {
  const registrations = useStore((s) => s.registrations);
  const players = useStore((s) => s.players);
  const currentPlayerId = useStore((s) => s.currentPlayerId);
  const kick = useStore((s) => s.kick);

  const seated = seatedFor(registrations, gameId);
  const queued = queuedFor(registrations, gameId);
  const emptyCount = Math.max(0, maxSeats - seated.length);

  return (
    <div className="space-y-4">
      {/* Felt surface */}
      <div
        className="relative overflow-hidden rounded-[1.75rem] bg-felt p-5 shadow-[inset_0_2px_50px_rgba(0,0,0,0.5)] ring-1 ring-primary/30 sm:p-7"
        style={{
          backgroundImage:
            "radial-gradient(120% 80% at 50% 0%, rgba(255,255,255,0.06), transparent 60%)",
        }}
      >
        {/* Inner "betting line" ring to read as a real table */}
        <div className="pointer-events-none absolute inset-4 rounded-[1.4rem] ring-1 ring-white/[0.06]" />

        <div className="relative">
          <div className="mb-4 flex items-center justify-between">
            <span className="font-heading text-xs tracking-[0.2em] text-gold-bright/80 uppercase">
              At the table
            </span>
            <span className="text-xs text-foreground/70">
              {seated.length} / {maxSeats} seated
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {seated.map((reg) => {
              const player = playerById(players, reg.playerId);
              if (!player) return null;
              const isYou = reg.playerId === currentPlayerId;
              return (
                <div
                  key={reg.id}
                  className="relative flex flex-col items-center gap-2 rounded-xl bg-black/30 p-3 text-center ring-1 ring-primary/40"
                >
                  <Avatar>
                    <AvatarFallback className="bg-primary/20 text-primary">
                      {initials(player.realName)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <p className="truncate text-sm leading-tight font-medium text-foreground">
                      {player.realName}
                    </p>
                    {isYou && (
                      <span className="text-[10px] tracking-wide text-gold-bright uppercase">
                        You
                      </span>
                    )}
                  </div>
                  {showKick && (
                    <ConfirmDialog
                      trigger={
                        <Button
                          variant="ghost"
                          size="icon-xs"
                          className="absolute -top-1.5 -right-1.5 rounded-full bg-card text-destructive ring-1 ring-border hover:bg-destructive/15"
                          aria-label={`Remove ${player.realName}`}
                        >
                          <UserMinus />
                        </Button>
                      }
                      title={`Remove ${player.realName}?`}
                      description="They'll be removed from this game and the next person in the queue takes their seat."
                      confirmLabel="Remove"
                      onConfirm={() => {
                        kick(gameId, player.id);
                        toast(`Removed ${player.realName}`);
                      }}
                    />
                  )}
                </div>
              );
            })}

            {/* Faint placeholder slots for open seats */}
            {Array.from({ length: emptyCount }).map((_, i) => (
              <div
                key={`empty-${i}`}
                className="flex min-h-[104px] flex-col items-center justify-center gap-1.5 rounded-xl border border-dashed border-foreground/15 bg-black/10 p-3 text-center"
              >
                <div className="size-8 rounded-full border border-dashed border-foreground/20" />
                <span className="text-[11px] text-foreground/40">Open seat</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Queue — clearly off-table, dimmer + smaller */}
      {queued.length > 0 && (
        <div>
          <p className="mb-2 px-1 text-xs font-medium tracking-wide text-muted-foreground uppercase">
            Waiting list
          </p>
          <ol className="space-y-1.5">
            {queued.map((reg) => {
              const player = playerById(players, reg.playerId);
              if (!player) return null;
              const isYou = reg.playerId === currentPlayerId;
              return (
                <li
                  key={reg.id}
                  className="flex items-center gap-3 rounded-lg bg-muted/40 px-3 py-1.5"
                >
                  <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-secondary text-[11px] font-medium text-muted-foreground">
                    {reg.position}
                  </span>
                  <span className="flex-1 truncate text-sm text-muted-foreground">
                    {player.realName}
                    {isYou && (
                      <span className="ml-1.5 text-[10px] tracking-wide text-gold-bright/80 uppercase">
                        You
                      </span>
                    )}
                  </span>
                  {showKick && (
                    <ConfirmDialog
                      trigger={
                        <Button
                          variant="ghost"
                          size="icon-xs"
                          className="text-muted-foreground hover:text-destructive"
                          aria-label={`Remove ${player.realName} from queue`}
                        >
                          <UserMinus />
                        </Button>
                      }
                      title={`Remove ${player.realName} from the queue?`}
                      confirmLabel="Remove"
                      onConfirm={() => {
                        kick(gameId, player.id);
                        toast(`Removed ${player.realName} from the queue`);
                      }}
                    />
                  )}
                </li>
              );
            })}
          </ol>
        </div>
      )}
    </div>
  );
}
