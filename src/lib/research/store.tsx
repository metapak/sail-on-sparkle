/**
 * Research state (candidates + overrides + comparison + saved lists + history).
 */
import * as React from "react";
import type {
  ResearchQueryContext,
  ResearchRecord,
  ResearchHistoryEntry,
  SavedResearchList,
  MetadataStatus,
  TrackingStatus,
} from "./types";
import { buildResearchResults, buildForApp, buildForCompetitors, buildForCategory } from "./data";
import { ResearchStorage } from "./views";

export const COMPARISON_LIMIT = 5;

export interface ResearchState {
  results: ResearchRecord[];
  context: ResearchQueryContext | null;
  runQuery: (ctx: ResearchQueryContext) => void;
  clear: () => void;

  /* per-record overrides */
  toggleFavorite: (id: string) => void;
  setTracking: (ids: string[], value: TrackingStatus) => void;
  setMetadata: (ids: string[], value: MetadataStatus) => void;

  /* comparison tray */
  comparison: string[];
  toggleCompare: (id: string) => void;
  clearCompare: () => void;

  /* saved lists */
  lists: SavedResearchList[];
  createList: (name: string, keywordIds: string[]) => SavedResearchList;
  addToList: (listId: string, keywordIds: string[]) => void;
  removeFromList: (listId: string, keywordIds: string[]) => void;
  renameList: (listId: string, name: string) => void;
  deleteList: (listId: string) => void;

  /* history */
  history: ResearchHistoryEntry[];
  removeHistory: (id: string) => void;
}

export function useResearchStore(): ResearchState {
  const [context, setContext] = React.useState<ResearchQueryContext | null>(null);
  const [baseResults, setBaseResults] = React.useState<ResearchRecord[]>([]);
  const [favorites, setFavorites] = React.useState<Record<string, boolean>>({});
  const [tracking, setTrackingState] = React.useState<Record<string, TrackingStatus>>({});
  const [metadata, setMetadataState] = React.useState<Record<string, MetadataStatus>>({});
  const [comparison, setComparison] = React.useState<string[]>([]);
  const [lists, setLists] = React.useState<SavedResearchList[]>([]);
  const [history, setHistory] = React.useState<ResearchHistoryEntry[]>([]);

  // Hydrate.
  React.useEffect(() => {
    setFavorites(ResearchStorage.readFavorites());
    setTrackingState(ResearchStorage.readTracking());
    setMetadataState(ResearchStorage.readMetadata());
    setLists(ResearchStorage.readLists<SavedResearchList>());
    setHistory(ResearchStorage.readHistory<ResearchHistoryEntry>());
  }, []);

  React.useEffect(() => {
    ResearchStorage.writeFavorites(favorites);
  }, [favorites]);
  React.useEffect(() => {
    ResearchStorage.writeTracking(tracking);
  }, [tracking]);
  React.useEffect(() => {
    ResearchStorage.writeMetadata(metadata);
  }, [metadata]);
  React.useEffect(() => {
    ResearchStorage.writeLists(lists);
  }, [lists]);
  React.useEffect(() => {
    ResearchStorage.writeHistory(history);
  }, [history]);

  const runQuery = React.useCallback((ctx: ResearchQueryContext) => {
    let out: ResearchRecord[] = [];
    if (ctx.method === "keyword") {
      out = buildResearchResults(ctx.seeds, ctx.sources);
    } else if (ctx.method === "app") {
      out = buildForApp(ctx.sources);
    } else if (ctx.method === "competitor") {
      out = buildForCompetitors(ctx.sources);
    } else if (ctx.method === "category") {
      out = buildForCategory(ctx.sources);
    }
    setBaseResults(out);
    setContext(ctx);

    const entry: ResearchHistoryEntry = {
      id: `${Date.now()}`,
      context: ctx,
      resultCount: out.length,
      timestamp: Date.now(),
    };
    setHistory((h) => [entry, ...h].slice(0, 25));
  }, []);

  const clear = React.useCallback(() => {
    setBaseResults([]);
    setContext(null);
    setComparison([]);
  }, []);

  // Merge overrides into base results.
  const results = React.useMemo<ResearchRecord[]>(() => {
    return baseResults.map((r) => ({
      ...r,
      favoriteStatus: favorites[r.id] ?? r.favoriteStatus,
      trackingStatus: tracking[r.id] ?? r.trackingStatus,
      metadataStatus: metadata[r.id] ?? r.metadataStatus,
    }));
  }, [baseResults, favorites, tracking, metadata]);

  const toggleFavorite = React.useCallback((id: string) => {
    setFavorites((f) => ({ ...f, [id]: !(f[id] ?? false) }));
  }, []);

  const setTracking = React.useCallback((ids: string[], value: TrackingStatus) => {
    setTrackingState((t) => {
      const next = { ...t };
      for (const id of ids) next[id] = value;
      return next;
    });
  }, []);

  const setMetadata = React.useCallback((ids: string[], value: MetadataStatus) => {
    setMetadataState((t) => {
      const next = { ...t };
      for (const id of ids) next[id] = value;
      return next;
    });
  }, []);

  const toggleCompare = React.useCallback((id: string) => {
    setComparison((c) => {
      if (c.includes(id)) return c.filter((x) => x !== id);
      if (c.length >= COMPARISON_LIMIT) return c;
      return [...c, id];
    });
  }, []);
  const clearCompare = React.useCallback(() => setComparison([]), []);

  const createList = React.useCallback((name: string, keywordIds: string[]) => {
    const list: SavedResearchList = {
      id: `list-${Date.now()}`,
      name,
      keywordIds: Array.from(new Set(keywordIds)),
      createdAt: Date.now(),
    };
    setLists((ls) => [list, ...ls]);
    return list;
  }, []);

  const addToList = React.useCallback((listId: string, keywordIds: string[]) => {
    setLists((ls) =>
      ls.map((l) =>
        l.id === listId
          ? { ...l, keywordIds: Array.from(new Set([...l.keywordIds, ...keywordIds])) }
          : l,
      ),
    );
  }, []);

  const removeFromList = React.useCallback((listId: string, keywordIds: string[]) => {
    const kill = new Set(keywordIds);
    setLists((ls) =>
      ls.map((l) =>
        l.id === listId ? { ...l, keywordIds: l.keywordIds.filter((k) => !kill.has(k)) } : l,
      ),
    );
  }, []);

  const renameList = React.useCallback((listId: string, name: string) => {
    setLists((ls) => ls.map((l) => (l.id === listId ? { ...l, name } : l)));
  }, []);

  const deleteList = React.useCallback((listId: string) => {
    setLists((ls) => ls.filter((l) => l.id !== listId));
  }, []);

  const removeHistory = React.useCallback((id: string) => {
    setHistory((h) => h.filter((x) => x.id !== id));
  }, []);

  return {
    results,
    context,
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
