"use client";

import Link from "next/link";
import { BarChart3, ChevronRight, Pin } from "lucide-react";
import { useStore } from "@/lib/store";
import { playerById, pollResultsFor } from "@/lib/selectors";
import { formatPostedDate } from "@/lib/format";
import type { ForumPost } from "@/lib/types";
import { cn } from "@/lib/utils";

export function ForumPostCard({ post }: { post: ForumPost }) {
  const players = useStore((s) => s.players);
  const pollOptions = useStore((s) => s.pollOptions);
  const pollVotes = useStore((s) => s.pollVotes);

  const author = playerById(players, post.authorId);
  const poll =
    post.type === "poll"
      ? pollResultsFor(pollOptions, pollVotes, post.id)
      : null;
  const leading = poll?.options.find((o) => o.id === poll.leadingId);

  return (
    <Link
      href={`/forum/${post.id}`}
      className={cn(
        "group block rounded-xl bg-card p-4 ring-1 ring-border transition-colors hover:ring-primary/40",
        post.pinned && "border-l-2 border-l-primary"
      )}
    >
      <div className="flex items-center gap-2">
        {post.pinned && (
          <span className="inline-flex items-center gap-1 rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-semibold tracking-wider text-primary uppercase">
            <Pin className="size-3" />
            Pinned
          </span>
        )}
        {post.type === "poll" && (
          <span className="inline-flex items-center gap-1 rounded-full bg-secondary px-2 py-0.5 text-[10px] font-semibold tracking-wider text-muted-foreground uppercase">
            <BarChart3 className="size-3" />
            Poll
          </span>
        )}
        <span className="ml-auto text-xs text-muted-foreground">
          {formatPostedDate(post.createdAt)}
        </span>
      </div>

      <h3 className="mt-2 font-heading text-lg leading-tight font-semibold">
        {post.title}
      </h3>
      <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
        {post.body}
      </p>

      <div className="mt-3 flex items-center justify-between">
        <span className="text-xs text-muted-foreground">
          {author ? `Posted by ${author.realName}` : "Posted by the host"}
          {poll
            ? ` · ${poll.total} ${poll.total === 1 ? "vote" : "votes"}${
                leading && poll.total > 0 ? ` · leading: ${leading.text}` : ""
              }`
            : ""}
        </span>
        <ChevronRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
      </div>
    </Link>
  );
}
