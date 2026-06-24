"use client";

import { MessagesSquare } from "lucide-react";
import { ForumPostCard } from "@/components/forum-post-card";
import { EmptyState } from "@/components/empty-state";
import { useStore } from "@/lib/store";
import { sortedPosts } from "@/lib/selectors";

export default function ForumPage() {
  const forumPosts = useStore((s) => s.forumPosts);
  const posts = sortedPosts(forumPosts);

  return (
    <div className="space-y-5">
      <header className="space-y-1">
        <h1 className="font-heading text-2xl font-semibold">Forum</h1>
        <p className="text-muted-foreground">
          Announcements, house rules, and polls from the host.
        </p>
      </header>

      {posts.length === 0 ? (
        <EmptyState
          icon={MessagesSquare}
          title="No posts yet"
          description="When the host shares an update or starts a poll, you'll see it here."
        />
      ) : (
        <div className="space-y-3">
          {posts.map((post) => (
            <ForumPostCard key={post.id} post={post} />
          ))}
        </div>
      )}
    </div>
  );
}
