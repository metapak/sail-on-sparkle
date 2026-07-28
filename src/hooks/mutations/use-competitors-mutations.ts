/**
 * Mutation hooks for the competitor-analysis workspace.
 *
 * Track/Untrack routes through the unified keyword mutation surface so the
 * tracked grid, research grid, and dashboard summary stay consistent. All
 * mutations invalidate the competitor family plus, when appropriate, the
 * tracked/research/dashboard families through the shared service layer.
 */
import { useMutation, useQueryClient, type QueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/api/query-keys";
import { competitorMutations } from "@/services/competitors/competitors.service";

function invalidateCompetitorFamily(qc: QueryClient) {
  qc.invalidateQueries({ queryKey: queryKeys.competitors.all });
}

function invalidateKeywordFamilies(qc: QueryClient) {
  qc.invalidateQueries({ queryKey: queryKeys.keywords.trackedRoot() });
  qc.invalidateQueries({ queryKey: queryKeys.keywords.researchRoot() });
  qc.invalidateQueries({ queryKey: queryKeys.dashboard.all });
}

export function useAddCompetitor() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => competitorMutations.add(id),
    onSettled: () => invalidateCompetitorFamily(qc),
  });
}

export function useRemoveCompetitor() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => competitorMutations.remove(id),
    onSettled: () => invalidateCompetitorFamily(qc),
  });
}

export function useTrackCompetitorKeyword() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (rowId: string) => competitorMutations.trackKeyword(rowId),
    onSettled: () => {
      invalidateCompetitorFamily(qc);
      invalidateKeywordFamilies(qc);
    },
  });
}

export function useUntrackCompetitorKeyword() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (rowId: string) => competitorMutations.untrackKeyword(rowId),
    onSettled: () => {
      invalidateCompetitorFamily(qc);
      invalidateKeywordFamilies(qc);
    },
  });
}
