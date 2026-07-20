export type IndexStatus =
  "pending" | "fetching" | "planning" | "generating" | "ready" | "failed";

export interface User {
  id: number;
  email: string;
  name: string;
}

export interface Repo {
  id: number;
  userId: number;
  owner: string;
  name: string;
  description: string | null;
  sha: string;
  fileCount: number;
  status: IndexStatus;
  truncated: boolean;
  indexedAt: string;
  createdAt: string;
}

export interface Page {
  id: number;
  slug: string;
  title: string;
  order: number;
  markdown: string;
  sourceFiles: string[];
}

export interface Section {
  id: number;
  title: string;
  order: number;
  pages: Page[];
}

export interface RepoSectionsResponse {
  repo: Pick<Repo, "id" | "owner" | "name" | "status">;
  sections: Section[];
}

export interface PageDetail extends Page {
  section: { id: number; title: string };
  repo: { id: number; owner: string; name: string };
}

export type MessageRole = "user" | "assistant";

export interface Message {
  id: number;
  pageId: number;
  userId: number;
  role: MessageRole;
  content: string;
  createdAt: string;
}

export interface SendMessageResponse {
  id: number;
  role: "assistant";
  content: string;
  createdAt: string;
}
