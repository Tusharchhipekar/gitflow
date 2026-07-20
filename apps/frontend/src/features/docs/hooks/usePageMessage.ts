import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchMessages, sendMessage } from "../api";

export function useMessages(pageId: number) {
  return useQuery({
    queryKey: ["messages", pageId],
    queryFn: () => fetchMessages(pageId),
    enabled: Number.isInteger(pageId),
  });
}

export function useSendMessage(pageId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (content: string) => sendMessage(pageId, content),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["messages", pageId] });
    },
  });
}
