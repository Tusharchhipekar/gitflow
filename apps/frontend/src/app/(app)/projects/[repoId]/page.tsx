"use client";

import { use, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useRepoSections } from "@/features/docs/hooks/useRepoSections";
import { Progress } from "@/shared/components/Progress";

type PageProps = {
  params: Promise<{ repoId: string }>;
};

export default function RepoIndexPage({ params }: PageProps) {
  const { repoId } = use(params);
  const repoIdNum = Number(repoId);
  const router = useRouter();
  const { data } = useRepoSections(repoIdNum);

  useEffect(() => {
    const firstPageId = data?.sections[0]?.pages[0]?.id;
    if (data?.repo.status === "ready" && firstPageId) {
      router.replace(`/projects/${repoIdNum}/${firstPageId}`);
    }
  }, [data, repoIdNum, router]);

  if (!data) {
    return (
      <div className="p-10 text-body-md text-on-surface-variant">
        Loading...
      </div>
    );
  }

  if (data.repo.status !== "ready") {
    return (
      <div className="mx-auto max-w-md p-10">
        <p className="mb-1 font-mono text-headline-md font-bold text-on-surface">
          {data.repo.owner}/{data.repo.name}
        </p>
        <p className="mb-6 text-body-md text-on-surface-variant">
          Indexing in progress — this page updates automatically.
        </p>
        <Progress status={data.repo.status} />
      </div>
    );
  }

  return (
    <div className="p-10 text-body-md text-on-surface-variant">
      Redirecting to documentation...
    </div>
  );
}