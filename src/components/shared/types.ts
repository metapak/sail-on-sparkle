/**
 * Implementation-neutral shared types.
 *
 * Pages import these instead of engine-specific types (Sonar/TanStack
 * Table/ECharts). Aliases are structural today; when the internal engine
 * changes, the alias target changes and page code stays untouched.
 */
import type {
  Density as SonarDensity,
  SavedView as SonarSavedView,
  SonarColumnMeta as InternalColumnMeta,
} from "@/components/sonar-data-grid/types";
import type { BulkAction as SonarBulkAction } from "@/components/sonar-data-grid/DataGridBulkActionBar";

/** Row density preset — neutral name for the shared table API. */
export type SharedDensity = SonarDensity;

/** Saved-view snapshot — neutral name for the shared table API. */
export type SharedSavedView = SonarSavedView;

/** Bulk-action descriptor exposed to pages. */
export type SharedBulkAction = SonarBulkAction;

/** Column meta hints (align, sticky). Neutral name; may drop `Sonar*` fields later. */
export type SharedColumnMeta = InternalColumnMeta;
