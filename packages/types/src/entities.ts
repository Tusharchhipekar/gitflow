export type IndexStatus =
  "pending" | "fetching" | "planning" | "generating" | "ready" | "failed";

export type User = {
  id: number;
  email: string;
  name: string;
};

export type Repo = {
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
};

export type Page = {
  id: number;
  slug: string;
  title: string;
  order: number;
  markdown: string;
  sourceFiles: string[];
};

export type Section = {
  id: number;
  title: string;
  order: number;
  pages: Page[];
};

export type RepoSectionsResponse = {
  repo: Pick<Repo, "id" | "owner" | "name" | "status">;
  sections: Section[];
};

export type PageDetail = Page & {
  section: { id: number; title: string };
  repo: { id: number; owner: string; name: string };
};

export type MessageRole = "user" | "assistant";

export type Message = {
  id: number;
  pageId: number;
  userId: number;
  role: MessageRole;
  content: string;
  createdAt: string;
};

export type SendMessageResponse = {
  id: number;
  role: "assistant";
  content: string;
  createdAt: string;
};

export type CredentialsSignupPayload = {
  name: string;
  email: string;
  password: string;
};
