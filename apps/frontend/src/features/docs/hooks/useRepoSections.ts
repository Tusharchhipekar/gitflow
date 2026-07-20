import { useQuery } from "@tanstack/react-query";
import { fetchRepoSections } from "../api";

export function useRepoSections(repoId: number) {
  return useQuery({
    queryKey: ["repo-sections", repoId],
    queryFn: () => fetchRepoSections(repoId),
    enabled: Number.isInteger(repoId),
    refetchInterval: (query) => {
      const status = query.state.data?.repo.status;
      return status === "ready" || status === "failed" ? false : 3000;
    },
  });
}
