import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { LocaleProvider } from "@/i18n";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Sonar — Uygulamanızın bir sonraki büyüme hamlesini bilin" },
      {
        name: "description",
        content:
          "ASO, rakip zekâsı, pazar fırsatları ve AI Growth Advisor'ı tek platformda birleştiren premium ASO Intelligence çözümü.",
      },
      { property: "og:title", content: "Sonar — Uygulamanızın bir sonraki büyüme hamlesini bilin" },
      {
        property: "og:description",
        content:
          "ASO, rakip zekâsı, pazar fırsatları ve AI Growth Advisor'ı tek platformda birleştiren premium ASO Intelligence çözümü.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:site", content: "@Lovable" },
      {
        name: "twitter:title",
        content: "Sonar — Uygulamanızın bir sonraki büyüme hamlesini bilin",
      },
      {
        name: "twitter:description",
        content:
          "ASO, rakip zekâsı, pazar fırsatları ve AI Growth Advisor'ı tek platformda birleştiren premium ASO Intelligence çözümü.",
      },
      {
        property: "og:image",
        content:
          "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/76d114b8-1261-4bec-84b9-bfbd8132249a/id-preview-bac6facc--af653ae1-7af1-4bd2-9066-92f08d01afef.lovable.app-1784678781904.png",
      },
      {
        name: "twitter:image",
        content:
          "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/76d114b8-1261-4bec-84b9-bfbd8132249a/id-preview-bac6facc--af653ae1-7af1-4bd2-9066-92f08d01afef.lovable.app-1784678781904.png",
      },
    ],
    links: [
      // Fonts are self-hosted through @fontsource-variable (imported in
      // src/styles.css). No third-party font CDN requests at runtime.
      { rel: "stylesheet", href: appCss },
      { rel: "icon", href: "/favicon.ico", type: "image/x-icon" },
    ],
    scripts: [
      {
        // Pre-hydration theme application to prevent flash on /dashboard.
        children:
          "(function(){try{var p=location.pathname;if(p.indexOf('/dashboard')!==0)return;var t=localStorage.getItem('sonar.theme')||'system';var r=t==='system'?(matchMedia('(prefers-color-scheme: light)').matches?'light':'dark'):t;var c=document.documentElement.classList;if(r==='light'){c.add('light');c.remove('dark');}else{c.remove('light');c.add('dark');}}catch(e){}})();",
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="tr" dir="ltr" suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      {/* Central locale/dir/font provider — Turkish default, en/es/ar supported. */}
      <LocaleProvider>
        {/* Required: nested routes render here. Removing <Outlet /> breaks all child routes. */}
        <Outlet />
      </LocaleProvider>
    </QueryClientProvider>
  );
}
