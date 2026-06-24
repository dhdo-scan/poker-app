"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useStore } from "@/lib/store";
import { useCurrentPlayer } from "@/lib/hooks";
import { formatCurrency, formatSigned } from "@/lib/format";
import { cn } from "@/lib/utils";

export default function SettingsPage() {
  const player = useCurrentPlayer();
  const updatePlayer = useStore((s) => s.updatePlayer);
  const [name, setName] = useState(player?.realName ?? "");

  // Re-sync the field when the signed-in player changes.
  useEffect(() => {
    if (player) setName(player.realName);
  }, [player?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!player) return null;

  const trimmed = name.trim();
  const dirty = trimmed.length > 0 && trimmed !== player.realName;

  function save() {
    if (!player || !dirty) return;
    updatePlayer(player.id, { realName: trimmed });
    toast("Profile updated");
  }

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <h1 className="font-heading text-2xl font-semibold">Settings</h1>
        <p className="text-muted-foreground">
          Manage your profile and review your numbers.
        </p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <CardDescription>
            Your name is what other players see at the table.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="realName">Display name</Label>
            <Input
              id="realName"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <div className="relative">
              <Input
                id="email"
                value={player.email}
                readOnly
                disabled
                className="pr-9"
              />
              <Lock className="absolute top-1/2 right-3 size-4 -translate-y-1/2 text-muted-foreground" />
            </div>
            <p className="text-xs text-muted-foreground">
              This is your sign-in — it can&apos;t be changed.
            </p>
          </div>

          <div>
            <Button size="lg" onClick={save} disabled={!dirty}>
              Save changes
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Your numbers</CardTitle>
          <CardDescription>
            Your net P/L is private — only you and the host can see it.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Stat
            label="Total winnings"
            value={formatCurrency(player.totalWinnings)}
            sub="Visible to the club"
          />
          <Stat
            label="Net profit / loss"
            value={formatSigned(player.profitLoss)}
            sub="Private to you"
            valueClassName={
              player.profitLoss > 0
                ? "text-primary"
                : player.profitLoss < 0
                  ? "text-destructive"
                  : "text-foreground"
            }
            isPrivate
          />
        </CardContent>
      </Card>
    </div>
  );
}

function Stat({
  label,
  value,
  sub,
  valueClassName,
  isPrivate,
}: {
  label: string;
  value: string;
  sub: string;
  valueClassName?: string;
  isPrivate?: boolean;
}) {
  return (
    <div className="rounded-lg bg-muted/40 p-4">
      <div className="flex items-center gap-2">
        <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
          {label}
        </p>
        {isPrivate && (
          <span className="rounded-full bg-secondary px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
            Private
          </span>
        )}
      </div>
      <p className={cn("mt-1 font-heading text-2xl font-semibold", valueClassName)}>
        {value}
      </p>
      <p className="mt-0.5 text-xs text-muted-foreground">{sub}</p>
    </div>
  );
}
