import Link from "next/link";
import { Spade } from "lucide-react";
import { cn } from "@/lib/utils";

/** The club wordmark — a spade glyph + "THE FELT" in the condensed display font. */
export function Brand({
  className,
  href = "/",
}: {
  className?: string;
  href?: string;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "group flex items-center gap-2 select-none",
        className
      )}
    >
      <span className="flex size-7 items-center justify-center rounded-md bg-primary text-primary-foreground">
        <Spade className="size-4" />
      </span>
      <span className="font-heading text-lg font-semibold tracking-[0.18em] text-foreground uppercase">
        The Felt
      </span>
    </Link>
  );
}
