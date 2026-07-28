/**
 * CENTRAL LAYOUT SYSTEM (Phase 5)
 *
 * One layout registry for every surface class in the app. Marketing and
 * dashboard use different presets, but both come from here.
 */

export type LayoutPreset =
  | "marketing" // public landing / content pages
  | "dashboard" // standard authenticated page
  | "workspace" // data-heavy full-width analytical page
  | "settings" // forms
  | "detail"; // entity detail pages

export interface LayoutSpec {
  /** Outer container classes (width + gutters). */
  container: string;
  /** Vertical spacing between page sections. */
  section: string;
  /** Grid gap between cards. */
  cardGap: string;
  /** Spacing under the page header. */
  headerSpacing: string;
}

export const LAYOUT_PRESETS: Record<LayoutPreset, LayoutSpec> = {
  marketing: {
    container: "mx-auto w-full max-w-[1200px] px-5 sm:px-8",
    section: "py-16 sm:py-24",
    cardGap: "gap-6",
    headerSpacing: "mb-8",
  },
  dashboard: {
    container: "mx-auto w-full max-w-[1600px] px-4 py-6 sm:px-6 sm:py-8 lg:px-8",
    section: "space-y-6",
    cardGap: "gap-4",
    headerSpacing: "mb-5",
  },
  workspace: {
    // Analytical tables must use the available width — no narrow centering.
    container: "w-full px-4 py-6 sm:px-6 sm:py-8",
    section: "space-y-4",
    cardGap: "gap-4",
    headerSpacing: "mb-4",
  },
  settings: {
    container: "mx-auto w-full max-w-[880px] px-4 py-6 sm:px-6 sm:py-8",
    section: "space-y-6",
    cardGap: "gap-4",
    headerSpacing: "mb-5",
  },
  detail: {
    container: "mx-auto w-full max-w-[1200px] px-4 py-6 sm:px-6 sm:py-8",
    section: "space-y-5",
    cardGap: "gap-4",
    headerSpacing: "mb-4",
  },
};

export function layout(preset: LayoutPreset) {
  return LAYOUT_PRESETS[preset];
}
