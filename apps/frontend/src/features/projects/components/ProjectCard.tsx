import Link from "next/link";
import { Clock } from "lucide-react";
import type { Repo } from "@repo/types";
import { Progress } from "@/shared/components/Progress";
import { formatRelativeTime } from "@/shared/lib/format-relative-time";

type ProjectCardProps = {
  repo: Repo;
};

export function ProjectCard({ repo }: ProjectCardProps) {
  return (
    <Link
      href={`/projects/${repo.id}`}
      className="flex h-full flex-col rounded border border-outline-variant bg-surface-container p-6 transition-colors hover:border-outline hover:bg-surface-container-high"
    >
      <h3 className="mb-2 font-mono text-headline-md font-bold text-on-surface">
        {repo.owner}/{repo.name}
      </h3>
      {repo.description && (
        <p className="mb-6 line-clamp-2 flex-grow text-body-md text-on-surface-variant">
          {repo.description}
        </p>
      )}

      <Progress status={repo.status} />

      <div className="mt-4 flex items-center justify-between border-t border-outline-variant pt-4">
        <span className="text-label-sm text-on-surface-variant">
          {repo.fileCount} files
        </span>
        <span className="flex items-center gap-1 font-mono text-label-sm text-on-surface-variant">
          <Clock size={14} />
          {formatRelativeTime(repo.indexedAt)}
        </span>
      </div>
    </Link>
  );
}