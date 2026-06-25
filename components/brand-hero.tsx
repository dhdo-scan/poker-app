import { Spade } from "lucide-react";

/**
 * Premium brand lockup for the entry screens: a gold spade "crest" (double ring
 * + soft glow) above the condensed wordmark and an optional tagline.
 */
export function BrandHero({ tagline }: { tagline?: string }) {
  return (
    <div className="flex flex-col items-center gap-4 text-center">
      <div className="relative grid size-24 place-items-center">
        <div className="absolute inset-0 rounded-full border border-primary/30" />
        <div className="absolute inset-2 rounded-full border border-primary/20" />
        <div
          className="absolute inset-0 rounded-full"
          style={{
            background:
              "radial-gradient(circle at 50% 35%, rgba(211,188,141,0.22), transparent 70%)",
          }}
        />
        <Spade
          className="size-10 text-primary"
          fill="currentColor"
          strokeWidth={1}
        />
      </div>

      <div className="space-y-1.5">
        <h1 className="font-heading text-3xl font-semibold tracking-[0.22em] text-foreground uppercase">
          The Felt
        </h1>
        {tagline && (
          <p className="text-sm text-muted-foreground">{tagline}</p>
        )}
      </div>
    </div>
  );
}
