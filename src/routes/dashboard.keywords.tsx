import { createFileRoute, Outlet } from "@tanstack/react-router";

/**
 * Layout route for the Keyword Intelligence module.
 * Children live in dashboard.keywords.{index,tracked,research,competitors,movements,inspect.$keyword}.tsx
 */
export const Route = createFileRoute("/dashboard/keywords")({
  component: () => <Outlet />,
});
