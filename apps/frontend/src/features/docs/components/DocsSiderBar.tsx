"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRepoSections } from "../hooks/useRepoSections";
import { useRepo } from "@/features/projects/hooks/useRepos";

type DocsSidebarProps = {
  repoId: number;
};

function formatIndexedDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function DocsSidebar({ repoId }: DocsSidebarProps) {
  const { data } = useRepoSections(repoId);
  const { data: repo } = useRepo(repoId);
  const pathname = usePathname();

  if (!data) return null;

  return (
    <aside className="flex w-64 flex-shrink-0 flex-col overflow-y-auto border-r border-outline-variant p-6">
      <p className="mb-4 text-label-sm uppercase tracking-wider text-on-surface-variant">
        Documentation
      </p>
      <nav className="flex flex-1 flex-col gap-4">
        {data.sections.map((section) => (
          <div key={section.id}>
            <p className="mb-1 px-3 text-label-sm font-semibold text-on-surface-variant">
              {section.title}
            </p>
            <div className="flex flex-col gap-0.5">
              {section.pages.map((page) => {
                const href = `/projects/${repoId}/${page.id}`;
                const active = pathname === href;
                return (
                  <Link
                    key={page.id}
                    href={href}
                    className={`rounded px-3 py-2 text-body-md transition-colors ${
                      active
                        ? "bg-surface-container-high font-medium text-on-surface"
                        : "text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface"
                    }`}
                  >
                    {page.title}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {repo && (
        <p className="mt-6 px-3 font-mono text-label-sm text-outline">
          Last indexed: {formatIndexedDate(repo.indexedAt)}
          {repo.sha !== "pending" && ` (${repo.sha.slice(0, 7)})`}
        </p>
      )}
    </aside>
  );
}