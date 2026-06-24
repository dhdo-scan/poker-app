"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { RotateCcw } from "lucide-react";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { useStore } from "@/lib/store";
import { PlayersTab } from "@/components/admin/players-tab";
import { InvitesTab } from "@/components/admin/invites-tab";
import { GamesTab } from "@/components/admin/games-tab";
import { RegistrationsTab } from "@/components/admin/registrations-tab";
import { ForumTab } from "@/components/admin/forum-tab";

const TABS = [
  { value: "players", label: "Players" },
  { value: "invites", label: "Invites" },
  { value: "games", label: "Games" },
  { value: "registrations", label: "Registrations" },
  { value: "forum", label: "Forum" },
];

export default function AdminPage() {
  const router = useRouter();
  const resetDemo = useStore((s) => s.resetDemo);

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-1">
          <h1 className="font-heading text-2xl font-semibold">Admin</h1>
          <p className="text-muted-foreground">
            Manage players, invites, games, seats, and the forum.
          </p>
        </div>
        <ConfirmDialog
          trigger={
            <Button variant="destructive" size="sm">
              <RotateCcw />
              Reset demo data
            </Button>
          }
          title="Reset demo data?"
          description="This clears all changes and reloads the original seed data. You'll be signed out."
          confirmLabel="Reset"
          onConfirm={() => {
            resetDemo();
            toast("Demo data reset to seed");
            router.replace("/login");
          }}
        />
      </header>

      <Tabs defaultValue="players">
        <div className="no-scrollbar -mx-4 overflow-x-auto px-4">
          <TabsList className="w-max">
            {TABS.map((t) => (
              <TabsTrigger key={t.value} value={t.value}>
                {t.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        <TabsContent value="players" className="mt-4">
          <PlayersTab />
        </TabsContent>
        <TabsContent value="invites" className="mt-4">
          <InvitesTab />
        </TabsContent>
        <TabsContent value="games" className="mt-4">
          <GamesTab />
        </TabsContent>
        <TabsContent value="registrations" className="mt-4">
          <RegistrationsTab />
        </TabsContent>
        <TabsContent value="forum" className="mt-4">
          <ForumTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
