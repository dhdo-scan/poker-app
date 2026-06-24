"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Pencil, Plus } from "lucide-react";
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
import { Badge } from "@/components/ui/badge";
import { SegmentedControl } from "@/components/segmented-control";
import { useStore } from "@/lib/store";
import { formatCurrency, formatSigned } from "@/lib/format";
import type { Player, Role } from "@/lib/types";
import { cn } from "@/lib/utils";

export function PlayersTab() {
  const players = useStore((s) => s.players);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {players.length} member{players.length === 1 ? "" : "s"}
        </p>
        <PlayerFormDialog
          trigger={
            <Button size="sm">
              <Plus />
              Add player
            </Button>
          }
        />
      </div>

      <div className="space-y-2">
        {players.map((p) => (
          <div
            key={p.id}
            className="rounded-xl bg-card p-4 ring-1 ring-border"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="truncate font-medium text-foreground">
                    {p.realName}
                  </span>
                  {p.role === "admin" ? (
                    <Badge className="bg-primary text-primary-foreground">
                      Admin
                    </Badge>
                  ) : (
                    <Badge variant="secondary">Player</Badge>
                  )}
                </div>
                {/* Admin sees full info: email + private P/L. */}
                <p className="truncate text-xs text-muted-foreground">
                  {p.email}
                </p>
              </div>

              <PlayerFormDialog
                player={p}
                trigger={
                  <Button variant="outline" size="sm" className="shrink-0">
                    <Pencil />
                    Edit
                  </Button>
                }
              />
            </div>

            <div className="mt-3 flex gap-8 text-sm">
              <div>
                <p className="text-[11px] tracking-wide text-muted-foreground uppercase">
                  Winnings
                </p>
                <p className="font-medium">{formatCurrency(p.totalWinnings)}</p>
              </div>
              <div>
                <p className="text-[11px] tracking-wide text-muted-foreground uppercase">
                  Net P/L
                </p>
                <p
                  className={cn(
                    "font-medium",
                    p.profitLoss > 0
                      ? "text-primary"
                      : p.profitLoss < 0
                        ? "text-destructive"
                        : ""
                  )}
                >
                  {formatSigned(p.profitLoss)}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function PlayerFormDialog({
  trigger,
  player,
}: {
  trigger: React.ReactElement;
  player?: Player;
}) {
  const addPlayer = useStore((s) => s.addPlayer);
  const updatePlayer = useStore((s) => s.updatePlayer);
  const isEdit = Boolean(player);

  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<Role>("player");
  const [winnings, setWinnings] = useState("0");
  const [pl, setPl] = useState("0");

  // Seed the fields each time the dialog opens.
  useEffect(() => {
    if (open) {
      setName(player?.realName ?? "");
      setEmail(player?.email ?? "");
      setRole(player?.role ?? "player");
      setWinnings(String(player?.totalWinnings ?? 0));
      setPl(String(player?.profitLoss ?? 0));
    }
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  function save() {
    if (!name.trim()) return;
    const w = Number(winnings) || 0;
    const p = Number(pl) || 0;
    if (isEdit && player) {
      updatePlayer(player.id, {
        realName: name.trim(),
        role,
        totalWinnings: w,
        profitLoss: p,
      });
      toast("Player updated");
    } else {
      if (!email.trim()) return;
      addPlayer({
        realName: name.trim(),
        email: email.trim(),
        role,
        totalWinnings: w,
        profitLoss: p,
      });
      toast("Player added");
    }
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={trigger} />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit player" : "Add player"}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="p-name">Display name</Label>
            <Input
              id="p-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="p-email">Email</Label>
            <Input
              id="p-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              readOnly={isEdit}
              disabled={isEdit}
            />
            {isEdit && (
              <p className="text-xs text-muted-foreground">
                Email is the sign-in identifier and can&apos;t be changed.
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label>Role</Label>
            <SegmentedControl
              value={role}
              onChange={setRole}
              options={[
                { value: "player", label: "Player" },
                { value: "admin", label: "Admin" },
              ]}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="p-win">Total winnings ($)</Label>
              <Input
                id="p-win"
                type="number"
                value={winnings}
                onChange={(e) => setWinnings(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="p-pl">Net P/L ($)</Label>
              <Input
                id="p-pl"
                type="number"
                value={pl}
                onChange={(e) => setPl(e.target.value)}
              />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={save} disabled={!name.trim() || (!isEdit && !email.trim())}>
            {isEdit ? "Save changes" : "Add player"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
