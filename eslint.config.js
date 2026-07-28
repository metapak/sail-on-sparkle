import js from "@eslint/js";
import eslintPluginPrettier from "eslint-plugin-prettier/recommended";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tseslint from "typescript-eslint";

export default tseslint.config(
  { ignores: ["dist", ".output", ".vinxi"] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      "no-restricted-imports": [
        "error",
        {
          paths: [
            {
              name: "server-only",
              message:
                "TanStack Start does not use the Next.js `server-only` package. Rename the module to `*.server.ts` or mark it with `@tanstack/react-start/server-only`.",
            },
          ],
          patterns: [
            {
              group: [
                "@/components/sonar-data-grid",
                "@/components/sonar-data-grid/*",
                "@/lib/sonar-charts",
                "@/lib/sonar-charts/*",
                "echarts",
                "echarts/*",
                "recharts",
                "recharts/*",
                "@unovis/react",
                "@unovis/ts",
                "@unovis/*",
                "@/components/shared/chart-presets",
                "@/components/shared/charts-unovis",
                "@/components/shared/table-presets",
                "@/components/ui/chart",
              ],
              message:
                "Import table/chart primitives from `@/components/shared` instead. Only the shared adapter layer may reach into SonarDataGrid, sonar-charts, or ECharts internals.",
            },
            {
              group: ["@/lib/dashboard-shared"],
              importNames: [
                "DEMO",
                "Panel",
                "SectionHead",
                "DeltaPill",
                "Sparkline",
                "ChangeCell",
                "ScoreBar",
                "STATUS_TONE",
                "ACTION_TONE",
                "STATUS_EXPLAIN",
                "COVERAGE_TONE",
                "rankLabel",
                "coverageForKeyword",
              ],
              message:
                "Import visual primitives from `@/components/shared` and data through `@/hooks/queries/*`. `@/lib/dashboard-shared` fixtures must not be consumed directly from pages.",
            },
            {
              group: ["@/lib/keywords/views"],
              importNames: ["KeywordStorage"],
              message:
                "Access tracked-keyword view preferences via `useTrackedViewPreferences` — pages must not touch localStorage directly.",
            },
            {
              group: [
                "@/lib/keywords/store",
                "@/lib/research/store",
                "@/services/*",
                "@/services/**",
                "@/api/client",
              ],
              message:
                "Pages must consume data through typed hooks in `@/hooks/queries/*` or `@/hooks/mutations/*`. Do not import services, stores, or the raw API client directly.",
            },
          ],
        },
      ],
      "react-refresh/only-export-components": ["warn", { allowConstantExport: true }],
      "@typescript-eslint/no-unused-vars": "off",
    },
  },
  {
    // Adapter layer + internal implementation modules may reach into
    // SonarDataGrid, sonar-charts, ECharts internals, and dashboard-shared.
    // Domain data packages under src/lib/{keywords,research} are internal
    // library layers and may consume both data + chart-history helpers.
    files: [
      "src/components/shared/**",
      "src/components/sonar-data-grid/**",
      "src/lib/sonar-charts/**",
      "src/lib/dashboard-shared.tsx",
      "src/components/ui/chart.tsx",
      "src/design/**",
      "src/i18n/**",
      "src/lib/keywords/**",
      "src/lib/research/**",
      "src/services/**",
      "src/hooks/queries/**",
      "src/hooks/mutations/**",
      "src/api/**",
    ],
    rules: { "no-restricted-imports": "off" },
  },
  eslintPluginPrettier,
);
