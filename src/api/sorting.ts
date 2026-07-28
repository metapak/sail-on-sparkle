/**
 * Shared, backend-shaped sorting helper for the mock services.
 *
 * Table columns are identified by column id, which is NOT always the record
 * field name (e.g. the research table's `kw` column reads `keyword`). Every
 * list endpoint therefore declares an explicit column-id → value accessor map
 * so ascending/descending toggles behave identically everywhere.
 */

export type SortAccessorMap<T> = Record<string, (row: T) => unknown>;

export interface SortSpec {
  id: string;
  desc?: boolean;
}

const collator = new Intl.Collator("tr-TR", { sensitivity: "base", numeric: true });

export function sortRows<T>(
  items: T[],
  sort: SortSpec | undefined,
  accessors: SortAccessorMap<T>,
): T[] {
  if (!sort) return items;
  const read = accessors[sort.id];
  if (!read) return items;
  const dir = sort.desc ? -1 : 1;
  // Decorate-sort-undecorate keeps the order stable for equal values.
  return items
    .map((row, index) => ({ row, index }))
    .sort((a, b) => {
      const av = read(a.row);
      const bv = read(b.row);
      const aNil = av == null || av === "";
      const bNil = bv == null || bv === "";
      // Missing values always sink to the bottom, in both directions.
      if (aNil && bNil) return a.index - b.index;
      if (aNil) return 1;
      if (bNil) return -1;
      if (typeof av === "boolean" || typeof bv === "boolean") {
        const cmp = Number(Boolean(av)) - Number(Boolean(bv));
        return cmp !== 0 ? cmp * dir : a.index - b.index;
      }
      if (typeof av === "number" && typeof bv === "number") {
        const cmp = av - bv;
        return cmp !== 0 ? cmp * dir : a.index - b.index;
      }
      const cmp = collator.compare(String(av), String(bv));
      return cmp !== 0 ? cmp * dir : a.index - b.index;
    })
    .map((d) => d.row);
}
