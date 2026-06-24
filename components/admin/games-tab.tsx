"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { CalendarClock, Pencil, Plus, Trash2, XCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { GameStatusBadge } from "@/components/status-badge";
import { SegmentedControl } from "@/components/segmented-control";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { useStore } from "@/lib/store";
import { allGamesSorted, seatedFor } from "@/lib/selectors";
import { formatDateTime } from "@/lib/format";
import type { Game, GameStatus } from "@/lib/types";

const STATUS_OPTIONS: { value: GameStatus; label: string }[] = [
  { value: "scheduled", label: "Scheduled" },
  { value: "in_progress", label: "In progress" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
];

export function GamesTab() {
  const games = useStore((s) => s.games);
  const registrations = useStore((s) => s.registrations);
  const cancelGame = useStore((s) => s.cancelGame);
  const deleteGame = useStore((s) => s.deleteGame);
  const sorted = allGamesSorted(games);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {games.length} game{games.length === 1 ? "" : "s"}
        </p>
        <GameFormDialog
          trigger={
            <Button size="sm">
              <Plus />
              New game
            </Button>
          }
        />
      </div>

      <div className="space-y-2">
        {sorted.map((game) => {
          const seated = seatedFor(registrations, game.id).length;
          return (
            <div
              key={game.id}
              className="rounded-xl bg-card p-4 ring-1 ring-border"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h3 className="font-heading text-lg leading-tight font-semibold">
                    {game.title}
                  </h3>
                  <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
                    <CalendarClock className="size-3.5 shrink-0" />
                    {formatDateTime(game.startsAt)} · {seated}/{game.maxSeats}{" "}
                    seated
                  </p>
                </div>
                <GameStatusBadge status={game.status} />
              </div>

              <div className="mt-3 flex flex-wrap items-center gap-2">
                <GameFormDialog
                  game={game}
                  trigger={
                    <Button variant="outline" size="sm">
                      <Pencil />
                      Edit
                    </Button>
                  }
                />
                {game.status !== "cancelled" && game.status !== "completed" && (
                  <ConfirmDialog
                    trigger={
                      <Button variant="destructive" size="sm">
                        <XCircle />
                        Cancel
                      </Button>
                    }
                    title={`Cancel "${game.title}"?`}
                    description="The game will be marked cancelled. Registrations stay on record."
                    confirmLabel="Cancel game"
                    cancelLabel="Keep it"
                    onConfirm={() => {
                      cancelGame(game.id);
                      toast("Game cancelled");
                    }}
                  />
                )}
                <ConfirmDialog
                  trigger={
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 />
                      Delete
                    </Button>
                  }
                  title={`Delete "${game.title}"?`}
                  description="This permanently removes the game and all its registrations."
                  confirmLabel="Delete"
                  onConfirm={() => {
                    deleteGame(game.id);
                    toast("Game deleted");
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function GameFormDialog({
  trigger,
  game,
}: {
  trigger: React.ReactElement;
  game?: Game;
}) {
  const addGame = useStore((s) => s.addGame);
  const updateGame = useStore((s) => s.updateGame);
  const isEdit = Boolean(game);

  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [startsAt, setStartsAt] = useState("");
  const [location, setLocation] = useState("");
  const [notes, setNotes] = useState("");
  const [maxSeats, setMaxSeats] = useState("6");
  const [status, setStatus] = useState<GameStatus>("scheduled");

  useEffect(() => {
    if (open) {
      setTitle(game?.title ?? "");
      setStartsAt(game?.startsAt.slice(0, 16) ?? "");
      setLocation(game?.location ?? "");
      setNotes(game?.notes ?? "");
      setMaxSeats(String(game?.maxSeats ?? 6));
      setStatus(game?.status ?? "scheduled");
    }
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  function save() {
    const seats = Math.max(1, Number(maxSeats) || 1);
    if (!title.trim() || !startsAt) return;
    if (isEdit && game) {
      updateGame(game.id, {
        title: title.trim(),
        startsAt,
        location: location.trim() || undefined,
        notes: notes.trim() || undefined,
        maxSeats: seats,
        status,
      });
      toast("Game updated");
    } else {
      addGame({
        title: title.trim(),
        startsAt,
        location: location.trim() || undefined,
        notes: notes.trim() || undefined,
        maxSeats: seats,
      });
      toast("Game created");
    }
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={trigger} />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit game" : "New game"}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="g-title">Title</Label>
            <Input
              id="g-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Friday Night Hold'em"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="g-date">Date &amp; time</Label>
            <Input
              id="g-date"
              type="datetime-local"
              value={startsAt}
              onChange={(e) => setStartsAt(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="g-loc">Location</Label>
              <Input
                id="g-loc"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Optional"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="g-seats">Max seats</Label>
              <Input
                id="g-seats"
                type="number"
                min={1}
                value={maxSeats}
                onChange={(e) => setMaxSeats(e.target.value)}
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="g-notes">Notes</Label>
            <Textarea
              id="g-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Buy-in, blinds, anything players should know."
              rows={3}
            />
          </div>
          {isEdit && (
            <div className="space-y-1.5">
              <Label>Status</Label>
              <SegmentedControl
                value={status}
                onChange={setStatus}
                options={STATUS_OPTIONS}
              />
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={save} disabled={!title.trim() || !startsAt}>
            {isEdit ? "Save changes" : "Create game"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
