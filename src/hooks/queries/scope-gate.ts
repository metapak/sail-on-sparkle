import type { Query } from "@tanstack/react-query";
import type { AnalysisScopeKey } from "@/scope/types";

function keyContainsScope(queryKey: readonly unknown[], scopeSignature: string): boolean {
  return queryKey.some(
    (part) => Array.isArray(part) && part.length === 5 && part.join("|") === scopeSignature,
  );
}

/**
 * Placeholder resolver that keeps the previous result ONLY while the analysis
 * scope is unchanged (same normalized scope key inside the query key).
 *
 * Same-scope pagination / sorting / filtering keeps its flicker-free behavior;
 * a scope change drops previous rows instead of showing another market's data
 * under the new selectors.
 */
export function sameScopePlaceholder<T>(scopeKey: AnalysisScopeKey) {
  const signature = scopeKey.join("|");
  return (
    prev: T | undefined,
    prevQuery: Query<T, Error, T, readonly unknown[]> | undefined,
  ): T | undefined => {
    if (!prev || !prevQuery) return undefined;
    return keyContainsScope(prevQuery.queryKey, signature) ? prev : undefined;
  };
}
