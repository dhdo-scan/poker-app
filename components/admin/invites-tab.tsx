"use client";

import { toast } from "sonner";
import { Ban, Copy, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { EmptyState } from "@/components/empty-state";
import { useStore } from "@/lib/store";
import { playerById } from "@/lib/selectors";

export function InvitesTab() {
  const invites = useStore((s) => s.invites);
  const players = useStore((s) => s.players);
  const currentPlayerId = useStore((s) => s.currentPlayerId);
  const generateInvite = useStore((s) => s.generateInvite);
  const revokeInvite = useStore((s) => s.revokeInvite);

  // Unused invites first.
  const sorted = [...invites].sort((a, b) => Number(a.used) - Number(b.used));

  function inviteUrl(token: string) {
    if (typeof window === "undefined") return `/invite/${token}`;
    return `${window.location.origin}/invite/${token}`;
  }

  function copy(token: string) {
    const url = inviteUrl(token);
    try {
      navigator.clipboard?.writeText(url);
      toast("Invite link copied", { description: url });
    } catch {
      toast("Copy this link", { description: url });
    }
  }

  function generate() {
    const token = generateInvite(currentPlayerId ?? "p1");
    copy(token);
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Single-use links. Two demo invites are seeded below.
        </p>
        <Button size="sm" onClick={generate}>
          <Plus />
          Generate invite
        </Button>
      </div>

      {sorted.length === 0 ? (
        <EmptyState
          title="No invites yet"
          description="Generate a link to bring someone into the club."
        />
      ) : (
        <div className="space-y-2">
          {sorted.map((inv) => {
            const usedByName = inv.usedBy
              ? playerById(players, inv.usedBy)?.realName
              : undefined;
            return (
              <div
                key={inv.token}
                className="flex flex-wrap items-center gap-x-4 gap-y-2 rounded-xl bg-card p-4 ring-1 ring-border"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate font-mono text-sm text-foreground">
                    /invite/{inv.token}
                  </p>
                  <div className="mt-1">
                    {inv.used ? (
                      <Badge variant="secondary">
                        Used{usedByName ? ` by ${usedByName}` : ""}
                      </Badge>
                    ) : (
                      <Badge className="bg-primary/15 text-primary">Unused</Badge>
                    )}
                  </div>
                </div>

                {!inv.used && (
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copy(inv.token)}
                    >
                      <Copy />
                      Copy link
                    </Button>
                    <ConfirmDialog
                      trigger={
                        <Button
                          variant="destructive"
                          size="sm"
                          aria-label="Revoke invite"
                        >
                          <Ban />
                          Revoke
                        </Button>
                      }
                      title="Revoke this invite?"
                      description="The link will stop working immediately."
                      confirmLabel="Revoke"
                      onConfirm={() => {
                        revokeInvite(inv.token);
                        toast("Invite revoked");
                      }}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
