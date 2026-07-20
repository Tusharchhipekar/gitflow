"use client";

import { useState } from "react";
import { Link2, BarChart3 } from "lucide-react";
import { Button } from "@/shared/components/Button";
import { getErrorMessage } from "@/shared/lib/get-error-message";
import { useCreateRepo } from "../hooks/useRepos";

function parseGithubUrl(input: string): { owner: string; name: string } | null {
  const trimmed = input.trim().replace(/\.git$/, "").replace(/\/$/, "");
  const match = trimmed.match(/(?:github\.com\/)?([\w.-]+)\/([\w.-]+)$/);
  if (!match) return null;
  return { owner: match[1], name: match[2] };
}

export function NewProjectCard() {
  const [url, setUrl] = useState("");
  const [parseError, setParseError] = useState<string | null>(null);
  const createRepo = useCreateRepo();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = parseGithubUrl(url);
    if (!parsed) {
      setParseError("Enter a valid GitHub URL, like github.com/owner/repo");
      return;
    }
    setParseError(null);
    createRepo.mutate(parsed, {
      onSuccess: () => setUrl(""),
    });
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mx-auto mb-10 flex w-full max-w-3xl flex-col items-center gap-6 rounded border border-outline-variant bg-surface-container-low p-8"
    >
      <div className="relative flex w-full items-center">
        <Link2
          size={20}
          className="pointer-events-none absolute left-4 text-on-surface-variant"
        />
        <input
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://github.com/username/repository"
          className="h-14 w-full rounded border border-outline-variant bg-surface-container-lowest pl-12 pr-4 font-mono text-body-md text-on-surface placeholder:text-on-surface-variant focus:outline-none focus:border-primary"
        />
      </div>

      {(parseError || createRepo.error) && (
        <p className="w-full text-label-sm text-error">
          {parseError ?? getErrorMessage(createRepo.error)}
        </p>
      )}

      <Button
        type="submit"
        variant="secondary"
        disabled={createRepo.isPending}
        className="h-16 gap-3 text-lg font-bold"
      >
        <BarChart3 size={22} />
        {createRepo.isPending ? "Starting..." : "Extract Documentation"}
      </Button>
    </form>
  );
}