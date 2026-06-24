"use client";

import { toast } from "sonner";
import { Check } from "lucide-react";
import { useStore } from "@/lib/store";
import { pollResultsFor, voteOf } from "@/lib/selectors";
import { cn } from "@/lib/utils";

/**
 * Poll options with live vote counts. The current player casts a single vote
 * and can change it by tapping another option; results (bars + counts) are
 * always visible.
 */
export function PollView({ postId }: { postId: string }) {
  const pollOptions = useStore((s) => s.pollOptions);
  const pollVotes = useStore((s) => s.pollVotes);
  const currentPlayerId = useStore((s) => s.currentPlayerId);
  const castVote = useStore((s) => s.castVote);

  const result = pollResultsFor(pollOptions, pollVotes, postId);
  const myVote = voteOf(pollVotes, postId, currentPlayerId);

  function vote(optionId: string) {
    if (!currentPlayerId || optionId === myVote) return;
    const changing = Boolean(myVote);
    castVote(postId, optionId, currentPlayerId);
    toast(changing ? "Vote updated" : "Vote counted");
  }

  return (
    <div className="space-y-2">
      {result.options.map((o) => {
        const selected = myVote === o.id;
        return (
          <button
            key={o.id}
            type="button"
            onClick={() => vote(o.id)}
            className={cn(
              "relative w-full overflow-hidden rounded-lg border px-3 py-2.5 text-left transition-colors",
              selected
                ? "border-primary/60"
                : "border-border hover:border-primary/30"
            )}
          >
            {/* Result bar */}
            <span
              aria-hidden
              className={cn(
                "absolute inset-y-0 left-0 transition-all duration-300",
                selected ? "bg-primary/20" : "bg-secondary/70"
              )}
              style={{ width: `${o.pct}%` }}
            />
            <span className="relative flex items-center justify-between gap-3">
              <span
                className={cn(
                  "flex items-center gap-1.5 text-sm",
                  selected ? "font-medium text-foreground" : "text-foreground/90"
                )}
              >
                {o.text}
                {selected && <Check className="size-3.5 text-primary" />}
              </span>
              <span className="shrink-0 text-xs text-muted-foreground tabular-nums">
                {o.pct}% · {o.count}
              </span>
            </span>
          </button>
        );
      })}
      <p className="text-xs text-muted-foreground">
        {result.total} {result.total === 1 ? "vote" : "votes"}
        {myVote ? " · tap another option to change your vote" : ""}
      </p>
    </div>
  );
}
