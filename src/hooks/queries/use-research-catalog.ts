import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/api/query-keys";
import { researchLists, researchHistory } from "@/services/keywords/keywords.service";

export function useResearchLists() {
  return useQuery({
    queryKey: queryKeys.keywords.researchLists(),
    queryFn: () => researchLists.list(),
    staleTime: Infinity,
    placeholderData: [],
  });
}

export function useResearchHistory() {
  return useQuery({
    queryKey: queryKeys.keywords.researchHistory(),
    queryFn: () => researchHistory.list(),
    staleTime: Infinity,
    placeholderData: [],
  });
}
