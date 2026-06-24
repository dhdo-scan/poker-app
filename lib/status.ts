import type { GameStatus } from "./types";

// Status palette per the design system:
//   seated → gold · queued → neutral · in_progress → amber ·
//   completed → muted · cancelled → destructive.
// Amber is a one-off accent (not a theme token) so it's inlined here.

export const GAME_STATUS_META: Record<
  GameStatus,
  { label: string; badge: string; dot: string }
> = {
  scheduled: {
    label: "Scheduled",
    badge: "bg-secondary text-secondary-foreground",
    dot: "bg-primary",
  },
  in_progress: {
    label: "In progress",
    badge: "bg-[#D9A441]/15 text-[#D9A441]",
    dot: "bg-[#D9A441]",
  },
  completed: {
    label: "Completed",
    badge: "bg-muted text-muted-foreground",
    dot: "bg-muted-foreground",
  },
  cancelled: {
    label: "Cancelled",
    badge: "bg-destructive/15 text-destructive",
    dot: "bg-destructive",
  },
};
