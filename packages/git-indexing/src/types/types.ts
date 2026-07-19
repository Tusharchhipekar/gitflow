export type GitHubTreeEntry = {
  path: string;
  type: "blob" | "tree";
  sha: string;
};

export type RepoFetchResult = {
  sha: string;
  description: string | null;
  files: string[];
  fileCount: number;
  truncated: boolean;
};

export type GitHubRepoResponse = {
  default_branch: string;
  description: string | null;
};

export type GitHubBranchResponse = {
  commit: { sha: string };
};

export type GitHubTreeResponse = {
  tree: GitHubTreeEntry[];
  truncated: boolean;
};
