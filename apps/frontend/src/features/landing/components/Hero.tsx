"use client";

import Link from "next/link";
import { ArrowRight, PlayCircle } from "lucide-react";

function scrollToFeatures() {
  document
    .getElementById("features")
    ?.scrollIntoView({ behavior: "smooth" });
}

export function Hero() {
  return (
    <section className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-16 px-6 pb-32 pt-48 lg:grid-cols-2">
      <div className="z-10 flex flex-col gap-8">
        <h1 className="font-headline text-5xl font-extrabold uppercase leading-none tracking-tighter text-on-surface md:text-6xl lg:text-7xl">
          Your Code,
          <br />
          Documented Instantly
        </h1>
        <p className="max-w-lg border-l-2 border-surface-bright pl-6 text-lg leading-relaxed text-on-surface-variant">
          Stop writing boilerplate docs. GitFlow analyzes your repositories,
          understands your architecture, and generates structured
          documentation with real sequence diagrams — automatically.
        </p>
        <div className="mt-4 flex flex-col gap-4 sm:flex-row">
          <Link
            href="/login"
            className="flex items-center justify-center gap-2 rounded bg-on-surface px-8 py-4 text-xs font-bold uppercase tracking-wider text-background transition-colors hover:bg-primary"
          >
            Get started
            <ArrowRight size={18} />
          </Link>
          <button
            type="button"
            onClick={scrollToFeatures}
            className="flex items-center justify-center gap-2 rounded border border-surface-bright px-8 py-4 text-xs font-bold uppercase tracking-wider text-on-surface transition-colors hover:bg-surface-container-high"
          >
            <PlayCircle size={18} />
            See how it works
          </button>
        </div>
      </div>

      <div className="relative flex w-full items-center justify-center lg:justify-end">
        <div className="relative z-10 flex w-full max-w-lg flex-col gap-6 rounded-xl border border-surface-bright bg-surface-container/80 p-6 backdrop-blur-sm">
          <div className="mb-2 flex gap-2 border-b border-surface-bright pb-4">
            <div className="h-3 w-3 rounded-full border border-surface-bright" />
            <div className="h-3 w-3 rounded-full border border-surface-bright" />
            <div className="h-3 w-3 rounded-full border border-surface-bright" />
          </div>

          <div className="relative flex h-40 flex-col gap-3 overflow-hidden rounded-lg border border-surface-bright bg-surface-container-lowest p-6 font-mono text-xs text-on-surface-variant">
            <div className="h-3 w-3/4 bg-surface-bright/50" />
            <div className="ml-6 h-3 w-1/2 bg-surface-bright/30" />
            <div className="ml-6 h-3 w-2/3 bg-surface-bright/30" />
            <div className="h-3 w-1/4 bg-surface-bright/50" />
          </div>

          <div className="relative -my-2 flex justify-center">
            <div className="flex h-8 w-8 items-center justify-center rounded-full border border-surface-bright bg-surface-container-high">
              <ArrowRight size={14} className="rotate-90 text-on-surface-variant" />
            </div>
          </div>

          <div className="rounded-lg border border-surface-bright bg-surface-container-lowest p-6">
            <div className="mb-4 flex items-center justify-between border-b border-surface-bright pb-2">
              <span className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-on-surface">
                AuthService.md
              </span>
              <span className="rounded bg-surface-bright px-2 py-0.5 text-[9px] font-bold text-on-surface">
                GENERATED
              </span>
            </div>
            <p className="font-mono text-[11px] italic leading-relaxed text-on-surface-variant">
            Handles user session management, JWT validation, and OAuth2callback flows. </p>
          </div>
        </div>
      </div>
    </section>
  );
}