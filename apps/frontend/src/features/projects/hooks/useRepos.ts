import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { RepoInput } from "@repo/types";
import { fetchRepos, fetchRepo, createRepo, deleteRepo } from "../api";

export function useRepos() {
  return useQuery({
    queryKey: ["repos"],
    queryFn: fetchRepos,
  });
}

export function useRepo(id: number) {
  return useQuery({
    queryKey: ["repo", id],
    queryFn: () => fetchRepo(id),
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      return status === "ready" || status === "failed" ? false : 3000;
    },
  });
}

export function useCreateRepo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: RepoInput) => createRepo(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["repos"] });
    },
  });
}

export function useDeleteRepo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => deleteRepo(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["repos"] });
    },
  });
}
