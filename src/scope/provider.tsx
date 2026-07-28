/**
 * THE single application-wide analysis-scope provider.
 *
 * Mounted exactly once, at the authenticated dashboard shell. Never create a
 * per-route or per-feature scope provider — consume `useAnalysisScope()`.
 *
 * Initialization precedence: valid URL search params → last valid persisted
 * scope → product defaults. The URL is the runtime source of truth, so browser
 * back/forward restores previous selections and refresh/deep links work.
 */
import * as React from "react";
import { useRouter, useRouterState, useSearch } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import {
  applyScopePatch,
  dateRangeKey,
  parseScopeSearch,
  resolveScope,
  scopeIdentityKey,
  scopeKey,
  scopeSearchEquals,
  toScopeSearch,
  toScopedRequest,
} from "./resolver";
import { readPersistedScope, writePersistedScope } from "./storage";
import type {
  AnalysisDateRange,
  AnalysisScope,
  AnalysisScopeKey,
  AnalysisScopePatch,
  ScopedRequest,
  StoreId,
} from "./types";

export interface AnalysisScopeApi {
  scope: AnalysisScope;
  scopeKey: AnalysisScopeKey;
  /** Stable string identity (application|store|country|marketLocale). */
  scopeIdentity: string;
  /** Explicit typed request handed to services. */
  scopedRequest: ScopedRequest;
  isScopeReady: boolean;
  setApplication: (applicationId: string) => void;
  setStore: (store: StoreId) => void;
  setCountry: (countryCode: string) => void;
  setDateRange: (range: Partial<AnalysisDateRange>) => void;
  replaceScope: (patch: AnalysisScopePatch) => void;
  resetScope: () => void;
}

const AnalysisScopeContext = React.createContext<AnalysisScopeApi | null>(null);

export function AnalysisScopeProvider({ children }: { children: React.ReactNode }) {
  const search = useSearch({ from: "/dashboard" });
  const router = useRouter();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  /**
   * Scope owns the entire dashboard search contract, so writes replace the
   * search object wholesale while staying on the current pathname.
   */
  const navigate = React.useCallback(
    (next: ReturnType<typeof toScopeSearch>, replace = false) => {
      void router.navigate({ to: pathname, search: next, replace });
    },
    [router, pathname],
  );
  const queryClient = useQueryClient();

  /** Stable "now" so preset ranges never drift between renders. */
  const nowRef = React.useRef(new Date());
  /** Persisted fallback, applied only after mount (hydration-safe). */
  const [persisted, setPersisted] = React.useState<ReturnType<typeof readPersistedScope>>(null);
  const [isScopeReady, setIsScopeReady] = React.useState(false);

  const urlPatch = React.useMemo(() => parseScopeSearch(search), [search]);

  const scope = React.useMemo(
    () => resolveScope({ ...(persisted ?? {}), ...urlPatch }, nowRef.current),
    [persisted, urlPatch],
  );

  const key = React.useMemo(() => scopeKey(scope), [scope]);
  const identity = React.useMemo(() => scopeIdentityKey(scope).join("|"), [scope]);
  const scopedRequest = React.useMemo(() => toScopedRequest(scope), [scope]);

  /* --- Step 1: hydrate persisted scope when the URL carries no scope --- */
  React.useEffect(() => {
    const hasUrlScope = Object.keys(urlPatch).length > 0;
    if (!hasUrlScope) {
      const stored = readPersistedScope();
      if (stored) setPersisted(stored);
    }
    setIsScopeReady(true);
    // Run once on mount — later reads go through the URL.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* --- Step 2: normalize the URL (replacement, no history entry) --- */
  React.useEffect(() => {
    if (!isScopeReady) return;
    const desired = toScopeSearch(scope);
    const current = {
      app: search.app,
      store: search.store,
      country: search.country,
      range: search.range,
      from: search.from,
      to: search.to,
    };
    if (scopeSearchEquals(desired, current)) return;
    // Scope owns the whole dashboard search contract, so an object write is safe
    // and keeps the current pathname (no `to` = stay on the active route).
    navigate(desired, true);
  }, [isScopeReady, scope, search, navigate]);

  /* --- Step 3: persist valid normalized scope --- */
  React.useEffect(() => {
    if (!isScopeReady) return;
    writePersistedScope(scope);
  }, [isScopeReady, scope]);

  /* --- Step 4: cancel obsolete in-flight requests on identity change --- */
  const prevIdentity = React.useRef(identity);
  React.useEffect(() => {
    if (prevIdentity.current === identity) return;
    prevIdentity.current = identity;
    void queryClient.cancelQueries();
  }, [identity, queryClient]);

  const commit = React.useCallback(
    (patch: AnalysisScopePatch) => {
      const next = applyScopePatch(scope, patch, nowRef.current);
      const desired = toScopeSearch(next);
      // One atomic navigation → one render with a fully valid scope.
      navigate(desired);
    },
    [navigate, scope],
  );

  const api = React.useMemo<AnalysisScopeApi>(
    () => ({
      scope,
      scopeKey: key,
      scopeIdentity: identity,
      scopedRequest,
      isScopeReady,
      setApplication: (applicationId) => commit({ applicationId }),
      setStore: (store) => commit({ store }),
      setCountry: (countryCode) => commit({ countryCode }),
      setDateRange: (range) => commit({ dateRange: range }),
      replaceScope: (patch) => commit(patch),
      resetScope: () => {
        const next = resolveScope({}, nowRef.current);
        navigate(toScopeSearch(next));
      },
    }),
    [scope, key, identity, scopedRequest, isScopeReady, commit, navigate],
  );

  return <AnalysisScopeContext.Provider value={api}>{children}</AnalysisScopeContext.Provider>;
}

export function useAnalysisScope(): AnalysisScopeApi {
  const ctx = React.useContext(AnalysisScopeContext);
  if (!ctx) {
    throw new Error("useAnalysisScope must be used inside <AnalysisScopeProvider>");
  }
  return ctx;
}

/**
 * Runs `onChange` whenever the scope *identity* (application/store/country/
 * market locale) changes. Use it to reset stale data state: pagination, row
 * selection, open drawers, comparison dialogs.
 */
export function useScopeIdentityEffect(onChange: () => void): void {
  const { scopeIdentity } = useAnalysisScope();
  const ref = React.useRef(scopeIdentity);
  const cb = React.useRef(onChange);
  cb.current = onChange;
  React.useEffect(() => {
    if (ref.current === scopeIdentity) return;
    ref.current = scopeIdentity;
    cb.current();
  }, [scopeIdentity]);
}

/** Runs `onChange` on any scope change, including the temporal date range. */
export function useScopeChangeEffect(onChange: () => void): void {
  const { scope } = useAnalysisScope();
  const token = `${scopeIdentityKey(scope).join("|")}|${dateRangeKey(scope.dateRange)}`;
  const ref = React.useRef(token);
  const cb = React.useRef(onChange);
  cb.current = onChange;
  React.useEffect(() => {
    if (ref.current === token) return;
    ref.current = token;
    cb.current();
  }, [token]);
}
