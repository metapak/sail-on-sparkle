import * as React from "react";
import type { ColumnSizingState, VisibilityState } from "@tanstack/react-table";
import { KeywordStorage, type ViewSnapshot } from "@/lib/keywords/views";
import type { Density, SavedView } from "@/components/shared";

/**
 * Central hook for tracked-keyword view preferences (density, column
 * visibility, saved views, default view). Encapsulates `KeywordStorage`
 * localStorage access so pages never touch it directly. Hydrates AFTER
 * mount to avoid SSR/CSR mismatches.
 */
export interface TrackedViewPreferences {
  density: Density;
  setDensity: React.Dispatch<React.SetStateAction<Density>>;
  visibility: VisibilityState;
  setVisibility: React.Dispatch<React.SetStateAction<VisibilityState>>;
  columnSizing: ColumnSizingState;
  setColumnSizing: React.Dispatch<React.SetStateAction<ColumnSizingState>>;
  savedViews: SavedView<ViewSnapshot>[];
  setSavedViews: React.Dispatch<React.SetStateAction<SavedView<ViewSnapshot>[]>>;
  defaultViewId: string | null;
  setDefaultViewId: (id: string | null) => void;
  /** Resolved once after hydration if a persisted default view exists. */
  initialDefault: SavedView<ViewSnapshot> | null;
}

export function useTrackedViewPreferences(
  defaultVisibility: VisibilityState,
): TrackedViewPreferences {
  const [density, setDensity] = React.useState<Density>("standard");
  const [visibility, setVisibility] = React.useState<VisibilityState>(defaultVisibility);
  const [columnSizing, setColumnSizing] = React.useState<ColumnSizingState>({});
  const [savedViews, setSavedViews] = React.useState<SavedView<ViewSnapshot>[]>([]);
  const [defaultViewId, setDefaultViewIdState] = React.useState<string | null>(null);
  const [initialDefault, setInitialDefault] = React.useState<SavedView<ViewSnapshot> | null>(null);

  // Hydrate AFTER mount to avoid SSR mismatch.
  React.useEffect(() => {
    const d = KeywordStorage.readDensity();
    if (d) setDensity(d);
    const v = KeywordStorage.readVisibility();
    if (v) setVisibility((prev) => ({ ...prev, ...v }));
    const sizing = KeywordStorage.readSizing();
    if (sizing) setColumnSizing(sizing);
    const views = KeywordStorage.readViews<SavedView<ViewSnapshot>>();
    if (views.length) setSavedViews(views);
    const defId = KeywordStorage.readDefaultView();
    setDefaultViewIdState(defId);
    if (defId && views.length) {
      const def = views.find((x) => x.id === defId);
      if (def) setInitialDefault(def);
    }
  }, []);

  React.useEffect(() => {
    KeywordStorage.writeDensity(density);
  }, [density]);
  React.useEffect(() => {
    KeywordStorage.writeVisibility(visibility);
  }, [visibility]);
  React.useEffect(() => {
    KeywordStorage.writeSizing(columnSizing);
  }, [columnSizing]);
  React.useEffect(() => {
    KeywordStorage.writeViews(savedViews);
  }, [savedViews]);

  const setDefaultViewId = React.useCallback((id: string | null) => {
    setDefaultViewIdState(id);
    KeywordStorage.writeDefaultView(id);
  }, []);

  return {
    density,
    setDensity,
    visibility,
    setVisibility,
    columnSizing,
    setColumnSizing,
    savedViews,
    setSavedViews,
    defaultViewId,
    setDefaultViewId,
    initialDefault,
  };
}
