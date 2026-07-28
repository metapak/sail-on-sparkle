import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/api/query-keys";
import {
  getResearchSources,
  getDefaultResearchSources,
  getResearchSourceMap,
} from "@/services/keywords/keywords.service";

/** Sources catalog (static in mock; loadable in future backend). */
export function useResearchSources() {
  return useQuery({
    queryKey: queryKeys.keywords.researchSources(),
    queryFn: async () => ({
      sources: getResearchSources(),
      defaults: getDefaultResearchSources(),
      map: getResearchSourceMap(),
    }),
    staleTime: Infinity,
  });
}
