import * as React from "react";
import { flexRender, type Table, type Row, type Header, type Column } from "@tanstack/react-table";
import { cn } from "@/lib/utils";
import {
  DENSITY_CELL_CLASS,
  DENSITY_ROW_CLASS,
  DENSITY_HEADER_HEIGHT,
  type Density,
  type SonarColumnMeta,
} from "./types";
import {
  TABLE_SURFACE,
  TABLE_RESIZE,
  TABLE_LAYOUT,
  COMPACT_LAYOUT,
  compactEffectiveWidth,
} from "@/components/shared/table-presets";
import { DataGridBulkActionBar, type BulkAction } from "./DataGridBulkActionBar";
import { DataGridEmptyState } from "./DataGridEmptyState";
import { DataGridLoadingState } from "./DataGridLoadingState";

/**
 * ONE selector describing every interactive descendant that must never bubble
 * up into the row-open action. Children may still stopPropagation, but the
 * guard no longer depends on it.
 */
export const ROW_NOCLICK_SELECTOR = [
  "button",
  "a",
  "input",
  "select",
  "textarea",
  "label",
  "[role='button']",
  "[role='menuitem']",
  "[role='checkbox']",
  "[role='switch']",
  "[role='combobox']",
  "[data-row-noclick='true']",
].join(", ");

interface SonarDataGridProps<T> {
  table: Table<T>;
  density?: Density;
  onRowClick?: (row: T) => void;
  isRowActive?: (row: T) => boolean;
  isLoading?: boolean;
  loadingRowCount?: number;
  emptyTitle?: string;
  emptyDescription?: string;
  emptyActions?: React.ReactNode;
  className?: string;
  maxHeight?: string;
  /** Called when a header is dropped onto another header (kept for API compat; unused by default). */
  enableReorder?: boolean;
  onReorder?: (draggedColumnId: string, targetColumnId: string) => void;
  /** Commit width to TanStack sizing state on pointer release. */
  onColumnWidthCommit?: (columnId: string, width: number) => void;
  /**
   * Selection actions. The table shell owns the placement (integrated row
   * under the data viewport); routes only provide the action definitions.
   */
  bulkSelection?: {
    count: number;
    itemNoun?: string;
    primary: BulkAction[];
    more?: BulkAction[];
    onClear: () => void;
  };
}

/** CSS-variable name for a column's effective width. */
const cssVarFor = (id: string) => `--rc-${id.replace(/[^a-zA-Z0-9_-]/g, "_")}`;

/**
 * Resizable business columns must not carry an artificial ceiling: a manual
 * drag is bounded only by the column's safety minimum. Utility columns keep
 * their own explicit `maxSize` from the shared presets.
 */
const UNBOUNDED_MAX_SIZE = Number.MAX_SAFE_INTEGER;

function clampWidth(width: number, min: number, max: number) {
  return Math.max(min, Math.min(max, Math.round(width)));
}

interface ResizeSession {
  id: string;
  pointerId: number;
  target: HTMLElement;
  startClientX: number;
  startWidth: number;
  startGuideX: number;
  startScrollLeft: number;
  min: number;
  max: number;
  direction: "ltr" | "rtl";
  latestClientX: number;
  targetWidth: number;
  frame: number | null;
  done: boolean;
  cleanup: (() => void) | null;
}

