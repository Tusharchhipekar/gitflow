import { useQuery } from "@tanstack/react-query";
import { fetchPage } from "../api";

export function usePage(pageId: number) {
  return useQuery({
    queryKey: ["page", pageId],
    queryFn: () => fetchPage(pageId),
    enabled: Number.isInteger(pageId),
  });
}
