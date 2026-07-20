"use client";

import { useState } from "react";
import { Share2, LogOut, Check, Network } from "lucide-react";
import type { Repo } from "@repo/types";
import { useLogout } from "@/features/auth/hooks/useAuth";

type DocsTopBarProps = {
  repo: Pick<Repo, "owner" | "name" | "status">;
};

export function DocsTopBar({ repo }: DocsTopBarProps) {
  const logout = useLogout();
  const [copied, setCopied] = useState(false);

  function handleShare() {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <header className="flex flex-shrink-0 items-center justify-between border-b border-outline-variant px-8 py-4">
      <div className="flex min-w-0 items-center gap-3">
        <Network size={22} className="flex-shrink-0 text-on-surface" />
        <p className="font-headline-lg text-body-lg font-bold text-on-surface">
          GitFlow
        </p>
        <p className="break-words font-mono text-body-md text-on-surface-variant">
          {repo.owner}/{repo.name}
        </p>
      </div>

      <div className="flex items-center gap-3">
        <span className="rounded bg-surface-container-high px-3 py-1 font-mono text-label-sm uppercase tracking-wider text-on-surface-variant">
          {repo.status}
        </span>

        <button
          type="button"
          onClick={handleShare}
          className="flex items-center gap-2 rounded bg-primary px-4 py-2 text-label-md font-bold text-on-primary transition-opacity hover:opacity-90"
        >
          {copied ? <Check size={16} /> : <Share2 size={16} />}
          {copied ? "Copied" : "Share"}
        </button>

        <button
          type="button"
          onClick={() => logout.mutate()}
          className="flex items-center gap-2 rounded border border-outline px-4 py-2 text-label-md font-bold text-on-surface transition-colors hover:bg-surface-bright"
        >
          <LogOut size={16} />
          Logout
        </button>
      </div>
    </header>
  );
}