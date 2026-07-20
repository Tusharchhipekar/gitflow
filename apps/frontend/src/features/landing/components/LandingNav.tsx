import Link from "next/link";
import { Network } from "lucide-react";

export function LandingNav() {
  return (
    <header className="fixed top-0 z-50 flex h-20 w-full items-center justify-between border-b border-surface-bright bg-background/90 px-6 backdrop-blur-md md:px-12">
      <Link href="/" className="flex items-center gap-2">
        <div className="flex h-10 w-10 items-center justify-center border border-surface-bright bg-surface-container text-on-surface">
          <Network size={22} />
        </div>
        <span className="ml-2 font-headline text-2xl font-bold tracking-tighter text-on-surface">
          GITFLOW
        </span>
      </Link>

      <div className="flex items-center gap-4">
        <Link
          href="/login"
          className="px-4 py-2 text-[10px] font-bold uppercase tracking-[0.2em] text-on-surface hover:text-on-surface-variant"
        >
          Log in
        </Link>
        <Link
          href="/login"
          className="rounded bg-on-surface px-6 py-3 text-[10px] font-bold uppercase tracking-wider text-background transition-colors hover:bg-primary"
        >
          Start free
        </Link>
      </div>
    </header>
  );
}