export function SonarDataGrid<T>({
  table,
  density = "standard",
  onRowClick,
  isRowActive,
  isLoading,
  loadingRowCount = 8,
  emptyTitle,
  emptyDescription,
  emptyActions,
  className,
  maxHeight,
  onColumnWidthCommit,
  bulkSelection,
}: SonarDataGridProps<T>) {
  const rowCellPad = DENSITY_CELL_CLASS[density];
  const rowHeight = DENSITY_ROW_CLASS[density];
  const rows = table.getRowModel().rows;

  const scrollRef = React.useRef<HTMLDivElement>(null);
  const tableRef = React.useRef<HTMLTableElement>(null);
  const [isResizing, setIsResizing] = React.useState(false);
  const resizingRef = React.useRef<ResizeSession | null>(null);

  const visibleLeaf = table.getVisibleLeafColumns();

  /**
   * Container width, tracked live. Leftover viewport space is granted only to
   * the columns a preset declares as `flex-data` (see table-presets) — never
   * to utility columns and never redistributed across every column, which is
   * what made the old adaptiveFill drift on resize.
   */
  const [containerWidth, setContainerWidth] = React.useState(0);
  React.useEffect(() => {
    const el = scrollRef.current;
    if (!el || typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(([entry]) => {
      setContainerWidth(Math.floor(entry.contentRect.width));
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  /* ---------- Base widths (committed) + resolved widths (base + flex) ---------- */
  /**
   * A column present in the controlled `columnSizing` state has been manually
   * sized by the user (or restored from persisted preferences). Its committed
   * width is authoritative and is therefore EXCLUDED from flex distribution —
   * otherwise the leftover-space allocation would immediately overwrite the
   * width the user just released, which is why keyword resizing appeared to
   * "snap back".
   */
  const manualSizing = table.getState().columnSizing;
  /**
   * Compact mode is decided by the MEASURED container width, so the same table
   * reacts to rotation, sidebar changes, narrower containers and zoom.
   */
  const isCompact = containerWidth > 0 && containerWidth < COMPACT_LAYOUT.containerBreakpoint;

  const layout = React.useMemo(() => {
    const base: Record<string, number> = {};
    for (const c of visibleLeaf) base[c.id] = c.getSize();
    const baseTotal = visibleLeaf.reduce((a, c) => a + base[c.id], 0);

    const resolved: Record<string, number> = { ...base };

    if (isCompact) {
      // Stored widths stay canonical in `base`; only the transient effective
      // width shrinks so the centre strip can show real metric columns.
      for (const c of visibleLeaf) {
        const meta = (c.columnDef.meta ?? {}) as SonarColumnMeta;
        resolved[c.id] = compactEffectiveWidth(
          meta.widthRole,
          meta.layoutRole,
          base[c.id],
          c.columnDef.minSize ?? 36,
        );
      }
    } else {
      const flexCols = visibleLeaf.filter(
        (c) =>
          ((c.columnDef.meta ?? {}) as SonarColumnMeta).layoutRole === "flex-data" &&
          manualSizing[c.id] === undefined,
      );
      const extraWidth = Math.max(0, containerWidth - baseTotal);
      if (extraWidth > 0 && flexCols.length > 0) {
        const weights = flexCols.map(
          (c) =>
            ((c.columnDef.meta ?? {}) as SonarColumnMeta).flexWeight ??
            TABLE_LAYOUT.defaultFlexWeight,
        );
        const weightSum = weights.reduce((a, w) => a + w, 0) || 1;
        let handed = 0;
        flexCols.forEach((c, i) => {
          const share =
            i === flexCols.length - 1
              ? extraWidth - handed
              : Math.floor((extraWidth * weights[i]) / weightSum);
          handed += share;
          resolved[c.id] = base[c.id] + share;
        });
      }
    }

    /* ---------- Responsive pinning policy ---------- */
    const pinnedById: Record<string, "left" | "right" | false> = {};
    for (const c of visibleLeaf) pinnedById[c.id] = c.getIsPinned() || false;

    if (isCompact) {
      const leftIds = visibleLeaf.filter((c) => pinnedById[c.id] === "left").map((c) => c.id);
      const rightIds = visibleLeaf.filter((c) => pinnedById[c.id] === "right").map((c) => c.id);
      const sum = (ids: string[]) => ids.reduce((a, id) => a + resolved[id], 0);
      const centre = () =>
        containerWidth -
        sum(leftIds.filter((id) => pinnedById[id] === "left")) -
        sum(rightIds.filter((id) => pinnedById[id] === "right"));
      // Release right pins first (actions), then left pins from the innermost
      // one, until one complete metric column fits in the centre viewport.
      for (
        let i = rightIds.length - 1;
        i >= 0 && centre() < COMPACT_LAYOUT.minCentreViewport;
        i--
      ) {
        pinnedById[rightIds[i]] = false;
      }
      for (let i = leftIds.length - 1; i >= 1 && centre() < COMPACT_LAYOUT.minCentreViewport; i--) {
        pinnedById[leftIds[i]] = false;
      }
    }

    /* ---------- Sticky offsets derived from EFFECTIVE widths ---------- */
    const startById: Record<string, number> = {};
    const endById: Record<string, number> = {};
    let acc = 0;
    for (const c of visibleLeaf) {
      if (pinnedById[c.id] === "left") {
        startById[c.id] = acc;
        acc += resolved[c.id];
      }
    }
    acc = 0;
    const rightPinned = visibleLeaf.filter((c) => pinnedById[c.id] === "right");
    for (let i = rightPinned.length - 1; i >= 0; i--) {
      const c = rightPinned[i];
      endById[c.id] = acc;
      acc += resolved[c.id];
    }

    const totalWidth = visibleLeaf.reduce((a, c) => a + resolved[c.id], 0);
    // Any leftover viewport space that no flexible column absorbed becomes an
    // inert filler column instead of stretching (and thereby deforming) the
    // committed column widths.
    const fillerWidth = Math.max(0, containerWidth - totalWidth);
    return {
      baseById: base,
      widthById: resolved,
      startById,
      endById,
      pinnedById,
      totalWidth,
      fillerWidth,
    };
  }, [visibleLeaf, containerWidth, manualSizing, isCompact]);

  /**
   * Frozen snapshot while a pointer resize is in flight: widths, flex
   * allocation and pinned offsets must not recalculate on pointermove.
   */
  const frozenLayoutRef = React.useRef<typeof layout | null>(null);
  const latestLayoutRef = React.useRef(layout);
  if (!isResizing) {
    frozenLayoutRef.current = null;
    latestLayoutRef.current = layout;
  }
  const activeLayout = isResizing ? (frozenLayoutRef.current ?? layout) : layout;
  const { widthById, startById, endById, pinnedById, totalWidth, fillerWidth } = activeLayout;

  const tableStyle = React.useMemo(() => {
    const style: React.CSSProperties = {
      width: totalWidth + fillerWidth,
      minWidth: totalWidth,
      tableLayout: "fixed",
    };
    for (const c of visibleLeaf) {
      (style as Record<string, string | number>)[cssVarFor(c.id)] = `${widthById[c.id]}px`;
    }
    return style;
  }, [totalWidth, fillerWidth, visibleLeaf, widthById]);

  /* ---------- Guide + badge refs ---------- */
  const guideRef = React.useRef<HTMLDivElement>(null);
  const badgeRef = React.useRef<HTMLDivElement>(null);

  const renderGuide = React.useCallback((width: number) => {
    const st = resizingRef.current;
    const scrollEl = scrollRef.current;
    if (!st || !scrollEl) return;
    const sign = st.direction === "rtl" ? -1 : 1;
    const x = st.startGuideX + (width - st.startWidth) * sign;
    if (guideRef.current) {
      guideRef.current.style.transform = `translate3d(${x}px, 0, 0)`;
      guideRef.current.style.display = "block";
    }
    if (badgeRef.current) {
      badgeRef.current.style.transform = `translate3d(${x + 6}px, 0, 0)`;
      badgeRef.current.textContent = `${Math.round(width)} px`;
      badgeRef.current.style.display = "block";
    }
    if (scrollEl.scrollLeft !== st.startScrollLeft) scrollEl.scrollLeft = st.startScrollLeft;
  }, []);

  const finishResize = React.useCallback(
    (ev?: PointerEvent) => {
      const st = resizingRef.current;
      if (!st || st.done) return;
      st.done = true;
      ev?.preventDefault();
      ev?.stopPropagation();
      if (ev) {
        const sign = st.direction === "rtl" ? -1 : 1;
        const delta = (ev.clientX - st.startClientX) * sign;
        st.targetWidth = clampWidth(st.startWidth + delta, st.min, st.max);
      }
      if (st.frame != null) cancelAnimationFrame(st.frame);
      try {
        if (st.target.hasPointerCapture(st.pointerId))
          st.target.releasePointerCapture(st.pointerId);
      } catch {
        /* ignore */
      }
      st.cleanup?.();
      const committedWidth = st.targetWidth;
      const columnId = st.id;
      const scrollEl = scrollRef.current;
      const scrollLeft = st.startScrollLeft;
      resizingRef.current = null;
      if (guideRef.current) guideRef.current.style.display = "none";
      if (badgeRef.current) badgeRef.current.style.display = "none";
      setIsResizing(false);
      if (onColumnWidthCommit) onColumnWidthCommit(columnId, committedWidth);
      else table.setColumnSizing((prev) => ({ ...prev, [columnId]: committedWidth }));
      if (scrollEl) {
        scrollEl.scrollLeft = scrollLeft;
        requestAnimationFrame(() => {
          scrollEl.scrollLeft = scrollLeft;
        });
      }
    },
    [onColumnWidthCommit, table],
  );

  const startResize = React.useCallback(
    (e: React.PointerEvent, column: Column<T, unknown>) => {
      e.stopPropagation();
      e.preventDefault();
      resizingRef.current?.cleanup?.();
      const target = e.currentTarget as HTMLElement;
      const rootEl = tableRef.current;
      const scrollEl = scrollRef.current;
      if (!rootEl || !scrollEl) return;
      const headerCell = rootEl.querySelector<HTMLElement>(
        `th[data-col-id="${CSS.escape(column.id)}"]`,
      );
      if (!headerCell) return;
      const direction = window.getComputedStyle(scrollEl).direction === "rtl" ? "rtl" : "ltr";
      const scrollRect = scrollEl.getBoundingClientRect();
      const headerRect = headerCell.getBoundingClientRect();
      const edgeClientX = direction === "rtl" ? headerRect.left : headerRect.right;
      const startGuideX = edgeClientX - scrollRect.left + scrollEl.scrollLeft;
      const maxRaw = column.columnDef.maxSize;
      const max =
        typeof maxRaw === "number" && Number.isFinite(maxRaw) ? maxRaw : UNBOUNDED_MAX_SIZE;
      const min = column.columnDef.minSize ?? 48;
      // Actual rendered width (base + any flex allocation) — starting the drag
      // from the committed base instead would snap a flexed column back to its
      // narrow base on the very first pointer move.
      const startWidth = widthById[column.id] ?? column.getSize();
      frozenLayoutRef.current = latestLayoutRef.current;

      const previousCursor = document.body.style.cursor;
      const previousUserSelect = document.body.style.userSelect;
      const previousDocCursor = document.documentElement.style.cursor;
      document.body.style.cursor = "col-resize";
      document.body.style.userSelect = "none";
      document.documentElement.style.cursor = "col-resize";

      const session: ResizeSession = {
        id: column.id,
        pointerId: e.pointerId,
        target,
        startClientX: e.clientX,
        startWidth,
        startGuideX,
        startScrollLeft: scrollEl.scrollLeft,
        min,
        max,
        direction,
        latestClientX: e.clientX,
        targetWidth: startWidth,
        frame: null,
        done: false,
        cleanup: null,
      };

      const schedule = () => {
        const st = resizingRef.current;
        if (!st || st.frame != null) return;
        st.frame = requestAnimationFrame(() => {
          const active = resizingRef.current;
          if (!active) return;
          active.frame = null;
          const sign = active.direction === "rtl" ? -1 : 1;
          const delta = (active.latestClientX - active.startClientX) * sign;
          active.targetWidth = clampWidth(active.startWidth + delta, active.min, active.max);
          renderGuide(active.targetWidth);
        });
      };

      const onMove = (ev: PointerEvent) => {
        const st = resizingRef.current;
        if (!st || ev.pointerId !== st.pointerId) return;
        ev.preventDefault();
        ev.stopPropagation();
        st.latestClientX = ev.clientX;
        if (scrollEl.scrollLeft !== st.startScrollLeft) scrollEl.scrollLeft = st.startScrollLeft;
        schedule();
      };
      const onUp = (ev: PointerEvent) => {
        const st = resizingRef.current;
        if (!st || ev.pointerId !== st.pointerId) return;
        finishResize(ev);
      };
      const cleanup = () => {
        target.removeEventListener("pointermove", onMove);
        target.removeEventListener("pointerup", onUp);
        target.removeEventListener("pointercancel", onUp);
        document.body.style.cursor = previousCursor;
        document.body.style.userSelect = previousUserSelect;
        document.documentElement.style.cursor = previousDocCursor;
      };
      session.cleanup = cleanup;
      resizingRef.current = session;
      try {
        target.setPointerCapture(e.pointerId);
      } catch {
        /* ignore */
      }
      target.addEventListener("pointermove", onMove);
      target.addEventListener("pointerup", onUp);
      target.addEventListener("pointercancel", onUp);
      setIsResizing(true);
      renderGuide(startWidth);
    },
    [finishResize, renderGuide, widthById],
  );

  React.useEffect(() => () => finishResize(), [finishResize]);

  /* Horizontal scroll affordance — edge fades reflecting real scroll state. */
  const [scrollEdges, setScrollEdges] = React.useState({ start: false, end: false });
  React.useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const update = () => {
      const max = el.scrollWidth - el.clientWidth;
      setScrollEdges({ start: el.scrollLeft > 2, end: max > 2 && el.scrollLeft < max - 2 });
    };
    update();
    el.addEventListener("scroll", update, { passive: true });
    return () => el.removeEventListener("scroll", update);
  }, [totalWidth, containerWidth, rows.length]);

  const handleRowClick = (e: React.MouseEvent<HTMLTableRowElement>, row: Row<T>) => {
    if (!onRowClick) return;
    const target = e.target as HTMLElement;
    if (target.closest(ROW_NOCLICK_SELECTOR)) return;
    onRowClick(row.original);
  };

  return (
    <div className="relative flex w-full min-w-0 flex-col">
      <div
        ref={scrollRef}
        className={cn(
          "sonar-scroll relative w-full overflow-auto",
          isResizing && "sonar-resizing select-none",
          className,
        )}
        style={maxHeight ? { maxHeight } : undefined}
      >
        <table
          ref={tableRef}
          className="border-separate border-spacing-0 text-sm"
          style={tableStyle}
        >
          <colgroup>
            {visibleLeaf.map((column) => (
              <col key={column.id} style={{ width: `var(${cssVarFor(column.id)})` }} />
            ))}
            {fillerWidth > 0 && <col aria-hidden="true" style={{ width: fillerWidth }} />}
          </colgroup>
          <thead className="sticky top-0 z-20">
            {table.getHeaderGroups().map((hg, groupIndex, groups) => {
              const isLeafRow = groupIndex === groups.length - 1;
              // A grouped header row with no visible grouped heading is an
              // empty band on phone-class containers — collapse it there.
              const hasGroupContent = hg.headers.some(
                (h) =>
                  h.subHeaders.length > 0 &&
                  !h.isPlaceholder &&
                  Boolean((h.column.columnDef.meta as SonarColumnMeta | undefined)?.label),
              );
              if (!isLeafRow && isCompact && !hasGroupContent) return null;
              return (
                <tr key={hg.id}>
                  {hg.headers.map((header) => {
                    const leaves = header.getLeafHeaders();
                    const firstLeafId = leaves[0]?.column.id ?? header.column.id;
                    const lastLeafId = leaves[leaves.length - 1]?.column.id ?? header.column.id;
                    return (
                      <HeaderCell
                        key={header.id}
                        header={header}
                        density={density}
                        isLeafRow={isLeafRow}
                        stickyLeft={startById[firstLeafId]}
                        stickyRight={endById[lastLeafId]}
                        pin={
                          pinnedById[firstLeafId] === "left"
                            ? "left"
                            : pinnedById[lastLeafId] === "right"
                              ? "right"
                              : false
                        }
                        onStartResize={startResize}
                        isResizingColumn={
                          isResizing && resizingRef.current?.id === header.column.id
                        }
                      />
                    );
                  })}
                  {fillerWidth > 0 && (
                    <th
                      aria-hidden="true"
                      className={cn(TABLE_SURFACE.headerBorder, TABLE_SURFACE.header)}
                    />
                  )}
                </tr>
              );
            })}
          </thead>

          <tbody>
            {isLoading ? (
              <DataGridLoadingState
                rowCount={loadingRowCount}
                columnCount={table.getVisibleFlatColumns().length}
                rowHeight={rowHeight}
                cellPad={rowCellPad}
              />
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan={table.getVisibleFlatColumns().length} className="p-0">
                  <DataGridEmptyState
                    title={emptyTitle ?? "Sonuç bulunamadı."}
                    description={emptyDescription}
                    actions={emptyActions}
                  />
                </td>
              </tr>
            ) : (
              rows.map((row) => {
                const active = isRowActive?.(row.original) ?? false;
                const selected = row.getIsSelected();
                return (
                  <tr
                    key={row.id}
                    onClick={(e) => handleRowClick(e, row)}
                    data-selected={selected || undefined}
                    data-active={active || undefined}
                    className={cn(
                      "sonar-row group",
                      TABLE_SURFACE.rowBorder,
                      onRowClick && "cursor-pointer",
                      !selected && !active && TABLE_SURFACE.rowHover,
                      active && !selected && "ring-1 ring-inset ring-[color:var(--cobalt)]/30",
                      rowHeight,
                    )}
                  >
                    {row.getVisibleCells().map((cell) => {
                      const meta = (cell.column.columnDef.meta ?? {}) as SonarColumnMeta;
                      const align = meta.align ?? "left";
                      const pin = pinnedById[cell.column.id] || false;
                      const pinStyle: React.CSSProperties =
                        pin === "left"
                          ? { position: "sticky", left: startById[cell.column.id] ?? 0, zIndex: 2 }
                          : pin === "right"
                            ? { position: "sticky", right: endById[cell.column.id] ?? 0, zIndex: 2 }
                            : {};
                      return (
                        <td
                          key={cell.id}
                          data-row-noclick={meta.interactive ? "true" : undefined}
                          data-pinned={pin || undefined}
                          style={{
                            ...pinStyle,
                          }}
                          className={cn(
                            rowCellPad,
                            "align-middle overflow-hidden",
                            TABLE_SURFACE.columnDivider,
                            align === "right" && "text-right tabular-nums",
                            align === "center" && "text-center",
                            pin === "left" && TABLE_SURFACE.stickyLeftSeparator,
                            pin === "right" && TABLE_SURFACE.stickyRightSeparator,
                          )}
                        >
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </td>
                      );
                    })}
                    {fillerWidth > 0 && <td aria-hidden="true" />}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>

        {/* Resize guide + live pixel badge (hidden until active resize) */}
        <div ref={guideRef} className="sonar-resize-guide" style={{ display: "none" }} />
        <div ref={badgeRef} className="sonar-resize-badge" style={{ display: "none" }} />
      </div>

      {scrollEdges.start && (
        <div aria-hidden="true" className="sonar-scroll-fade sonar-scroll-fade-start" />
      )}
      {scrollEdges.end && (
        <div aria-hidden="true" className="sonar-scroll-fade sonar-scroll-fade-end" />
      )}

      {/* Integrated bulk-action row — owned by the table shell, below the data
          viewport and above pagination. Never fixed to the browser viewport. */}
      {bulkSelection && bulkSelection.count > 0 && (
        <DataGridBulkActionBar
          count={bulkSelection.count}
          itemNoun={bulkSelection.itemNoun}
          primary={bulkSelection.primary}
          more={bulkSelection.more}
          onClear={bulkSelection.onClear}
        />
      )}
    </div>
  );
}

/* ----------------- Header cell ----------------- */
function HeaderCell<T>({
  header,
  density,
  isLeafRow,
  stickyLeft,
  stickyRight,
  pin,
  onStartResize,
  isResizingColumn,
}: {
  header: Header<T, unknown>;
  density: Density;
  isLeafRow: boolean;
  stickyLeft?: number;
  stickyRight?: number;
  pin: "left" | "right" | false;
  onStartResize: (e: React.PointerEvent, column: Column<T, unknown>) => void;
  isResizingColumn?: boolean;
}) {
  const meta = (header.column.columnDef.meta ?? {}) as SonarColumnMeta;
  const align = meta.align ?? "left";
  const isGroup = header.subHeaders.length > 0;
  // Only the leaf header row owns the resize affordance — a grouped parent can
  // never be dragged, so a group label can never collide with a handle.
  const canResize = isLeafRow && !isGroup && header.column.getCanResize();
  const sorted = header.column.getIsSorted();

  const pinStyle: React.CSSProperties =
    pin === "left"
      ? { position: "sticky", left: stickyLeft ?? 0, zIndex: 3 }
      : pin === "right"
        ? { position: "sticky", right: stickyRight ?? 0, zIndex: 3 }
        : {};

  return (
    <th
      data-col-id={header.column.id}
      colSpan={header.colSpan > 1 ? header.colSpan : undefined}
      aria-sort={
        isGroup || !header.column.getCanSort()
          ? undefined
          : sorted === "asc"
            ? "ascending"
            : sorted === "desc"
              ? "descending"
              : "none"
      }
      style={{
        ...pinStyle,
      }}
      className={cn(
        "group/th relative select-none align-middle",
        TABLE_SURFACE.headerBorder,
        isGroup ? TABLE_SURFACE.groupHeader : TABLE_SURFACE.header,
        TABLE_SURFACE.columnDivider,
        pin === "left" && TABLE_SURFACE.stickyLeftSeparator,
        pin === "right" && TABLE_SURFACE.stickyRightSeparator,
      )}
    >
      <div
        className={cn("flex w-full min-w-0 items-stretch", align === "right" && "flex-row-reverse")}
        style={{ height: isGroup ? 32 : DENSITY_HEADER_HEIGHT[density] }}
      >
        {/* Label area — flexes; wraps to two lines via header component.
            Trailing padding reserves the resize hit area so a long label or a
            sort indicator can never sit underneath the drag handle. */}
        <div
          className={cn(
            "flex min-w-0 flex-1 items-center px-3",
            isGroup && "justify-center text-center",
            !isGroup && align === "right" && "justify-end",
            !isGroup && align === "center" && "justify-center",
          )}
          style={canResize ? { paddingInlineEnd: TABLE_RESIZE.hitWidth } : undefined}
        >
          {header.isPlaceholder ? null : isGroup ? (
            <span className="truncate text-[10px] font-semibold tracking-[0.08em]">
              {flexRender(header.column.columnDef.header, header.getContext())}
            </span>
          ) : (
            flexRender(header.column.columnDef.header, header.getContext())
          )}
        </div>
      </div>

      {canResize && (
        <div
          onPointerDown={(e) => onStartResize(e, header.column)}
          onDoubleClick={(e) => {
            e.stopPropagation();
            header.column.resetSize();
          }}
          onClick={(e) => e.stopPropagation()}
          data-resizing={isResizingColumn ? "true" : undefined}
          role="separator"
          aria-orientation="vertical"
          aria-label={`Sütunu boyutlandır — çift tıklayarak sıfırla`}
          title="Sürükleyerek genişliği ayarla · çift tıkla sıfırla"
          tabIndex={-1}
          className={cn(
            "sonar-resize-handle group/rz absolute top-0 z-[8] h-full touch-none select-none",
            "cursor-col-resize",
          )}
          style={{
            // Kept fully inside its own header cell so a neighbouring pinned
            // column can never swallow the pointer target.
            width: TABLE_RESIZE.hitWidth,
            insetInlineEnd: 0,
            touchAction: "none",
          }}
        >
          <span aria-hidden="true" className="sonar-resize-handle-line" />
        </div>
      )}
    </th>
  );
}
