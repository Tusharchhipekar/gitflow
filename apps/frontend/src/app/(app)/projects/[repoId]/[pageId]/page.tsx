"use client";

import { use } from "react";
import { useRepoSections } from "@/features/docs/hooks/useRepoSections";
import { usePage } from "@/features/docs/hooks/usePage";
import { DocsSidebar } from "@/features/docs/components/DocsSiderBar";
import { DocsTopBar } from "@/features/docs/components/DocsTopBar";
import { TableOfContents } from "@/features/docs/components/TableOfContents";
import { MarkdownRenderer } from "@/features/docs/components/MarkdownRenderer";
import { RelevantSourceFiles } from "@/features/docs/components/RelevantSourceFile";
import { ChatBox } from "@/features/docs/components/ChatBox";

type PageProps = {
  params: Promise<{ repoId: string; pageId: string }>;
};

export default function DocPage({ params }: PageProps) {
  const { repoId, pageId } = use(params);
  const repoIdNum = Number(repoId);
  const pageIdNum = Number(pageId);

  const { data: sectionsData } = useRepoSections(repoIdNum);
  const { data: page, isLoading, error } = usePage(pageIdNum);

  if (isLoading) {
    return (
      <div className="p-10 text-body-md text-on-surface-variant">
        Loading...
      </div>
    );
  }

  if (error || !page) {
    return (
      <div className="p-10 text-body-md text-error">Page not found.</div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      {sectionsData && <DocsTopBar repo={sectionsData.repo} />}
      <div className="flex flex-1 overflow-hidden">
        <DocsSidebar repoId={repoIdNum} />
        <div className="flex-1 overflow-y-auto bg-surface-container-lowest">
         
          <div className="mx-auto max-w-3xl px-10 py-10 pb-32">
            <h1 className="mb-8 text-display font-display text-on-surface">
              {page.title}
            </h1>
            <RelevantSourceFiles sourceFiles={page.sourceFiles} />
            <MarkdownRenderer markdown={page.markdown} />
          </div>
        </div>
        <TableOfContents markdown={page.markdown} />
      </div>
      <ChatBox pageId={pageIdNum} />
    </div>
  );
}