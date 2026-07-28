import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/dashboard/ai")({
  component: () => <Outlet />,
});
