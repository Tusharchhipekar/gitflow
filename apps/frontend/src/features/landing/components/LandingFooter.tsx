import Link from "next/link";
import { Network } from "lucide-react";

export function LandingFooter() {
  return (
    <footer className="border-t border-surface-bright bg-surface-container-lowest px-6 pb-12 pt-24 md:px-12">
      <div className="mx-auto mb-20 grid max-w-7xl grid-cols-1 gap-12 md:grid-cols-4">
        <div className="col-span-1">
          <div className="mb-8 flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded border border-surface-bright bg-surface-container text-on-surface">
              <Network size={18} />
            </div>
            <span className="font-headline text-xl font-bold uppercase tracking-tighter text-on-surface">
              GitFlow
            </span>
          </div>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] leading-loose text-on-surface-variant">
            Your code, documented instantly.
          </p>
        </div>

        <div>
          <h4 className="mb-8 text-[10px] font-bold uppercase tracking-[0.3em] text-on-surface">
            Product
          </h4>
          <ul className="flex flex-col gap-4 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
            <li>
              <Link href="/login" className="transition-colors hover:text-on-surface">
                Get started
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="mb-8 text-[10px] font-bold uppercase tracking-[0.3em] text-on-surface">
            Account
          </h4>
          <ul className="flex flex-col gap-4 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
            <li>
              <Link href="/login" className="transition-colors hover:text-on-surface">
                Log in
              </Link>
            </li>
          </ul>
        </div>
      </div>

      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 border-t border-surface-bright pt-8 md:flex-row">
        <p className="font-mono text-[9px] uppercase tracking-widest text-on-surface-variant">
          © 2026 GitFlow
        </p>
      </div>
    </footer>
  );
}