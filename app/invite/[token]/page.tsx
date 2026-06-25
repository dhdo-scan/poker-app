"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { Ban, UserPlus } from "lucide-react";
import { BrandHero } from "@/components/brand-hero";
import { SuitBackdrop } from "@/components/suit-backdrop";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useStore } from "@/lib/store";

export default function InvitePage() {
  const params = useParams<{ token: string }>();
  const token = Array.isArray(params.token) ? params.token[0] : params.token;
  const router = useRouter();

  const invite = useStore((s) => s.invites.find((i) => i.token === token));
  const acceptInvite = useStore((s) => s.acceptInvite);

  const valid = Boolean(invite && !invite.used);
  const [name, setName] = useState("");
  const [email, setEmail] = useState(invite?.email ?? "");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;
    const res = acceptInvite(token, {
      email: email.trim(),
      realName: name.trim(),
    });
    if (res.ok) {
      toast(`Welcome to the club, ${name.trim().split(" ")[0]}`);
      router.replace("/");
    } else {
      toast("This invite is no longer valid");
    }
  }

  return (
    <div className="relative flex min-h-screen flex-1 flex-col items-center justify-center overflow-hidden px-4 py-10">
      <SuitBackdrop />

      <div className="relative z-10 w-full max-w-sm">
        <div className="mb-8">
          <BrandHero />
        </div>

        {valid ? (
          <div className="rounded-xl bg-card p-6 ring-1 ring-border">
            <div className="space-y-1 text-center">
              <h1 className="font-heading text-xl font-semibold">
                You&apos;re invited
              </h1>
              <p className="text-sm text-muted-foreground">
                Create your account to join the table.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="name">Full name</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Alex Carter"
                  autoFocus
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                />
                <p className="text-xs text-muted-foreground">
                  This becomes your sign-in — you won&apos;t be able to change it
                  later.
                </p>
              </div>
              <Button
                type="submit"
                size="lg"
                className="w-full"
                disabled={!name.trim() || !email.trim()}
              >
                <UserPlus />
                Create account &amp; enter
              </Button>
            </form>
          </div>
        ) : (
          <div className="rounded-xl bg-card p-6 text-center ring-1 ring-border">
            <span className="mx-auto mb-3 flex size-12 items-center justify-center rounded-full bg-destructive/15 text-destructive">
              <Ban className="size-6" />
            </span>
            <h1 className="font-heading text-xl font-semibold">
              Invite no longer valid
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              This link may have already been used or been revoked. Ask the host
              for a fresh invite.
            </p>
            <Button
              variant="outline"
              nativeButton={false}
              render={<Link href="/login" />}
              className="mt-5"
            >
              Go to sign in
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
