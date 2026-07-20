import { axiosInstance } from "@/shared/lib/api-client";
import type {
  RepoSectionsResponse,
  PageDetail,
  Message,
  SendMessageResponse,
} from "@repo/types";

export async function fetchRepoSections(
  repoId: number,
): Promise<RepoSectionsResponse> {
  const res = await axiosInstance.get(`/api/v1/repo/${repoId}/sections`);
  return res.data;
}

export async function fetchPage(pageId: number): Promise<PageDetail> {
  const res = await axiosInstance.get(`/api/v1/page/${pageId}`);
  return res.data;
}

export async function fetchMessages(pageId: number): Promise<Message[]> {
  const res = await axiosInstance.get(`/api/v1/page/${pageId}/messages`);
  return res.data;
}

export async function sendMessage(
  pageId: number,
  content: string,
): Promise<SendMessageResponse> {
  const res = await axiosInstance.post(`/api/v1/page/${pageId}/messages`, {
    content,
  });
  return res.data;
}
