"use client";

import { useMemo, useState } from "react";
import { Search, LogOut } from "lucide-react";
import { useRepos } from "../hooks/useRepos";
import { ProjectCard } from "./ProjectCard";
import { NewProjectCard } from "./NewProjectCard";
import { Input } from "@/shared/components/Input";
import { useLogout } from "@/features/auth/hooks/useAuth";

export function ProjectsGrid() {
  const { data: repos, isLoading, error } = useRepos();
  const [query, setQuery] = useState("");
  const logout = useLogout();

  const filtered = useMemo(() => {
    if (!repos) return [];
    if (!query.trim()) return repos;
    const q = query.toLowerCase();
    return repos.filter(
      (r) =>
        r.name.toLowerCase().includes(q) || r.owner.toLowerCase().includes(q),
    );
  }, [repos, query]);

  return (
    <div className="mx-auto max-w-6xl px-8 py-10">
      <div className="mb-10 flex flex-col items-start justify-between gap-6 lg:flex-row lg:items-center">
        <div>
          <h1 className="mb-2 text-display font-display font-bold text-on-surface">
            My Projects
          </h1>
          <p className="text-body-md text-on-surface-variant">
            Manage and extract documentation from your repositories with high
            precision.
          </p>
        </div>

        <div className="flex w-full items-center gap-4 lg:w-auto">
          <Input
            icon={<Search size={16} />}
            placeholder="Find repository..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="h-12 flex-1 lg:w-72"
          />
          <button
            type="button"
            onClick={() => logout.mutate()}
            className="flex h-12 items-center gap-2 whitespace-nowrap rounded border border-outline-variant bg-surface-container px-6 font-mono text-label-sm uppercase tracking-wider text-on-surface-variant transition-colors hover:bg-surface-container-high hover:text-on-surface"
          >
            <LogOut size={20} />
            Logout
          </button>
        </div>
      </div>

      <NewProjectCard />

      <div className="mb-8 flex gap-4">
        <span className="rounded bg-surface-container-highest px-6 py-2.5 text-body-md font-bold text-background">
          All Projects ({repos?.length ?? 0})
        </span>
      </div>

      {isLoading && (
        <p className="text-body-md text-on-surface-variant">
          Loading projects...
        </p>
      )}

      {error && (
        <p className="text-body-md text-error">
          Couldn&apos;t load your projects. Try refreshing.
        </p>
      )}

      {!isLoading && !error && filtered.length === 0 && (
        <div className="rounded border border-outline-variant bg-surface-container p-12 text-center">
          <p className="text-body-lg text-on-surface-variant">
            {query
              ? "No repositories match your search."
              : "Paste a GitHub URL above to index your first repository."}
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3 md:gap-8">
        {filtered.map((repo) => (
          <ProjectCard key={repo.id} repo={repo} />
        ))}
      </div>
    </div>
  );
}