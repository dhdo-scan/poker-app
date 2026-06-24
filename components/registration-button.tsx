"use client";

import { toast } from "sonner";
import { Clock, LogOut, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useStore } from "@/lib/store";
import { registrationFor, seatedFor } from "@/lib/selectors";
import { cn } from "@/lib/utils";

/**
 * The player's register / join-queue / drop control for a game. This is the
 * single gold CTA wherever it appears; the leave/drop variants are outline so
 * gold always means "the action that puts you in the game".
 */
export function RegistrationButton({
  gameId,
  size = "default",
  block = false,
  className,
}: {
  gameId: string;
  size?: "sm" | "default" | "lg";
  block?: boolean;
  className?: string;
}) {
  const game = useStore((s) => s.games.find((g) => g.id === gameId));
  const currentPlayerId = useStore((s) => s.currentPlayerId);
  const registrations = useStore((s) => s.registrations);
  const register = useStore((s) => s.register);
  const drop = useStore((s) => s.drop);

  if (!game || !currentPlayerId || game.status !== "scheduled") return null;

  const reg = registrationFor(registrations, gameId, currentPlayerId);
  const seatedCount = seatedFor(registrations, gameId).length;
  const isFull = seatedCount >= game.maxSeats;
  const width = block ? "w-full" : "";

  if (reg?.status === "seated") {
    return (
      <Button
        variant="outline"
        size={size}
        className={cn(width, className)}
        onClick={() => {
          drop(gameId, currentPlayerId);
          toast("Dropped your seat", {
            description: "If anyone was waiting, they've been seated.",
          });
        }}
      >
        <LogOut />
        Drop seat
      </Button>
    );
  }

  if (reg?.status === "queued") {
    return (
      <Button
        variant="outline"
        size={size}
        className={cn(width, className)}
        onClick={() => {
          drop(gameId, currentPlayerId);
          toast("Left the queue");
        }}
      >
        <LogOut />
        Leave queue{reg.position ? ` (#${reg.position})` : ""}
      </Button>
    );
  }

  // Not registered → the gold CTA. Becomes "Join queue" when the table is full.
  return (
    <Button
      size={size}
      className={cn(width, className)}
      onClick={() => {
        register(gameId, currentPlayerId);
        if (isFull) {
          toast("Added to the queue", {
            description: "We'll seat you when a spot opens up.",
          });
        } else {
          toast("Seat reserved", { description: "You're at the table." });
        }
      }}
    >
      {isFull ? <Clock /> : <Plus />}
      {isFull ? "Join queue" : "Register"}
    </Button>
  );
}
