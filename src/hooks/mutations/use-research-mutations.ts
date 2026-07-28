import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/api/query-keys";
import {
  researchMutations,
  researchLists,
  researchHistory,
} from "@/services/keywords/keywords.service";
import type {
  KeywordResearchRow,
  MetadataStatus,
  ResearchHistoryEntry,
  SavedResearchList,
  TrackingStatus,
} from "@/services/keywords/keywords.types";

/** Optimistically patch every cached research result set. */
function useResearchOptimistic() {
  const qc = useQueryClient();
  return (updater: (r: KeywordResearchRow) => KeywordResearchRow) => {
    qc.setQueriesData<KeywordResearchRow[]>(
      { queryKey: queryKeys.keywords.researchRoot() },
      (prev) => (prev ? prev.map(updater) : prev),
    );
  };
}

export function useResearchToggleFavorite() {
  const patch = useResearchOptimistic();
  return useMutation({
    mutationFn: ({ id, value }: { id: string; value: boolean }) =>
      researchMutations.setFavorite(id, value),
    onMutate: ({ id, value }) => {
      patch((r) => (r.id === id ? { ...r, favoriteStatus: value } : r));
    },
  });
}

export function useResearchSetTracking() {
  const qc = useQueryClient();
  const patch = useResearchOptimistic();
  return useMutation({
    mutationFn: ({ ids, value }: { ids: string[]; value: TrackingStatus }) =>
      researchMutations.setTracking(ids, value),
    onMutate: ({ ids, value }) => {
      const set = new Set(ids);
      patch((r) => (set.has(r.id) ? { ...r, trackingStatus: value } : r));
    },
    onSettled: () => {
      // Tracking flips affect the tracked-keyword grid and dashboard summary
      // in addition to the research result overlay.
      qc.invalidateQueries({ queryKey: queryKeys.keywords.trackedRoot() });
      qc.invalidateQueries({ queryKey: queryKeys.keywords.researchRoot() });
      qc.invalidateQueries({ queryKey: queryKeys.dashboard.all });
    },
  });
}

export function useResearchSetMetadata() {
  const patch = useResearchOptimistic();
  return useMutation({
    mutationFn: ({ ids, value }: { ids: string[]; value: MetadataStatus }) =>
      researchMutations.setMetadata(ids, value),
    onMutate: ({ ids, value }) => {
      const set = new Set(ids);
      patch((r) => (set.has(r.id) ? { ...r, metadataStatus: value } : r));
    },
  });
}

/* ---- saved lists ---- */

export function useCreateResearchList() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ name, keywordIds }: { name: string; keywordIds: string[] }) =>
      researchLists.create(name, keywordIds),
    onSuccess: (list) => {
      qc.setQueryData<SavedResearchList[]>(queryKeys.keywords.researchLists(), (prev) =>
        prev ? [list, ...prev] : [list],
      );
    },
  });
}

export function useAddToResearchList() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ listId, keywordIds }: { listId: string; keywordIds: string[] }) =>
      researchLists.add(listId, keywordIds),
    onSuccess: (next) => {
      qc.setQueryData(queryKeys.keywords.researchLists(), next);
    },
  });
}

export function useRemoveFromResearchList() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ listId, keywordIds }: { listId: string; keywordIds: string[] }) =>
      researchLists.remove(listId, keywordIds),
    onSuccess: (next) => qc.setQueryData(queryKeys.keywords.researchLists(), next),
  });
}

export function useRenameResearchList() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ listId, name }: { listId: string; name: string }) =>
      researchLists.rename(listId, name),
    onSuccess: (next) => qc.setQueryData(queryKeys.keywords.researchLists(), next),
  });
}

export function useDeleteResearchList() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (listId: string) => researchLists.del(listId),
    onSuccess: (next) => qc.setQueryData(queryKeys.keywords.researchLists(), next),
  });
}

/* ---- history ---- */

export function usePushResearchHistory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (entry: ResearchHistoryEntry) => researchHistory.push(entry),
    onSuccess: (next) => qc.setQueryData(queryKeys.keywords.researchHistory(), next),
  });
}

export function useRemoveResearchHistory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => researchHistory.remove(id),
    onSuccess: (next) => qc.setQueryData(queryKeys.keywords.researchHistory(), next),
  });
}
