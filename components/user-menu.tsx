"use client";

import Link from "next/link";
import { LogOut, Settings as SettingsIcon } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useStore } from "@/lib/store";
import { useCurrentPlayer } from "@/lib/hooks";
import { initials } from "@/lib/format";

export function UserMenu() {
  const player = useCurrentPlayer();
  const signOut = useStore((s) => s.signOut);

  if (!player) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <button
            type="button"
            className="rounded-full outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            aria-label="Account menu"
          />
        }
      >
        <Avatar>
          <AvatarFallback className="bg-secondary text-primary">
            {initials(player.realName)}
          </AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <div className="px-2 py-1.5">
          <p className="text-sm font-medium text-foreground">
            {player.realName}
          </p>
          {/* Own email — visible to self only. */}
          <p className="truncate text-xs text-muted-foreground">
            {player.email}
          </p>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem nativeButton={false} render={<Link href="/settings" />}>
          <SettingsIcon />
          Settings
        </DropdownMenuItem>
        <DropdownMenuItem variant="destructive" onClick={() => signOut()}>
          <LogOut />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
