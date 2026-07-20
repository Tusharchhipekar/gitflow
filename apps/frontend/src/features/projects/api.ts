import { axiosInstance } from "@/shared/lib/api-client";
import type { Repo, RepoInput } from "@repo/types";

export async function createRepo(payload: RepoInput): Promise<Repo> {
  const res = await axiosInstance.post("/api/v1/repo/create", payload);
  return res.data;
}

export async function fetchRepos(): Promise<Repo[]> {
  const res = await axiosInstance.get("/api/v1/repo/list");
  return res.data;
}

export async function fetchRepo(id: number): Promise<Repo> {
  const res = await axiosInstance.get(`/api/v1/repo/${id}`);
  return res.data;
}
export async function deleteRepo(id: number): Promise<void> {
  await axiosInstance.delete(`/api/v1/repo/${id}`);
}
