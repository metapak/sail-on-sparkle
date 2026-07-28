/**
 * Backward-compatible facade around the query + mutation hook layer for
 * the tracked-keyword workspace. Exposes the same interface the page
 * previously consumed from `useKeywordStore`, but every read goes through
 * TanStack Query and every write dispatches a typed mutation (with
 * optimistic cache updates).
 */
import * as React from "react";
import { useTrackedKeywordsAll } from "@/hooks/queries/use-tracked-keywords";
import {
  useToggleFavoriteKeyword,
  useSetFavoriteKeyword,
  useToggleTrackKeyword,
  useBulkSetTrackedKeywords,
  useSetTrackingFrequency,
  useAddTagToKeywords,
  useSetGroupForKeywords,
  useRefreshKeywords,
  useAddKeyword,
  useRemoveKeywords,
} from "@/hooks/mutations/use-tracked-keyword-mutations";
import type { TrackedKeyword, TrackingFrequency } from "@/services/keywords/keywords.types";

export interface TrackedKeywordsWorkspace {
  records: TrackedKeyword[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<unknown>;

  toggleFavorite: (id: string) => void;
  setFavorite: (ids: string[], value: boolean) => void;
  toggleTracked: (id: string) => void;
  setTracked: (ids: string[], value: boolean) => void;
  setTrackingFrequency: (id: string, freq: TrackingFrequency) => void;
  addTagToMany: (ids: string[], tag: string) => void;
  setGroupForMany: (ids: string[], group: string) => void;
  refreshMany: (ids: string[]) => Promise<void>;
  addKeyword: (kw: string) => void;
  removeMany: (ids: string[]) => void;
}

export function useTrackedKeywordsWorkspace(): TrackedKeywordsWorkspace {
  const q = useTrackedKeywordsAll();
  const toggleFav = useToggleFavoriteKeyword();
  const setFav = useSetFavoriteKeyword();
  const toggleTr = useToggleTrackKeyword();
  const bulkTr = useBulkSetTrackedKeywords();
  const setFreq = useSetTrackingFrequency();
  const addTag = useAddTagToKeywords();
  const setGroup = useSetGroupForKeywords();
  const refresh = useRefreshKeywords();
  const addKw = useAddKeyword();
  const removeKw = useRemoveKeywords();

  const records = q.data ?? [];

  const api = React.useMemo<TrackedKeywordsWorkspace>(
    () => ({
      records,
      isLoading: q.isLoading,
      error: q.error as Error | null,
      refetch: () => q.refetch(),
      toggleFavorite: (id) => toggleFav.mutate(id),
      setFavorite: (ids, value) => setFav.mutate({ ids, value }),
      toggleTracked: (id) => toggleTr.mutate(id),
      setTracked: (ids, value) => bulkTr.mutate({ ids, value }),
      setTrackingFrequency: (id, freq) => setFreq.mutate({ id, freq }),
      addTagToMany: (ids, tag) => addTag.mutate({ ids, tag }),
      setGroupForMany: (ids, group) => setGroup.mutate({ ids, group }),
      refreshMany: async (ids) => {
        await refresh.mutateAsync(ids);
      },
      addKeyword: (kw) => addKw.mutate(kw),
      removeMany: (ids) => removeKw.mutate(ids),
    }),
    [
      records,
      q,
      toggleFav,
      setFav,
      toggleTr,
      bulkTr,
      setFreq,
      addTag,
      setGroup,
      refresh,
      addKw,
      removeKw,
    ],
  );

  return api;
}
