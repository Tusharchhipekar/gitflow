"use client";

import { useState } from "react";
import { ChevronRight, FileCode } from "lucide-react";

type RelevantSourceFilesProps = {
  sourceFiles: string[];
};

export function RelevantSourceFiles({ sourceFiles }: RelevantSourceFilesProps) {
  const [open, setOpen] = useState(false);

  if (sourceFiles.length === 0) return null;

  return (
    <div className="mb-10 rounded border border-outline-variant">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center gap-3 p-4 text-left transition-colors hover:bg-surface-container"
      >
        <ChevronRight
          size={18}
          className={`text-outline transition-transform ${open ? "rotate-90" : ""}`}
        />
        <span className="font-medium text-on-surface-variant">
          Relevant source files ({sourceFiles.length})
        </span>
      </button>

      {open && (
        <div className="flex flex-wrap gap-2 border-t border-outline-variant p-4">
          {sourceFiles.map((file) => (
            <span
              key={file}
              className="flex items-center gap-2 rounded border border-outline-variant bg-surface-container px-3 py-2 font-mono text-label-sm text-on-surface"
            >
              <FileCode size={14} />
              {file}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}