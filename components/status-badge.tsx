import { cn } from "@/lib/utils";
import { GAME_STATUS_META } from "@/lib/status";
import type { GameStatus } from "@/lib/types";

export function GameStatusBadge({
  status,
  className,
}: {
  status: GameStatus;
  className?: string;
}) {
  const meta = GAME_STATUS_META[status];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium",
        meta.badge,
        className
      )}
    >
      <span className={cn("size-1.5 rounded-full", meta.dot)} />
      {meta.label}
    </span>
  );
}
