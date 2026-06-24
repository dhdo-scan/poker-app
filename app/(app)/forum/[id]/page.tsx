"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, BarChart3, Pin } from "lucide-react";
import { PollView } from "@/components/poll-view";
import { EmptyState } from "@/components/empty-state";
import { Button } from "@/components/ui/button";
import { useStore } from "@/lib/store";
import { playerById } from "@/lib/selectors";
import { formatPostedDate } from "@/lib/format";

export default function ForumPostPage() {
  const params = useParams<{ id: string }>();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;

  const post = useStore((s) => s.forumPosts.find((p) => p.id === id));
  const author = useStore((s) =>
    post ? playerById(s.players, post.authorId) : undefined
  );

  if (!post) {
    return (
      <div className="space-y-5">
        <BackLink />
        <EmptyState
          title="Post not found"
          description="This post may have been removed."
          action={
            <Button nativeButton={false} render={<Link href="/forum" />}>
              Back to forum
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <BackLink />

      <article className="space-y-4">
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
        </div>

        <div className="space-y-1">
          <h1 className="font-heading text-2xl font-semibold">{post.title}</h1>
          <p className="text-xs text-muted-foreground">
            {author ? `Posted by ${author.realName}` : "Posted by the host"} ·{" "}
            {formatPostedDate(post.createdAt)}
          </p>
        </div>

        <p className="text-sm leading-relaxed whitespace-pre-wrap text-foreground/90">
          {post.body}
        </p>

        {post.type === "poll" && (
          <div className="rounded-xl bg-card p-4 ring-1 ring-border">
            <PollView postId={post.id} />
          </div>
        )}
      </article>
    </div>
  );
}

function BackLink() {
  return (
    <Link
      href="/forum"
      className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
    >
      <ArrowLeft className="size-4" />
      Forum
    </Link>
  );
}
