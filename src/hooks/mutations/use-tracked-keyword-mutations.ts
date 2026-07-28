import { useMutation, useQueryClient, type QueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/api/query-keys";
import { trackedMutations } from "@/services/keywords/keywords.service";
import type { TrackedKeyword, TrackingFrequency } from "@/services/keywords/keywords.types";

/**
 * Shared invalidator — a tracked/untracked change affects every consumer of
 * keyword state (tracked-keywords grid, research grid, dashboard summary).
 * Only the affected query families are invalidated; UI-preference and
 * unrelated caches are left alone.
 */
function invalidateTrackedFamilies(qc: QueryClient) {
  qc.invalidateQueries({ queryKey: queryKeys.keywords.trackedRoot() });
  qc.invalidateQueries({ queryKey: queryKeys.keywords.researchRoot() });
  qc.invalidateQueries({ queryKey: queryKeys.dashboard.all });
}

function useInvalidator() {
  const qc = useQueryClient();
  return () => invalidateTrackedFamilies(qc);
}

function useOptimistic() {
  const qc = useQueryClient();
  return (updater: (prev: TrackedKeyword[]) => TrackedKeyword[]) => {
    qc.setQueryData<TrackedKeyword[]>(queryKeys.keywords.trackedRoot(), (prev) =>
      prev ? updater(prev) : prev,
    );
  };
}

export function useToggleFavoriteKeyword() {
  const invalidate = useInvalidator();
  const optimistic = useOptimistic();
  return useMutation({
    mutationFn: (id: string) => trackedMutations.toggleFavorite(id),
    onMutate: (id) => {
      optimistic((rows) => rows.map((r) => (r.id === id ? { ...r, favorite: !r.favorite } : r)));
    },
    onSettled: () => invalidate(),
  });
}

export function useSetFavoriteKeyword() {
  const invalidate = useInvalidator();
  const optimistic = useOptimistic();
  return useMutation({
    mutationFn: ({ ids, value }: { ids: string[]; value: boolean }) =>
      trackedMutations.setFavorite(ids, value),
    onMutate: ({ ids, value }) => {
      const set = new Set(ids);
      optimistic((rows) => rows.map((r) => (set.has(r.id) ? { ...r, favorite: value } : r)));
    },
    onSettled: () => invalidate(),
  });
}

export function useToggleTrackKeyword() {
  const invalidate = useInvalidator();
  const optimistic = useOptimistic();
  return useMutation({
    mutationFn: (id: string) => trackedMutations.toggleTracked(id),
    onMutate: (id) => {
      optimistic((rows) => rows.map((r) => (r.id === id ? { ...r, tracked: !r.tracked } : r)));
    },
    onSettled: () => invalidate(),
  });
}

/* ---- Canonical tracked/untracked mutation hooks ---- */

/** Track a single keyword by id. Invalidates tracked + research + dashboard. */
export function useTrackKeyword() {
  const invalidate = useInvalidator();
  const optimistic = useOptimistic();
  return useMutation({
    mutationFn: (id: string) => trackedMutations.setTracked([id], true),
    onMutate: (id) => {
      optimistic((rows) => rows.map((r) => (r.id === id ? { ...r, tracked: true } : r)));
    },
    onSettled: () => invalidate(),
  });
}

/** Untrack a single keyword by id. */
export function useUntrackKeyword() {
  const invalidate = useInvalidator();
  const optimistic = useOptimistic();
  return useMutation({
    mutationFn: (id: string) => trackedMutations.setTracked([id], false),
    onMutate: (id) => {
      optimistic((rows) => rows.map((r) => (r.id === id ? { ...r, tracked: false } : r)));
    },
    onSettled: () => invalidate(),
  });
}

/** Bulk-track a list of keyword ids. */
export function useBulkTrackKeywords() {
  const invalidate = useInvalidator();
  const optimistic = useOptimistic();
  return useMutation({
    mutationFn: (ids: string[]) => trackedMutations.setTracked(ids, true),
    onMutate: (ids) => {
      const set = new Set(ids);
      optimistic((rows) => rows.map((r) => (set.has(r.id) ? { ...r, tracked: true } : r)));
    },
    onSettled: () => invalidate(),
  });
}

/** Bulk-untrack a list of keyword ids. */
export function useBulkUntrackKeywords() {
  const invalidate = useInvalidator();
  const optimistic = useOptimistic();
  return useMutation({
    mutationFn: (ids: string[]) => trackedMutations.setTracked(ids, false),
    onMutate: (ids) => {
      const set = new Set(ids);
      optimistic((rows) => rows.map((r) => (set.has(r.id) ? { ...r, tracked: false } : r)));
    },
    onSettled: () => invalidate(),
  });
}

/**
 * Bulk set-tracked with an explicit value — retained for the workspace
 * facade so its `setTracked(ids, value)` API keeps working. Prefer the
 * dedicated `useBulkTrackKeywords` / `useBulkUntrackKeywords` hooks in new
 * call sites.
 */
export function useBulkSetTrackedKeywords() {
  const invalidate = useInvalidator();
  const optimistic = useOptimistic();
  return useMutation({
    mutationFn: ({ ids, value }: { ids: string[]; value: boolean }) =>
      trackedMutations.setTracked(ids, value),
    onMutate: ({ ids, value }) => {
      const set = new Set(ids);
      optimistic((rows) => rows.map((r) => (set.has(r.id) ? { ...r, tracked: value } : r)));
    },
    onSettled: () => invalidate(),
  });
}

export function useSetTrackingFrequency() {
  const invalidate = useInvalidator();
  const optimistic = useOptimistic();
  return useMutation({
    mutationFn: ({ id, freq }: { id: string; freq: TrackingFrequency }) =>
      trackedMutations.setTrackingFrequency(id, freq),
    onMutate: ({ id, freq }) => {
      optimistic((rows) => rows.map((r) => (r.id === id ? { ...r, trackingFrequency: freq } : r)));
    },
    onSettled: () => invalidate(),
  });
}

export function useAddTagToKeywords() {
  const invalidate = useInvalidator();
  const optimistic = useOptimistic();
  return useMutation({
    mutationFn: ({ ids, tag }: { ids: string[]; tag: string }) =>
      trackedMutations.addTagToMany(ids, tag),
    onMutate: ({ ids, tag }) => {
      const set = new Set(ids);
      optimistic((rows) =>
        rows.map((r) =>
          set.has(r.id) && !r.tags.includes(tag) ? { ...r, tags: [...r.tags, tag] } : r,
        ),
      );
    },
    onSettled: () => invalidate(),
  });
}

export function useSetGroupForKeywords() {
  const invalidate = useInvalidator();
  const optimistic = useOptimistic();
  return useMutation({
    mutationFn: ({ ids, group }: { ids: string[]; group: string }) =>
      trackedMutations.setGroupForMany(ids, group),
    onMutate: ({ ids, group }) => {
      const set = new Set(ids);
      optimistic((rows) => rows.map((r) => (set.has(r.id) ? { ...r, group } : r)));
    },
    onSettled: () => invalidate(),
  });
}

export function useRefreshKeywords() {
  const invalidate = useInvalidator();
  const optimistic = useOptimistic();
  return useMutation({
    mutationFn: (ids: string[]) => trackedMutations.refreshMany(ids),
    onMutate: (ids) => {
      const set = new Set(ids);
      optimistic((rows) => rows.map((r) => (set.has(r.id) ? { ...r, isRefreshing: true } : r)));
    },
    onSettled: () => invalidate(),
  });
}

export function useAddKeyword() {
  const invalidate = useInvalidator();
  return useMutation({
    mutationFn: (kw: string) => trackedMutations.addKeyword(kw),
    onSettled: () => invalidate(),
  });
}

export function useRemoveKeywords() {
  const invalidate = useInvalidator();
  const optimistic = useOptimistic();
  return useMutation({
    mutationFn: (ids: string[]) => trackedMutations.removeMany(ids),
    onMutate: (ids) => {
      const set = new Set(ids);
      optimistic((rows) => rows.filter((r) => !set.has(r.id)));
    },
    onSettled: () => invalidate(),
  });
}
