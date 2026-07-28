import * as React from "react";
import { deriveKeywordRecords, extendKeyword } from "./data";
import type { KeywordRecord, TrackingFrequency } from "./types";
import type { Keyword } from "@/lib/dashboard-shared";

interface KeywordStore {
  records: KeywordRecord[];
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

/**
 * Centralized front-end state for keyword records.
 * Single source of truth — favorites/tracking/freshness never diverge across cells.
 */
export function useKeywordStore(initial?: Keyword[]): KeywordStore {
  const [records, setRecords] = React.useState<KeywordRecord[]>(() =>
    deriveKeywordRecords(initial),
  );

  const patch = React.useCallback((ids: string[], patcher: (r: KeywordRecord) => KeywordRecord) => {
    const set = new Set(ids);
    setRecords((rs) => rs.map((r) => (set.has(r.id) ? patcher(r) : r)));
  }, []);

  const toggleFavorite = React.useCallback(
    (id: string) => patch([id], (r) => ({ ...r, favorite: !r.favorite })),
    [patch],
  );
  const setFavorite = React.useCallback(
    (ids: string[], value: boolean) => patch(ids, (r) => ({ ...r, favorite: value })),
    [patch],
  );

  const toggleTracked = React.useCallback(
    (id: string) => patch([id], (r) => ({ ...r, tracked: !r.tracked })),
    [patch],
  );
  const setTracked = React.useCallback(
    (ids: string[], value: boolean) => patch(ids, (r) => ({ ...r, tracked: value })),
    [patch],
  );

  const setTrackingFrequency = React.useCallback(
    (id: string, freq: TrackingFrequency) =>
      patch([id], (r) => ({ ...r, trackingFrequency: freq })),
    [patch],
  );

  const addTagToMany = React.useCallback(
    (ids: string[], tag: string) =>
      patch(ids, (r) => (r.tags.includes(tag) ? r : { ...r, tags: [...r.tags, tag] })),
    [patch],
  );

  const setGroupForMany = React.useCallback(
    (ids: string[], group: string) => patch(ids, (r) => ({ ...r, group })),
    [patch],
  );

  const refreshingRef = React.useRef<Set<string>>(new Set());
  const refreshMany = React.useCallback(
    async (ids: string[]) => {
      const eligible = ids.filter((id) => !refreshingRef.current.has(id));
      if (eligible.length === 0) return;
      eligible.forEach((id) => refreshingRef.current.add(id));
      patch(eligible, (r) => ({ ...r, isRefreshing: true }));
      await new Promise((res) => setTimeout(res, 1100));
      patch(eligible, (r) => ({ ...r, isRefreshing: false, updatedMinutesAgo: 1 }));
      eligible.forEach((id) => refreshingRef.current.delete(id));
    },
    [patch],
  );

  const addKeyword = React.useCallback((kw: string) => {
    const newKw: Keyword = {
      kw,
      rank: null,
      best: 200,
      change: 0,
      volume: 50,
      difficulty: 50,
      relevance: 70,
      opportunity: 55,
      status: "Uzun Vadeli",
      action: "Takip Et",
      appStrength: 60,
      tracked: true,
    };
    setRecords((rs) => [extendKeyword(newKw), ...rs]);
  }, []);

  const removeMany = React.useCallback((ids: string[]) => {
    const set = new Set(ids);
    setRecords((rs) => rs.filter((r) => !set.has(r.id)));
  }, []);

  return {
    records,
    toggleFavorite,
    setFavorite,
    toggleTracked,
    setTracked,
    setTrackingFrequency,
    addTagToMany,
    setGroupForMany,
    refreshMany,
    addKeyword,
    removeMany,
  };
}
