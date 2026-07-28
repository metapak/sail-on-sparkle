import { createFileRoute, Link, Outlet, useRouterState } from "@tanstack/react-router";
import * as React from "react";
import {
  LayoutDashboard,
  Search,
  Swords,
  Globe2,
  Images,
  MessagesSquare,
  Store,
  Sparkles,
  Settings,
  LifeBuoy,
  Bell,
  ChevronDown,
  ChevronRight,
  Calendar as CalendarIcon,
  Smartphone,
  CircleDot,
  User,
  Sun,
  Moon,
  Monitor,
  Check,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useDashboardSummaryData } from "@/hooks/queries/use-dashboard-summary";
import { cn } from "@/lib/utils";
import { DashboardThemeProvider, useTheme, type ThemeChoice } from "@/lib/theme";
import {
  ANALYSIS_APPLICATIONS,
  ANALYSIS_MARKET_LIST,
  AnalysisScopeProvider,
  DATE_RANGE_PRESET_LABEL,
  STORE_LABEL,
  getApplication,
  getMarket,
  useAnalysisScope,
  type DateRangePreset,
  type StoreId,
} from "@/scope";

export const Route = createFileRoute("/dashboard")({
  /**
   * Analysis-scope search params. Declared once on the dashboard shell and
   * inherited by every child route. Only normalized IDs live in the URL —
   * never translated labels. `marketLocale` is intentionally absent: it is
   * derived from `country` through the central market registry.
   */
  validateSearch: (search: Record<string, unknown>) => ({
    app: typeof search.app === "string" ? search.app : "",
    store: typeof search.store === "string" ? search.store : "",
    country: typeof search.country === "string" ? search.country : "",
    range: typeof search.range === "string" ? search.range : "",
    from: typeof search.from === "string" ? search.from : "",
    to: typeof search.to === "string" ? search.to : "",
  }),
  head: () => ({
    meta: [
      { title: "Sonar Dashboard" },
      {
        name: "description",
        content: "FitLoop ASO çalışma alanı — genel bakış, anahtar kelime, rakip ve pazar zekâsı.",
      },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: DashboardLayout,
});

/* ================================================================
   NAV ARCHITECTURE — exactly two levels
================================================================ */
type ChildItem = { title: string; url: string; badge?: number };
type ModuleItem = {
  key: string;
  title: string;
  url: string;
  icon: React.ComponentType<{ className?: string }>;
  children?: ChildItem[];
};
type NavSection = { id: string; label?: string; items: ModuleItem[] };

const NAV: NavSection[] = [
  {
    id: "main",
    label: "Ana",
    items: [{ key: "overview", title: "Genel Bakış", url: "/dashboard", icon: LayoutDashboard }],
  },
  {
    id: "analysis",
    label: "Analiz",
    items: [
      {
        key: "keywords",
        title: "Anahtar Kelimeler",
        url: "/dashboard/keywords",
        icon: Search,
        children: [
          { title: "Özet", url: "/dashboard/keywords" },
          { title: "Takip Edilenler", url: "/dashboard/keywords/tracked" },
          { title: "Anahtar Kelime Araştırması", url: "/dashboard/keywords/research" },
          { title: "Rakip Analizi", url: "/dashboard/keywords/competitors" },
          { title: "Yeni ve Kaybedilenler", url: "/dashboard/keywords/movements", badge: 3 },
        ],
      },
      {
        key: "competitors",
        title: "Rakipler",
        url: "/dashboard/competitors",
        icon: Swords,
        children: [
          { title: "Özet", url: "/dashboard/competitors" },
          { title: "Rakiplerim", url: "/dashboard/competitors/apps" },
          { title: "Değişiklikler", url: "/dashboard/competitors/changes", badge: 2 },
          { title: "Görünürlük Karşılaştırması", url: "/dashboard/competitors/visibility" },
        ],
      },
      {
        key: "markets",
        title: "Pazarlar",
        url: "/dashboard/markets",
        icon: Globe2,
        children: [
          { title: "Özet", url: "/dashboard/markets" },
          { title: "Ülke Fırsatları", url: "/dashboard/markets/opportunities" },
          { title: "Pazar Karşılaştırması", url: "/dashboard/markets/comparison" },
          { title: "Yükselen Pazarlar", url: "/dashboard/markets/rising" },
        ],
      },
      {
        key: "creative",
        title: "Kreatif Analizi",
        url: "/dashboard/creative",
        icon: Images,
        children: [
          { title: "Özet", url: "/dashboard/creative" },
          { title: "Kreatif Değişiklikleri", url: "/dashboard/creative/changes" },
          { title: "Önce ve Sonra", url: "/dashboard/creative/comparison" },
          { title: "Rakip Kreatifleri", url: "/dashboard/creative/competitors" },
        ],
      },
      {
        key: "reviews",
        title: "Yorum Analizi",
        url: "/dashboard/reviews",
        icon: MessagesSquare,
        children: [
          { title: "Özet", url: "/dashboard/reviews" },
          { title: "Duygu ve Konular", url: "/dashboard/reviews/sentiment" },
          { title: "Özellik Talepleri", url: "/dashboard/reviews/requests", badge: 5 },
          { title: "Rakip Yorumları", url: "/dashboard/reviews/competitors" },
        ],
      },
    ],
  },
  {
    id: "workspaces",
    label: "Çalışma Alanları",
    items: [
      {
        key: "store",
        title: "Mağaza Çalışma Alanı",
        url: "/dashboard/store",
        icon: Store,
        children: [
          { title: "Özet", url: "/dashboard/store" },
          { title: "Mağaza Bilgileri", url: "/dashboard/store/listing" },
          { title: "Kreatifler", url: "/dashboard/store/creatives" },
          { title: "Lokalizasyon", url: "/dashboard/store/localization" },
          { title: "Etkinlikler", url: "/dashboard/store/events" },
          { title: "Yayınlama", url: "/dashboard/store/publishing", badge: 2 },
        ],
      },
      {
        key: "ai",
        title: "Yapay Zekâ İçgörüleri",
        url: "/dashboard/ai",
        icon: Sparkles,
        children: [
          { title: "Bugünkü Öneriler", url: "/dashboard/ai" },
          { title: "Kayıtlı İçgörüler", url: "/dashboard/ai/saved" },
        ],
      },
    ],
  },
];

const BOTTOM: ModuleItem[] = [
  { key: "settings", title: "Ayarlar", url: "/dashboard/settings", icon: Settings },
  { key: "help", title: "Yardım", url: "/dashboard/help", icon: LifeBuoy },
];

/** True if the current pathname belongs to this module (parent match). */
function isModuleActive(pathname: string, url: string) {
  if (url === "/dashboard") return pathname === "/dashboard";
  return pathname === url || pathname.startsWith(url + "/");
}
/** Exact-match for child leaves; index children (Özet) match only their exact URL. */
function isChildActive(pathname: string, url: string) {
  // For the module root URL used as an "Özet" child, prefer exact match so it doesn't stay
  // permanently active on sibling child pages.
  return pathname === url;
}

/* ================================================================
   EXPANDED-MODULE PERSISTENCE
================================================================ */
const EXPANDED_KEY = "sonar.sidebar.expandedModule";

function useExpandedModule(activeModuleKey: string | null) {
  const [expanded, setExpanded] = React.useState<string | null>(null);

  // Hydrate from localStorage after mount, then fall back to active module.
  React.useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const stored = window.localStorage.getItem(EXPANDED_KEY);
      if (stored) {
        setExpanded(stored);
        return;
      }
    } catch {
      /* ignore */
    }
    if (activeModuleKey) setExpanded(activeModuleKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // When user navigates directly to a child route, auto-expand its parent.
  React.useEffect(() => {
    if (activeModuleKey && expanded !== activeModuleKey) {
      setExpanded(activeModuleKey);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeModuleKey]);

  const setAndPersist = React.useCallback((v: string | null) => {
    setExpanded(v);
    if (typeof window === "undefined") return;
    try {
      if (v == null) window.localStorage.removeItem(EXPANDED_KEY);
      else window.localStorage.setItem(EXPANDED_KEY, v);
    } catch {
      /* ignore */
    }
  }, []);

  const toggle = React.useCallback(
    (k: string) => {
      setAndPersist(expanded === k ? null : k);
    },
    [expanded, setAndPersist],
  );

  return { expanded, toggle };
}

/* ================================================================
   SIDEBAR
================================================================ */
function AppSidebar() {
  const { state, isMobile, setOpenMobile } = useSidebar();
  const collapsed = state === "collapsed" && !isMobile;
  const pathname = useRouterState({ select: (r) => r.location.pathname });

  const activeModule = React.useMemo(() => {
    for (const s of NAV) {
      for (const m of s.items) {
        if (m.children && isModuleActive(pathname, m.url)) return m.key;
      }
    }
    return null;
  }, [pathname]);

  const { expanded, toggle } = useExpandedModule(activeModule);
  const handleNav = React.useCallback(() => {
    if (isMobile) setOpenMobile(false);
  }, [isMobile, setOpenMobile]);

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border">
      <SidebarHeader className="border-b border-sidebar-border">
        <Link to="/" onClick={handleNav} className="flex items-center gap-2 px-2 py-2">
          <div className="grid h-8 w-8 shrink-0 place-items-center rounded-md bg-primary/15 ring-1 ring-[color:var(--cobalt)]/30">
            <CircleDot className="h-4 w-4 text-primary" />
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <div className="font-editorial text-sm font-semibold tracking-tight">Sonar</div>
              <div className="truncate text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                ASO Intelligence
              </div>
            </div>
          )}
        </Link>
      </SidebarHeader>

      <SidebarContent>
        {NAV.map((section) => (
          <SidebarGroup key={section.id}>
            {section.label && !collapsed && (
              <SidebarGroupLabel className="text-[10px] font-medium uppercase tracking-[0.14em] text-muted-foreground/80">
                {section.label}
              </SidebarGroupLabel>
            )}
            <SidebarGroupContent>
              <SidebarMenu>
                {section.items.map((m) => (
                  <ModuleRow
                    key={m.key}
                    module={m}
                    pathname={pathname}
                    collapsed={collapsed}
                    expanded={expanded === m.key}
                    onToggle={() => toggle(m.key)}
                    onNavigate={handleNav}
                  />
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border">
        <SidebarMenu>
          {BOTTOM.map((m) => (
            <SidebarMenuItem key={m.key}>
              <SidebarMenuButton
                asChild
                isActive={isModuleActive(pathname, m.url)}
                tooltip={m.title}
              >
                <Link
                  to={m.url}
                  onClick={handleNav}
                  aria-current={isModuleActive(pathname, m.url) ? "page" : undefined}
                >
                  <m.icon className="h-4 w-4" />
                  <span>{m.title}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
          <SidebarMenuItem>
            <SidebarMenuButton tooltip="Kullanıcı profili">
              <Avatar className="h-6 w-6">
                <AvatarFallback className="bg-accent-brand/20 text-[10px] text-[color:var(--violet)]">
                  MA
                </AvatarFallback>
              </Avatar>
              <span className="truncate">Mert Aydın</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}

/* ================================================================
   MODULE ROW — handles the four modes:
   • leaf (no children)
   • parent expanded (chevron toggles, label navigates)
   • parent collapsed desktop → flyout Popover
   • parent inside mobile drawer → inline accordion (same code path as expanded)
================================================================ */
function ModuleRow({
  module: m,
  pathname,
  collapsed,
  expanded,
  onToggle,
  onNavigate,
}: {
  module: ModuleItem;
  pathname: string;
  collapsed: boolean;
  expanded: boolean;
  onToggle: () => void;
  onNavigate: () => void;
}) {
  const active = isModuleActive(pathname, m.url);

  // Leaf module (no children) — simple link, tooltip when collapsed.
  if (!m.children || m.children.length === 0) {
    return (
      <SidebarMenuItem>
        <SidebarMenuButton asChild isActive={active} tooltip={m.title}>
          <Link to={m.url} onClick={onNavigate} aria-current={active ? "page" : undefined}>
            <m.icon className="h-4 w-4" />
            <span>{m.title}</span>
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
    );
  }

  // Collapsed desktop: icon-only trigger opens a Popover flyout with children.
  if (collapsed) {
    return (
      <SidebarMenuItem>
        <ModuleFlyout module={m} pathname={pathname} active={active} onNavigate={onNavigate} />
      </SidebarMenuItem>
    );
  }

  // Expanded desktop or mobile drawer — label + separate chevron.
  return (
    <SidebarMenuItem>
      <SidebarMenuButton asChild isActive={active} tooltip={m.title}>
        <Link to={m.url} onClick={onNavigate} aria-current={active ? "page" : undefined}>
          <m.icon className="h-4 w-4" />
          <span>{m.title}</span>
        </Link>
      </SidebarMenuButton>
      <SidebarMenuAction
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onToggle();
        }}
        aria-expanded={expanded}
        aria-label={expanded ? `${m.title} alt menüsünü kapat` : `${m.title} alt menüsünü aç`}
        className="peer-hover/menu-button:text-sidebar-accent-foreground"
      >
        <ChevronRight className={cn("h-3.5 w-3.5 transition-transform", expanded && "rotate-90")} />
      </SidebarMenuAction>
      {expanded && (
        <SidebarMenuSub>
          {m.children.map((c) => {
            const cActive = isChildActive(pathname, c.url);
            return (
              <SidebarMenuSubItem key={c.url}>
                <SidebarMenuSubButton asChild isActive={cActive}>
                  <Link
                    to={c.url}
                    onClick={onNavigate}
                    aria-current={cActive ? "page" : undefined}
                    className="flex items-center justify-between gap-2"
                  >
                    <span className="truncate">{c.title}</span>
                    {c.badge != null && (
                      <span className="inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-primary/18 px-1 text-[10px] font-medium tabular-nums text-primary ring-1 ring-[color:var(--cobalt)]/30">
                        {c.badge}
                      </span>
                    )}
                  </Link>
                </SidebarMenuSubButton>
              </SidebarMenuSubItem>
            );
          })}
        </SidebarMenuSub>
      )}
    </SidebarMenuItem>
  );
}

/* ================================================================
   COLLAPSED-DESKTOP FLYOUT
================================================================ */
function ModuleFlyout({
  module: m,
  pathname,
  active,
  onNavigate,
}: {
  module: ModuleItem;
  pathname: string;
  active: boolean;
  onNavigate: () => void;
}) {
  const [open, setOpen] = React.useState(false);
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          data-active={active || undefined}
          aria-label={m.title}
          aria-expanded={open}
          className={cn(
            "flex h-8 w-8 items-center justify-center rounded-md text-sidebar-foreground/85 outline-none transition",
            "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
            "focus-visible:ring-2 focus-visible:ring-sidebar-ring",
            active && "bg-sidebar-accent text-sidebar-accent-foreground",
          )}
        >
          <m.icon className="h-4 w-4" />
        </button>
      </PopoverTrigger>
      <PopoverContent
        side="right"
        align="start"
        sideOffset={8}
        className="w-64 border-hairline bg-popover p-2 text-popover-foreground shadow-lg"
      >
        <div className="px-2 pb-2 pt-1">
          <Link
            to={m.url}
            onClick={() => {
              setOpen(false);
              onNavigate();
            }}
            className={cn(
              "flex items-center gap-2 rounded-md px-1 py-1 text-sm font-medium",
              "hover:text-foreground",
              active ? "text-foreground" : "text-foreground/90",
            )}
            aria-current={active ? "page" : undefined}
          >
            <m.icon className="h-4 w-4 text-primary" />
            {m.title}
          </Link>
        </div>
        <div className="mx-1 h-px bg-hairline" />
        <ul className="mt-1 flex flex-col">
          {m.children!.map((c) => {
            const cActive = isChildActive(pathname, c.url);
            return (
              <li key={c.url}>
                <Link
                  to={c.url}
                  onClick={() => {
                    setOpen(false);
                    onNavigate();
                  }}
                  aria-current={cActive ? "page" : undefined}
                  className={cn(
                    "flex items-center justify-between gap-2 rounded-md px-2 py-1.5 text-xs transition",
                    "hover:bg-accent hover:text-accent-foreground",
                    cActive
                      ? "bg-primary/12 text-foreground ring-1 ring-inset ring-[color:var(--cobalt)]/25"
                      : "text-muted-foreground",
                  )}
                >
                  <span className="truncate">{c.title}</span>
                  {c.badge != null && (
                    <span className="inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-primary/18 px-1 text-[10px] font-medium tabular-nums text-primary ring-1 ring-[color:var(--cobalt)]/30">
                      {c.badge}
                    </span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </PopoverContent>
    </Popover>
  );
}

/* ================================================================
   BREADCRUMBS — derived from the active route
================================================================ */
function useBreadcrumbs(pathname: string): { label: string; to?: string }[] {
  return React.useMemo(() => {
    if (pathname === "/dashboard") return [{ label: "Genel Bakış" }];

    // Inspector: /dashboard/keywords/inspect/:keyword
    const inspect = pathname.match(/^\/dashboard\/keywords\/inspect\/(.+)$/);
    if (inspect) {
      const raw = decodeURIComponent(inspect[1]).replace(/-/g, " ");
      return [
        { label: "Genel Bakış", to: "/dashboard" },
        { label: "Anahtar Kelimeler", to: "/dashboard/keywords" },
        { label: "Takip Edilenler", to: "/dashboard/keywords/tracked" },
        { label: raw },
      ];
    }

    for (const s of NAV) {
      for (const m of s.items) {
        if (!m.children) continue;
        if (!isModuleActive(pathname, m.url)) continue;
        const child = m.children.find((c) => c.url !== m.url && pathname === c.url);
        const özet = m.children.find((c) => c.url === m.url);
        return [
          { label: "Genel Bakış", to: "/dashboard" },
          { label: m.title, to: m.url },
          { label: child?.title ?? özet?.title ?? "Özet" },
        ];
      }
    }
    for (const m of BOTTOM) {
      if (isModuleActive(pathname, m.url)) {
        return [{ label: "Genel Bakış", to: "/dashboard" }, { label: m.title }];
      }
    }
    return [{ label: "Genel Bakış", to: "/dashboard" }];
  }, [pathname]);
}

function Breadcrumbs() {
  const pathname = useRouterState({ select: (r) => r.location.pathname });
  const crumbs = useBreadcrumbs(pathname);
  return (
    <nav
      aria-label="Sayfa Yolu"
      className="min-w-0 overflow-hidden text-[11px] text-muted-foreground"
    >
      <ol className="flex min-w-0 items-center gap-1.5 truncate">
        {crumbs.map((c, i) => (
          <li key={i} className="flex min-w-0 shrink items-center gap-1.5">
            {i > 0 && <ChevronRight className="h-3 w-3 shrink-0 opacity-60" />}
            {c.to && i < crumbs.length - 1 ? (
              <Link to={c.to} className="truncate hover:text-foreground">
                {c.label}
              </Link>
            ) : (
              <span className={cn("truncate", i === crumbs.length - 1 && "text-foreground")}>
                {c.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

/* ================================================================
   HEADER
================================================================ */
type HeaderOption = { id: string; label: string; disabled?: boolean };

/**
 * Controlled header select. Holds NO local business state — value and options
 * are supplied by the global analysis scope.
 */
function HeaderSelect({
  label,
  value,
  icon: Icon,
  options,
  onSelect,
  /** `touch` renders a full-width 44px control for the mobile scope sheet. */
  variant = "compact",
}: {
  label: string;
  value: string;
  icon?: React.ComponentType<{ className?: string }>;
  options: HeaderOption[];
  onSelect: (id: string) => void;
  variant?: "compact" | "touch";
}) {
  const current = options.find((o) => o.id === value);
  const touch = variant === "touch";
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          aria-label={`${label}: ${current?.label ?? value}`}
          className={cn(
            "gap-1.5 border border-hairline bg-surface/60 font-medium hover:bg-surface-2",
            touch ? "h-11 w-full justify-between px-3 text-sm" : "h-8 px-2.5 text-xs",
          )}
        >
          {Icon && <Icon className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />}
          <span className={cn("text-muted-foreground", touch ? "hidden" : "hidden sm:inline")}>
            {label}:
          </span>
          <span className={cn("truncate", touch && "flex-1 text-left")}>
            {current?.label ?? value}
          </span>
          <ChevronDown className="h-3 w-3 shrink-0 text-muted-foreground" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        className={cn(
          "z-[90] min-w-44",
          touch && "max-h-[50vh] w-[calc(100vw-3rem)] overflow-y-auto",
        )}
      >
        <DropdownMenuLabel className="text-xs">{label}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {options.map((it) => (
          <DropdownMenuItem
            key={it.id}
            disabled={it.disabled}
            className={cn(touch ? "min-h-11 text-sm" : "text-xs")}
            onSelect={() => {
              if (it.disabled || it.id === value) return;
              onSelect(it.id);
            }}
          >
            <span className="flex-1">{it.label}</span>
            {it.id === value && <Check className="h-3.5 w-3.5 text-primary" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/**
 * Single source for scope option lists + setters. Both the desktop inline row
 * and the mobile sheet consume this — no duplicated registry or validation.
 */
function useScopeOptions() {
  const { scope, setApplication, setStore, setCountry, setDateRange } = useAnalysisScope();
  const app = getApplication(scope.applicationId);
  const market = getMarket(scope.countryCode);

  const appOptions: HeaderOption[] = ANALYSIS_APPLICATIONS.map((a) => ({
    id: a.id,
    label: a.name,
  }));
  const storeOptions: HeaderOption[] = (["app-store", "google-play"] as StoreId[]).map((sid) => ({
    id: sid,
    label: STORE_LABEL[sid],
    disabled: !app?.supportedStores.includes(sid),
  }));
  const countryOptions: HeaderOption[] = ANALYSIS_MARKET_LIST.map((m) => ({
    id: m.countryCode,
    label: m.label,
    disabled: !m.supportedStores.includes(scope.store),
  }));
  const rangeOptions: HeaderOption[] = (["7d", "30d", "90d"] as DateRangePreset[]).map((p) => ({
    id: p,
    label: DATE_RANGE_PRESET_LABEL[p],
  }));

  return {
    scope,
    app,
    market,
    appOptions,
    storeOptions,
    countryOptions,
    rangeOptions,
    setApplication,
    setStore,
    setCountry,
    setDateRange,
  };
}

/** Header scope bar — desktop (md+) inline presentation. */
function ScopeSelectors() {
  const {
    scope,
    market,
    appOptions,
    storeOptions,
    countryOptions,
    rangeOptions,
    setApplication,
    setStore,
    setCountry,
    setDateRange,
  } = useScopeOptions();

  return (
    <>
      <HeaderSelect
        label="Uygulama"
        value={scope.applicationId}
        icon={Smartphone}
        options={appOptions}
        onSelect={setApplication}
      />
      <HeaderSelect
        label="Mağaza"
        value={scope.store}
        options={storeOptions}
        onSelect={(id) => setStore(id as StoreId)}
      />
      <HeaderSelect
        label="Ülke"
        value={scope.countryCode}
        options={countryOptions}
        onSelect={setCountry}
      />
      <HeaderSelect
        label="Tarih"
        value={scope.dateRange.preset}
        icon={CalendarIcon}
        options={rangeOptions}
        onSelect={(id) => setDateRange({ preset: id as DateRangePreset })}
      />
      <span
        className="hidden text-[11px] text-muted-foreground lg:inline"
        data-testid="scope-market-locale"
        title="Pazar analiz dili — seçili ülkeden türetilir"
      >
        Pazar dili: {scope.marketLocale.toUpperCase()}
        {market ? ` · ${market.label}` : ""}
      </span>
    </>
  );
}

/**
 * Mobile (< md) analysis-scope presentation: one compact "Kapsam" trigger that
 * opens a Sheet with the same selectors. All writes go through the single
 * AnalysisScope setters — immediate, no draft state.
 */
function MobileScopeControl() {
  const [open, setOpen] = React.useState(false);
  const {
    scope,
    market,
    appOptions,
    storeOptions,
    countryOptions,
    rangeOptions,
    setApplication,
    setStore,
    setCountry,
    setDateRange,
  } = useScopeOptions();

  const appLabel = appOptions.find((o) => o.id === scope.applicationId)?.label ?? "";
  const summary = [
    appLabel,
    STORE_LABEL[scope.store],
    market?.label ?? scope.countryCode,
    scope.dateRange.preset === "custom"
      ? `${scope.dateRange.from} → ${scope.dateRange.to}`
      : DATE_RANGE_PRESET_LABEL[scope.dateRange.preset],
  ]
    .filter(Boolean)
    .join(" · ");

  const sheetRangeOptions: HeaderOption[] = [
    ...rangeOptions,
    { id: "custom", label: DATE_RANGE_PRESET_LABEL.custom },
  ];

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <button
          type="button"
          data-testid="mobile-scope-trigger"
          aria-label={`Kapsam: ${summary}`}
          className="flex h-11 min-w-0 flex-1 items-center gap-2 rounded-md border border-hairline bg-surface/60 px-2.5 text-left [touch-action:manipulation] hover:bg-surface-2 md:hidden"
        >
          <Globe2 className="h-4 w-4 shrink-0 text-muted-foreground" />
          <span className="min-w-0 flex-1 leading-tight">
            <span className="block text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
              Kapsam
            </span>
            <span className="block truncate text-[11px] font-medium text-foreground">
              {summary}
            </span>
          </span>
          <ChevronDown className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
        </button>
      </SheetTrigger>
      <SheetContent
        side="bottom"
        className="z-[70] max-h-[85svh] overflow-y-auto rounded-t-xl pb-[max(1rem,env(safe-area-inset-bottom))]"
      >
        <SheetHeader className="text-left">
          <SheetTitle>Kapsam</SheetTitle>
          <SheetDescription className="text-xs">
            Tüm analitik veriler seçtiğiniz kapsamla filtrelenir.
          </SheetDescription>
        </SheetHeader>
        <div className="mt-4 space-y-3">
          <ScopeField label="Uygulama">
            <HeaderSelect
              variant="touch"
              label="Uygulama"
              value={scope.applicationId}
              icon={Smartphone}
              options={appOptions}
              onSelect={setApplication}
            />
          </ScopeField>
          <ScopeField label="Mağaza">
            <HeaderSelect
              variant="touch"
              label="Mağaza"
              value={scope.store}
              options={storeOptions}
              onSelect={(id) => setStore(id as StoreId)}
            />
          </ScopeField>
          <ScopeField label="Ülke">
            <HeaderSelect
              variant="touch"
              label="Ülke"
              value={scope.countryCode}
              options={countryOptions}
              onSelect={setCountry}
            />
          </ScopeField>
          <ScopeField label="Tarih aralığı">
            <HeaderSelect
              variant="touch"
              label="Tarih"
              value={scope.dateRange.preset}
              icon={CalendarIcon}
              options={sheetRangeOptions}
              onSelect={(id) =>
                setDateRange(
                  id === "custom"
                    ? { preset: "custom", from: scope.dateRange.from, to: scope.dateRange.to }
                    : { preset: id as DateRangePreset },
                )
              }
            />
          </ScopeField>
          {scope.dateRange.preset === "custom" && (
            <div className="grid grid-cols-2 gap-2">
              <ScopeField label="Başlangıç">
                <input
                  type="date"
                  value={scope.dateRange.from}
                  max={scope.dateRange.to}
                  onChange={(e) =>
                    setDateRange({
                      preset: "custom",
                      from: e.target.value,
                      to: scope.dateRange.to,
                    })
                  }
                  className="h-11 w-full min-w-0 rounded-md border border-hairline bg-surface/60 px-2.5 text-sm text-foreground"
                />
              </ScopeField>
              <ScopeField label="Bitiş">
                <input
                  type="date"
                  value={scope.dateRange.to}
                  min={scope.dateRange.from}
                  onChange={(e) =>
                    setDateRange({
                      preset: "custom",
                      from: scope.dateRange.from,
                      to: e.target.value,
                    })
                  }
                  className="h-11 w-full min-w-0 rounded-md border border-hairline bg-surface/60 px-2.5 text-sm text-foreground"
                />
              </ScopeField>
            </div>
          )}
          <p className="pt-1 text-[11px] text-muted-foreground">
            Pazar dili: {scope.marketLocale.toUpperCase()}
            {market ? ` · ${market.label}` : ""}
          </p>
        </div>
      </SheetContent>
    </Sheet>
  );
}

function ScopeField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="min-w-0 space-y-1">
      <span className="block text-[11px] font-medium text-muted-foreground">{label}</span>
      {children}
    </div>
  );
}

function DashboardHeader() {
  const summary = useDashboardSummaryData();
  return (
    <header className="sticky top-0 z-30 flex shrink-0 flex-col border-b border-hairline bg-background/85 backdrop-blur-md">
      <div className="flex h-14 items-center gap-2 px-3 sm:px-4">
        <SidebarTrigger className="h-8 w-8" />
        <Separator orientation="vertical" className="mx-1 h-5 bg-hairline" />
        <MobileScopeControl />
        <div className="hidden min-w-0 flex-1 items-center gap-1.5 overflow-x-auto [scrollbar-width:none] md:flex [&::-webkit-scrollbar]:hidden">
          <ScopeSelectors />
        </div>
        <div className="ml-auto flex shrink-0 items-center gap-1.5">
          <Badge
            variant="outline"
            className="hidden h-7 gap-1.5 border-hairline bg-surface/60 px-2 text-[10px] font-medium text-muted-foreground md:inline-flex"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-[color:var(--success)]" />
            Son güncelleme · {summary.updatedAgo}
          </Badge>
          <Button variant="ghost" size="icon" className="relative h-8 w-8">
            <Bell className="h-4 w-4" />
            <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-primary" />
            <span className="sr-only">Bildirimler</span>
          </Button>
          <ThemeMenu />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                <Avatar className="h-7 w-7">
                  <AvatarFallback className="bg-accent-brand/20 text-[10px] text-[color:var(--violet)]">
                    MA
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel>
                <div className="text-sm font-medium">Mert Aydın</div>
                <div className="text-xs text-muted-foreground">mert@fitloop.app</div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-xs">
                <User className="mr-2 h-3.5 w-3.5" />
                Profil
              </DropdownMenuItem>
              <DropdownMenuItem className="text-xs" asChild>
                <Link to="/dashboard/settings">
                  <Settings className="mr-2 h-3.5 w-3.5" />
                  Ayarlar
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-xs text-[color:var(--danger)]">
                Çıkış yap
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      <div className="flex min-w-0 items-center border-t border-hairline px-3 py-2 sm:px-4">
        <Breadcrumbs />
      </div>
    </header>
  );
}

/* ================================================================
   THEME MENU — visible in the top bar
================================================================ */
const THEME_LABEL: Record<ThemeChoice, string> = {
  light: "Açık",
  dark: "Koyu",
  system: "Sistem",
};

function ThemeIcon({ choice, className }: { choice: ThemeChoice; className?: string }) {
  const Icon = choice === "light" ? Sun : choice === "dark" ? Moon : Monitor;
  return <Icon className={className} />;
}

function ThemeMenu() {
  const { theme, setTheme } = useTheme();
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          aria-label={`Görünüm: ${THEME_LABEL[theme]}`}
          title={`Görünüm: ${THEME_LABEL[theme]}`}
        >
          <ThemeIcon choice={theme} className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40">
        <DropdownMenuLabel className="text-xs">Görünüm</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {(["light", "dark", "system"] as ThemeChoice[]).map((c) => (
          <DropdownMenuItem key={c} onSelect={() => setTheme(c)} className="text-xs">
            <ThemeIcon choice={c} className="mr-2 h-3.5 w-3.5" />
            <span className="flex-1">{THEME_LABEL[c]}</span>
            {theme === c && <Check className="h-3.5 w-3.5 text-primary" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function DashboardLayout() {
  return (
    <DashboardThemeProvider>
      {/* THE single analysis-scope provider for the authenticated app. */}
      <AnalysisScopeProvider>
        <SidebarProvider>
          <AppSidebar />
          <SidebarInset className="min-w-0 bg-background">
            <DashboardHeader />
            <main className="min-w-0 flex-1 overflow-x-hidden">
              <Outlet />
            </main>
          </SidebarInset>
        </SidebarProvider>
      </AnalysisScopeProvider>
    </DashboardThemeProvider>
  );
}
