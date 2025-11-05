import { tw } from "@/tailwind";
import Link from "next/link";

type LogoProps = {
  className?: string;
  /** Hides the wordmark, leaving just the mark — used by the collapsed sidebar. */
  compact?: boolean;
};

export const Logo = ({ className, compact = false }: LogoProps) => (
  <Link
    aria-label="Vi Hub — home"
    className={tw("focus-ring group flex items-center gap-2 rounded-lg", className)}
    href="/"
  >
    <span className="relative flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-primary">
      <span className="text-[15px] font-black leading-none text-primary-foreground">Vi</span>
      {/* Sweeps across the mark on hover. Purely decorative. */}
      <span
        aria-hidden="true"
        className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/40 to-transparent transition-transform duration-700 ease-out-expo group-hover:translate-x-full"
      />
    </span>

    {!compact && (
      <span className="text-headline-s tracking-tight">
        Vi<span className="text-muted-foreground">Hub</span>
      </span>
    )}
  </Link>
);
