import type {
  RepoFetchResult,
  GitHubTreeEntry,
  GitHubRepoResponse,
  GitHubBranchResponse,
  GitHubTreeResponse,
} from "./types/types";

const GITHUB_API = "https://api.github.com";
const RAW_GITHUB = "https://raw.githubusercontent.com";

const IGNORED_PATTERNS = [
  /(^|\/)node_modules\//,
  /(^|\/)\.git\//,
  /(^|\/)dist\//,
  /(^|\/)build\//,
  /(^|\/)\.next\//,
  /(^|\/)coverage\//,
  /\.lock$/,
  /\.(png|jpe?g|gif|svg|ico|woff2?|ttf)$/,
];

const MAX_FILES = 2000;
const MAX_CHARS_PER_FILE = 4000;

function checkGithubResponse(res: Response, context: string): void {
  if (res.ok) return;

  if (res.status === 404) {
    throw new Error(
      `${context}: not found (or private — unauthenticated access only)`,
    );
  }
  if (res.status === 403) {
    const remaining = res.headers.get("x-ratelimit-remaining");
    if (remaining === "0") {
      const resetHeader = res.headers.get("x-ratelimit-reset");
      const resetTime = resetHeader
        ? new Date(Number(resetHeader) * 1000).toISOString()
        : "unknown";
      throw new Error(
        `${context}: GitHub API rate limit exceeded (unauthenticated: 60/hr). ` +
          `Resets at ${resetTime}. Add a GITHUB_TOKEN to raise this to 5,000/hr.`,
      );
    }
    throw new Error(`${context}: GitHub API 403 (not rate-limit related)`);
  }
  throw new Error(`${context}: GitHub API error ${res.status}`);
}

export async function fetchRepoTree(
  owner: string,
  name: string,
): Promise<RepoFetchResult> {
  const repoRes = await fetch(`${GITHUB_API}/repos/${owner}/${name}`);
  checkGithubResponse(repoRes, "Fetching repo info");
  const repoData = (await repoRes.json()) as GitHubRepoResponse;
  const defaultBranch = repoData.default_branch;
  const description = repoData.description;

  const branchRes = await fetch(
    `${GITHUB_API}/repos/${owner}/${name}/branches/${defaultBranch}`,
  );
  checkGithubResponse(branchRes, "Fetching branch info");
  const branchData = (await branchRes.json()) as GitHubBranchResponse;
  const sha = branchData.commit.sha;

  const treeRes = await fetch(
    `${GITHUB_API}/repos/${owner}/${name}/git/trees/${sha}?recursive=1`,
  );
  checkGithubResponse(treeRes, "Fetching file tree");
  const treeData = (await treeRes.json()) as GitHubTreeResponse;

  const allFiles: string[] = treeData.tree
    .filter((entry) => entry.type === "blob")
    .map((entry) => entry.path)
    .filter((path) => !IGNORED_PATTERNS.some((pattern) => pattern.test(path)));

  const githubTruncated = treeData.truncated ?? false;
  const overOurCap = allFiles.length > MAX_FILES;
  const files = overOurCap ? allFiles.slice(0, MAX_FILES) : allFiles;

  return {
    sha,
    description,
    files,
    fileCount: files.length,
    truncated: githubTruncated || overOurCap,
  };
}

// ---------- File content fetching (used by the "generating" step) ----------

/**
 * Fetches raw content for a single file at a specific commit sha.
 * Returns null (rather than throwing) if the file can't be fetched —
 * callers should skip missing files gracefully rather than fail the whole page.
 */
export async function fetchFileContent(
  owner: string,
  name: string,
  sha: string,
  path: string,
): Promise<string | null> {
  try {
    const res = await fetch(`${RAW_GITHUB}/${owner}/${name}/${sha}/${path}`);
    if (!res.ok) {
      console.warn(`Failed to fetch ${path}: ${res.status}`);
      return null;
    }
    const text = await res.text();
    return text.length > MAX_CHARS_PER_FILE
      ? text.slice(0, MAX_CHARS_PER_FILE) + "\n... (truncated)"
      : text;
  } catch (err) {
    console.warn(`Error fetching ${path}:`, err);
    return null;
  }
}

/**
 * Fetches content for multiple files in parallel, returning a map of
 * path -> content. Files that fail to fetch are simply omitted from the map.
 */
export async function fetchFilesContents(
  owner: string,
  name: string,
  sha: string,
  paths: string[],
): Promise<Record<string, string>> {
  const results = await Promise.all(
    paths.map(async (path) => {
      const content = await fetchFileContent(owner, name, sha, path);
      return [path, content] as const;
    }),
  );

  const map: Record<string, string> = {};
  for (const [path, content] of results) {
    if (content !== null) {
      map[path] = content;
    }
  }
  return map;
}
