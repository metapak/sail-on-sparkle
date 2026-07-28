/**
 * Backward-compatible facade around the query + mutation hook layer for the
 * keyword research workspace. Exposes the same interface the page previously
 * consumed from `useResearchStore` (results, context, overrides, comparison
 * tray, saved lists, history) but reads/writes go through typed hooks.
 */
import * as React from "react";
import { useKeywordResearch } from "./use-keyword-research";
import { useResearchLists, useResearchHistory } from "./use-research-catalog";
import {
  useResearchToggleFavorite,
  useResearchSetTracking,
  useResearchSetMetadata,
  useCreateResearchList,
  useAddToResearchList,
  useRemoveFromResearchList,
  useRenameResearchList,
  useDeleteResearchList,
  usePushResearchHistory,
  useRemoveResearchHistory,
} from "@/hooks/mutations/use-research-mutations";
import { useAnalysisScope, useScopeIdentityEffect } from "@/scope";
import type {
  KeywordResearchRequest,
  ResearchIntent,
  KeywordResearchRow,
  MetadataStatus,
  ResearchHistoryEntry,
  SavedResearchList,
  TrackingStatus,
} from "@/services/keywords/keywords.types";

export const COMPARISON_LIMIT = 5;

export interface ResearchWorkspace {
  results: KeywordResearchRow[];
  /** Research intent only — the analysis scope lives in the global provider. */
  intent: ResearchIntent | null;
  /** Intent resolved against the current scope (what the service receives). */
  context: KeywordResearchRequest | null;
  isLoading: boolean;
  runQuery: (intent: ResearchIntent) => void;
  clear: () => void;

  toggleFavorite: (id: string) => void;
  setTracking: (ids: string[], value: TrackingStatus) => void;
  setMetadata: (ids: string[], value: MetadataStatus) => void;

  comparison: string[];
  toggleCompare: (id: string) => void;
  clearCompare: () => void;

  lists: SavedResearchList[];
  createList: (name: string, keywordIds: string[]) => Promise<SavedResearchList>;
  addToList: (listId: string, keywordIds: string[]) => void;
  removeFromList: (listId: string, keywordIds: string[]) => void;
  renameList: (listId: string, name: string) => void;
  deleteList: (listId: string) => void;

  history: ResearchHistoryEntry[];
  removeHistory: (id: string) => void;
}

export function useResearchWorkspace(): ResearchWorkspace {
  const [intent, setIntent] = React.useState<ResearchIntent | null>(null);
  const [comparison, setComparison] = React.useState<string[]>([]);
  const { scopedRequest } = useAnalysisScope();
  const context: KeywordResearchRequest | null = intent ? { ...intent, ...scopedRequest } : null;

  // A scope switch invalidates the previous result set's selection state.
  useScopeIdentityEffect(() => setComparison([]));

  const research = useKeywordResearch(intent);
  const listsQ = useResearchLists();
  const historyQ = useResearchHistory();

  const favMut = useResearchToggleFavorite();
  const trackMut = useResearchSetTracking();
  const metaMut = useResearchSetMetadata();

  const createListMut = useCreateResearchList();
  const addToListMut = useAddToResearchList();
  const removeFromListMut = useRemoveFromResearchList();
  const renameListMut = useRenameResearchList();
  const deleteListMut = useDeleteResearchList();

  const pushHistoryMut = usePushResearchHistory();
  const removeHistoryMut = useRemoveResearchHistory();

  const results = research.data ?? [];
  const lists = listsQ.data ?? [];
  const history = historyQ.data ?? [];

  const runQuery = React.useCallback(
    (next: ResearchIntent) => {
      setIntent(next);
      // Fire-and-forget history push; results resolve via useQuery cache.
      const entry: ResearchHistoryEntry = {
        id: `${Date.now()}`,
        context: { ...next, ...scopedRequest },
        resultCount: 0,
        timestamp: Date.now(),
      };
      pushHistoryMut.mutate(entry);
    },
    [pushHistoryMut, scopedRequest],
  );

  const clear = React.useCallback(() => {
    setIntent(null);
    setComparison([]);
  }, []);

  const toggleFavorite = React.useCallback(
    (id: string) => {
      const current = results.find((r) => r.id === id)?.favoriteStatus ?? false;
      favMut.mutate({ id, value: !current });
    },
    [results, favMut],
  );

  const setTracking = React.useCallback(
    (ids: string[], value: TrackingStatus) => trackMut.mutate({ ids, value }),
    [trackMut],
  );
  const setMetadata = React.useCallback(
    (ids: string[], value: MetadataStatus) => metaMut.mutate({ ids, value }),
    [metaMut],
  );

  const toggleCompare = React.useCallback((id: string) => {
    setComparison((c) => {
      if (c.includes(id)) return c.filter((x) => x !== id);
      if (c.length >= COMPARISON_LIMIT) return c;
      return [...c, id];
    });
  }, []);
  const clearCompare = React.useCallback(() => setComparison([]), []);

  const createList = React.useCallback(
    (name: string, keywordIds: string[]) => createListMut.mutateAsync({ name, keywordIds }),
    [createListMut],
  );
  const addToList = React.useCallback(
    (listId: string, keywordIds: string[]) => addToListMut.mutate({ listId, keywordIds }),
    [addToListMut],
  );
  const removeFromList = React.useCallback(
    (listId: string, keywordIds: string[]) => removeFromListMut.mutate({ listId, keywordIds }),
    [removeFromListMut],
  );
  const renameList = React.useCallback(
    (listId: string, name: string) => renameListMut.mutate({ listId, name }),
    [renameListMut],
  );
  const deleteList = React.useCallback(
    (listId: string) => deleteListMut.mutate(listId),
    [deleteListMut],
  );

  const removeHistory = React.useCallback(
    (id: string) => removeHistoryMut.mutate(id),
    [removeHistoryMut],
  );

  return {
    results,
    intent,
    context,
    isLoading: research.isLoading,
    runQuery,
    clear,
    toggleFavorite,
    setTracking,
    setMetadata,
    comparison,
    toggleCompare,
    clearCompare,
    lists,
    createList,
    addToList,
    removeFromList,
    renameList,
    deleteList,
    history,
    removeHistory,
  };
}

/** Re-exported so routes never import service types directly. */
export type { ResearchIntent };
