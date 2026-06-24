"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  BarChart3,
  Pencil,
  Pin,
  PinOff,
  Plus,
  Trash2,
  X,
} from "lucide-react";
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
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { SegmentedControl } from "@/components/segmented-control";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { EmptyState } from "@/components/empty-state";
import { useStore } from "@/lib/store";
import { sortedPosts } from "@/lib/selectors";
import { formatPostedDate } from "@/lib/format";
import type { ForumPost, ForumPostType } from "@/lib/types";

export function ForumTab() {
  const forumPosts = useStore((s) => s.forumPosts);
  const togglePin = useStore((s) => s.togglePin);
  const deletePost = useStore((s) => s.deletePost);
  const posts = sortedPosts(forumPosts);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {posts.length} post{posts.length === 1 ? "" : "s"}
        </p>
        <PostFormDialog
          trigger={
            <Button size="sm">
              <Plus />
              New post
            </Button>
          }
        />
      </div>

      {posts.length === 0 ? (
        <EmptyState
          title="No posts yet"
          description="Share an announcement or start a poll for the club."
        />
      ) : (
        <div className="space-y-2">
          {posts.map((post) => (
            <div
              key={post.id}
              className="rounded-xl bg-card p-4 ring-1 ring-border"
            >
              <div className="flex items-center gap-2">
                {post.pinned && (
                  <Badge className="bg-primary/15 text-primary">
                    <Pin className="size-3" />
                    Pinned
                  </Badge>
                )}
                {post.type === "poll" && (
                  <Badge variant="secondary">
                    <BarChart3 className="size-3" />
                    Poll
                  </Badge>
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

              <div className="mt-3 flex flex-wrap items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    togglePin(post.id);
                    toast(post.pinned ? "Unpinned" : "Pinned to top");
                  }}
                >
                  {post.pinned ? <PinOff /> : <Pin />}
                  {post.pinned ? "Unpin" : "Pin"}
                </Button>
                <PostFormDialog
                  post={post}
                  trigger={
                    <Button variant="outline" size="sm">
                      <Pencil />
                      Edit
                    </Button>
                  }
                />
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
                  title={`Delete "${post.title}"?`}
                  description="This permanently removes the post and any poll votes."
                  confirmLabel="Delete"
                  onConfirm={() => {
                    deletePost(post.id);
                    toast("Post deleted");
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function PostFormDialog({
  trigger,
  post,
}: {
  trigger: React.ReactElement;
  post?: ForumPost;
}) {
  const addPost = useStore((s) => s.addPost);
  const updatePost = useStore((s) => s.updatePost);
  const setPollOptions = useStore((s) => s.setPollOptions);
  const pollOptions = useStore((s) => s.pollOptions);
  const currentPlayerId = useStore((s) => s.currentPlayerId);
  const isEdit = Boolean(post);

  const [open, setOpen] = useState(false);
  const [type, setType] = useState<ForumPostType>("post");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [pinned, setPinned] = useState(false);
  const [options, setOptions] = useState<{ id?: string; text: string }[]>([
    { text: "" },
    { text: "" },
  ]);

  useEffect(() => {
    if (!open) return;
    setType(post?.type ?? "post");
    setTitle(post?.title ?? "");
    setBody(post?.body ?? "");
    setPinned(post?.pinned ?? false);
    if (post?.type === "poll") {
      const existing = pollOptions
        .filter((o) => o.postId === post.id)
        .map((o) => ({ id: o.id, text: o.text }));
      setOptions(existing.length ? existing : [{ text: "" }, { text: "" }]);
    } else {
      setOptions([{ text: "" }, { text: "" }]);
    }
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  const validOptions = options.filter((o) => o.text.trim());
  const pollOk = type !== "poll" || validOptions.length >= 2;
  const canSave = title.trim() && body.trim() && pollOk;

  function save() {
    if (!canSave) return;
    if (isEdit && post) {
      updatePost(post.id, {
        title: title.trim(),
        body: body.trim(),
        pinned,
      });
      if (post.type === "poll") {
        setPollOptions(
          post.id,
          options
            .filter((o) => o.text.trim())
            .map((o) => ({ id: o.id, text: o.text.trim() }))
        );
      }
      toast("Post updated");
    } else {
      addPost({
        authorId: currentPlayerId ?? "p1",
        title: title.trim(),
        body: body.trim(),
        type,
        pinned,
        options: type === "poll" ? options.map((o) => o.text) : undefined,
      });
      toast(type === "poll" ? "Poll posted" : "Post published");
    }
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={trigger} />
      <DialogContent className="max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Edit post" : "New post"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {!isEdit && (
            <div className="space-y-1.5">
              <Label>Type</Label>
              <SegmentedControl
                value={type}
                onChange={setType}
                options={[
                  { value: "post", label: "Post" },
                  { value: "poll", label: "Poll" },
                ]}
              />
            </div>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="f-title">Title</Label>
            <Input
              id="f-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="f-body">Body</Label>
            <Textarea
              id="f-body"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={4}
            />
          </div>

          {type === "poll" && (
            <div className="space-y-2">
              <Label>Options</Label>
              {options.map((opt, i) => (
                <div key={opt.id ?? i} className="flex items-center gap-2">
                  <Input
                    value={opt.text}
                    onChange={(e) =>
                      setOptions((prev) =>
                        prev.map((o, idx) =>
                          idx === i ? { ...o, text: e.target.value } : o
                        )
                      )
                    }
                    placeholder={`Option ${i + 1}`}
                  />
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    disabled={options.length <= 2}
                    onClick={() =>
                      setOptions((prev) => prev.filter((_, idx) => idx !== i))
                    }
                    aria-label="Remove option"
                  >
                    <X />
                  </Button>
                </div>
              ))}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setOptions((prev) => [...prev, { text: "" }])}
              >
                <Plus />
                Add option
              </Button>
            </div>
          )}

          <div className="flex items-center justify-between rounded-lg bg-muted/40 px-3 py-2.5">
            <div>
              <Label htmlFor="f-pin" className="cursor-pointer">
                Pin to top
              </Label>
              <p className="text-xs text-muted-foreground">
                Pinned posts show first everywhere.
              </p>
            </div>
            <Switch id="f-pin" checked={pinned} onCheckedChange={setPinned} />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={save} disabled={!canSave}>
            {isEdit ? "Save changes" : "Publish"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
