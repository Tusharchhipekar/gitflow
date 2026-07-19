import type {
  RepoFetchResult,
  GitHubTreeEntry,
  GitHubRepoResponse,
  GitHubBranchResponse,
  GitHubTreeResponse,
} from "./types/types";

const GITHUB_API = "https://api.github.com";

const IGNORED_PATTERNS = [
  /^node_modules\//,
  /^\.git\//,
  /^dist\//,
  /^build\//,
  /^\.next\//,
  /^coverage\//,
  /\.lock$/,
  /\.png$|\.jpg$|\.jpeg$|\.gif$|\.svg$|\.ico$|\.woff2?$|\.ttf$/,
];

const MAX_FILES = 2000;

export async function fetchRepoTree(
  owner: string,
  name: string,
): Promise<RepoFetchResult> {
  const repoRes = await fetch(`${GITHUB_API}/repos/${owner}/${name}`);
  if (!repoRes.ok) {
    if (repoRes.status === 404) {
      throw new Error(
        `Repo ${owner}/${name} not found (or private — unauthenticated access only)`,
      );
    }
    if (repoRes.status === 403) {
      throw new Error("GitHub API rate limit exceeded — try again later");
    }
    throw new Error(`GitHub API error: ${repoRes.status}`);
  }
  const repoData = (await repoRes.json()) as GitHubRepoResponse;
  const defaultBranch = repoData.default_branch;
  const description = repoData.description;

  const branchRes = await fetch(
    `${GITHUB_API}/repos/${owner}/${name}/branches/${defaultBranch}`,
  );
  if (!branchRes.ok) {
    throw new Error(`Failed to fetch branch info: ${branchRes.status}`);
  }
  const branchData = (await branchRes.json()) as GitHubBranchResponse;
  const sha = branchData.commit.sha;

  const treeRes = await fetch(
    `${GITHUB_API}/repos/${owner}/${name}/git/trees/${sha}?recursive=1`,
  );
  if (!treeRes.ok) {
    throw new Error(`Failed to fetch tree: ${treeRes.status}`);
  }
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
