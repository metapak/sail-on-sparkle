import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  ArrowUpRight,
  Sparkles,
  Search,
  Trophy,
  Globe2,
  LineChart,
  MessageSquare,
  Zap,
  Target,
  TrendingUp,
  Layers,
  ChevronDown,
  Check,
  Play,
  Star,
  ArrowUp,
  ArrowDown,
  Wand2,
  Brain,
  Compass,
  Rocket,
  ShieldCheck,
  Radar,
  Store,
  Smartphone,
  Languages,
  MapPin,
  BarChart3,
  Activity,
  Calendar,
  FileText,
  Eye,
  Wrench,
  AlertTriangle,
  Flame,
  Lightbulb,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useRef, useState } from "react";

/** Smoothly scroll to an in-page anchor, respecting sticky header + reduced motion. */
function smoothScrollToHash(hash: string) {
  if (!hash || hash === "#") {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
    return true;
  }
  const id = hash.replace(/^#/, "");
  const el = document.getElementById(id);
  if (!el) return false;
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  el.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
  history.replaceState(null, "", `#${id}`);
  return true;
}

function useSmoothAnchorNav() {
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey)
        return;
      const target = (e.target as HTMLElement | null)?.closest("a");
      if (!target) return;
      const href = target.getAttribute("href");
      if (!href) return;
      // Only same-page hash links
      if (href.startsWith("#")) {
        if (smoothScrollToHash(href)) e.preventDefault();
      }
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);
}

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
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
    ],
  }),
  component: Landing,
});

function Landing() {
  useSmoothAnchorNav();
  return (
    <div className="min-h-screen bg-background text-foreground font-display antialiased selection:bg-cobalt-soft text-[15px] lg:text-[16px] leading-relaxed">
      <Header />
      <main className="overflow-x-clip">
        <Hero />
        <TrustStrip />
        <Philosophy />
        <AIAdvisor />
        <KeywordIntel />
        <CompetitorTimeline />
        <MarketOpportunity />
        <StoreWorkspace />
        <ChangeImpact />
        <OrganicPaid />
        <ReviewIntel />
        <FreeTools />
        <TopApps />
        <DemoSection />
        <GlobalPlatform />
        <Testimonials />
        <FinalCTA />
      </main>
      <Footer />
      <FloatingNav />
    </div>
  );
}

/* ------------------------------- HEADER ------------------------------- */

const megaItems: { icon: React.ElementType; title: string; desc: string; href: string }[] = [
  {
    icon: Brain,
    title: "Yapay Zekâ Büyüme Danışmanı",
    desc: "Uygulama verinize sorun, kanıta dayalı öneriler alın.",
    href: "#ai-growth-advisor",
  },
  {
    icon: Search,
    title: "Anahtar Kelime Analizi",
    desc: "Anahtar kelime keşfi, sıralama takibi ve gerçekçi fırsatlar.",
    href: "#keyword-intelligence",
  },
  {
    icon: Radar,
    title: "Rakip Analizi",
    desc: "Rakip metadata, kreatif ve tarihsel değişiklikler.",
    href: "#competitor-intelligence",
  },
  {
    icon: Compass,
    title: "Fırsat & Pazar Analizi",
    desc: "Kelime, ülke, pazar ve niş fırsatlarını keşfedin.",
    href: "#market-intelligence",
  },
  {
    icon: BarChart3,
    title: "Mağaza Analitiği",
    desc: "Sıralama ve ASO aksiyonlarını gerçek performansa bağlayın.",
    href: "#analytics",
  },
  {
    icon: Store,
    title: "Mağaza & İçerik",
    desc: "Metadata, kreatif ve lokalizasyonu tek yerden yönetin.",
    href: "#store-workspace",
  },
  {
    icon: MessageSquare,
    title: "Yorum Analizi",
    desc: "Binlerce yorumdan net ürün içgörülerine.",
    href: "#review-intelligence",
  },
];

const resourceItems: { title: string; desc: string; href: string; icon: React.ElementType }[] = [
  { title: "Blog", desc: "ASO ve mobil büyüme yazıları.", href: "/blog", icon: FileText },
  {
    title: "ASO Rehberleri",
    desc: "Pratik, adım adım rehberler.",
    href: "/rehberler",
    icon: Compass,
  },
  { title: "ASO Sözlüğü", desc: "ASO terimlerini hızla öğrenin.", href: "/sozluk", icon: Layers },
];

function useHoverDropdown() {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const clearClose = () => {
    if (closeTimer.current) {
      clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
  };
  const openNow = () => {
    clearClose();
    setOpen(true);
  };
  const scheduleClose = () => {
    clearClose();
    closeTimer.current = setTimeout(() => setOpen(false), 200);
  };
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    const onDocClick = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onDocClick);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onDocClick);
    };
  }, [open]);
  useEffect(() => () => clearClose(), []);
  return { open, setOpen, wrapRef, openNow, scheduleClose };
}

function Header() {
  const [scrolled, setScrolled] = useState(false);
  const feats = useHoverDropdown();
  const res = useHoverDropdown();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${scrolled ? "backdrop-blur-xl bg-background/75 border-b border-hairline" : "bg-transparent"}`}
    >
      <div className="mx-auto max-w-7xl px-6 h-16 flex items-center justify-between">
        <a href="#" className="group flex items-center gap-2.5">
          <span className="relative h-6 w-6 grid place-items-center">
            <span className="absolute inset-0 rounded-md bg-gradient-to-br from-cobalt to-violet opacity-90" />
            <span className="absolute inset-[3px] rounded-[4px] bg-background/80" />
            <span className="relative h-1.5 w-1.5 rounded-full bg-cobalt signal-dot" />
          </span>
          <span className="font-editorial font-semibold tracking-tight text-[15px]">Sonar</span>
          <span className="hidden sm:inline text-[10px] font-mono tracking-[0.18em] uppercase text-muted-foreground/70">
            intelligence
          </span>
        </a>

        <nav className="hidden lg:flex items-center gap-0.5 text-sm">
          <div
            ref={feats.wrapRef}
            className="relative"
            onMouseEnter={feats.openNow}
            onMouseLeave={feats.scheduleClose}
          >
            <button
              type="button"
              aria-haspopup="true"
              aria-expanded={feats.open}
              onClick={() => feats.setOpen((v) => !v)}
              onFocus={feats.openNow}
              className="px-3 py-2 text-muted-foreground hover:text-foreground transition flex items-center gap-1"
            >
              Öne Çıkanlar{" "}
              <ChevronDown
                className={`h-3.5 w-3.5 transition-transform ${feats.open ? "rotate-180" : ""}`}
              />
            </button>
            {feats.open && (
              <div
                onMouseEnter={feats.openNow}
                onMouseLeave={feats.scheduleClose}
                className="absolute top-full left-0 pt-2 z-50"
              >
                <div
                  role="menu"
                  className="w-[720px] rounded-2xl border border-hairline bg-card/95 backdrop-blur-xl shadow-2xl p-4 text-left animate-in fade-in slide-in-from-top-2"
                >
                  <div className="grid grid-cols-2 gap-1">
                    {megaItems.map((m) => (
                      <a
                        key={m.title}
                        href={m.href}
                        role="menuitem"
                        onClick={() => feats.setOpen(false)}
                        className="flex gap-3 p-3 rounded-xl hover:bg-surface transition group"
                      >
                        <div className="h-9 w-9 rounded-lg bg-surface-2 grid place-items-center shrink-0 transition group-hover:bg-cobalt-soft">
                          <m.icon
                            className="h-4 w-4 text-muted-foreground transition group-hover:text-cobalt"
                            strokeWidth={1.75}
                          />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-foreground transition group-hover:text-cobalt">
                            {m.title}
                          </div>
                          <div className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                            {m.desc}
                          </div>
                        </div>
                      </a>
                    ))}
                  </div>
                  <a
                    href="#ai-growth-advisor"
                    role="menuitem"
                    onClick={() => feats.setOpen(false)}
                    className="mt-2 flex items-center justify-between px-3 py-2.5 rounded-xl border-t border-hairline text-sm text-cobalt hover:bg-surface transition"
                  >
                    Tüm özellikleri keşfet <ArrowRight className="h-4 w-4" />
                  </a>
                </div>
              </div>
            )}
          </div>

          <a
            href="#free-aso-tools"
            className="px-3 py-2 text-muted-foreground hover:text-foreground transition"
          >
            Ücretsiz Araçlar
          </a>
          <a
            href="#top-apps"
            className="px-3 py-2 text-muted-foreground hover:text-foreground transition"
          >
            En İyi Uygulamalar
          </a>
          <a
            href="#pricing"
            className="px-3 py-2 text-muted-foreground hover:text-foreground transition"
          >
            Fiyatlandırma
          </a>

          <div
            ref={res.wrapRef}
            className="relative"
            onMouseEnter={res.openNow}
            onMouseLeave={res.scheduleClose}
          >
            <button
              type="button"
              aria-haspopup="true"
              aria-expanded={res.open}
              onClick={() => res.setOpen((v) => !v)}
              onFocus={res.openNow}
              className="px-3 py-2 text-muted-foreground hover:text-foreground transition flex items-center gap-1"
            >
              Kaynaklar{" "}
              <ChevronDown
                className={`h-3.5 w-3.5 transition-transform ${res.open ? "rotate-180" : ""}`}
              />
            </button>
            {res.open && (
              <div
                onMouseEnter={res.openNow}
                onMouseLeave={res.scheduleClose}
                className="absolute top-full right-0 pt-2 z-50"
              >
                <div
                  role="menu"
                  className="w-[320px] rounded-2xl border border-hairline bg-card/95 backdrop-blur-xl shadow-2xl p-2 text-left animate-in fade-in slide-in-from-top-2"
                >
                  {resourceItems.map((r0) => (
                    <a
                      key={r0.title}
                      href={r0.href}
                      role="menuitem"
                      onClick={() => res.setOpen(false)}
                      className="flex gap-3 p-3 rounded-xl hover:bg-surface transition group"
                    >
                      <div className="h-9 w-9 rounded-lg bg-surface-2 grid place-items-center shrink-0 transition group-hover:bg-cobalt-soft">
                        <r0.icon
                          className="h-4 w-4 text-muted-foreground transition group-hover:text-cobalt"
                          strokeWidth={1.75}
                        />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-foreground transition group-hover:text-cobalt">
                          {r0.title}
                        </div>
                        <div className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                          {r0.desc}
                        </div>
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        </nav>

        <div className="flex items-center gap-1">
          <button className="hidden sm:inline-flex h-9 items-center text-sm text-muted-foreground hover:text-foreground px-3 rounded-lg transition-colors duration-200">
            Giriş Yap
          </button>
          <button className="hidden sm:inline-flex h-9 items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground px-3 rounded-lg hover:bg-surface transition-colors duration-200">
            <Play className="h-3.5 w-3.5" strokeWidth={1.75} />
            Demo
          </button>
          <button className="relative inline-flex h-9 items-center gap-1.5 text-sm font-medium text-foreground px-4 rounded-lg bg-surface-2 border border-hairline hover:border-cobalt/50 hover:bg-surface-3 transition-all duration-200 group">
            <span className="h-1.5 w-1.5 rounded-full bg-cobalt shadow-[0_0_8px_var(--cobalt)]" />
            Başla
            <ArrowRight
              className="h-3.5 w-3.5 opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all duration-200"
              strokeWidth={1.75}
            />
          </button>
        </div>
      </div>
    </header>
  );
}

function FloatingNav() {
  const [state, setState] = useState<{ atTop: boolean; atBottom: boolean }>({
    atTop: true,
    atBottom: false,
  });
  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      setState({ atTop: y < 160, atBottom: max - y < 160 });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  const reduce = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const toTop = () => window.scrollTo({ top: 0, behavior: reduce() ? "auto" : "smooth" });
  const toBottom = () =>
    window.scrollTo({
      top: document.documentElement.scrollHeight,
      behavior: reduce() ? "auto" : "smooth",
    });
  return (
    <div className="fixed bottom-5 right-5 z-40 flex flex-col gap-2">
      <button
        type="button"
        aria-label="Sayfanın en üstüne git"
        onClick={toTop}
        disabled={state.atTop}
        className="h-10 w-10 rounded-full border border-border bg-card/80 backdrop-blur-xl grid place-items-center text-muted-foreground hover:text-foreground hover:border-foreground/30 transition disabled:opacity-30 disabled:pointer-events-none shadow-lg"
      >
        <ArrowUp className="h-4 w-4" />
      </button>
      <button
        type="button"
        aria-label="Sayfanın en altına git"
        onClick={toBottom}
        disabled={state.atBottom}
        className="h-10 w-10 rounded-full border border-border bg-card/80 backdrop-blur-xl grid place-items-center text-muted-foreground hover:text-foreground hover:border-foreground/30 transition disabled:opacity-30 disabled:pointer-events-none shadow-lg"
      >
        <ArrowDown className="h-4 w-4" />
      </button>
    </div>
  );
}

/* -------------------------------- HERO -------------------------------- */

function Hero() {
  return (
    <section className="relative overflow-hidden noise">
      <div className="absolute inset-0 -z-10 bg-radial-cobalt" />
      <div className="absolute inset-0 -z-10 bg-grid [mask-image:radial-gradient(ellipse_at_center,black_15%,transparent_70%)]" />
      {/* Signal-path atmosphere */}
      <svg
        aria-hidden
        className="absolute inset-x-0 top-0 -z-10 w-full h-[560px] opacity-[0.35]"
        viewBox="0 0 1440 560"
        fill="none"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="sg1" x1="0" x2="1" y1="0" y2="0">
            <stop offset="0%" stopColor="var(--cobalt)" stopOpacity="0" />
            <stop offset="50%" stopColor="var(--cobalt)" stopOpacity="0.8" />
            <stop offset="100%" stopColor="var(--violet)" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="sg2" x1="0" x2="1" y1="0" y2="0">
            <stop offset="0%" stopColor="var(--violet)" stopOpacity="0" />
            <stop offset="50%" stopColor="var(--violet)" stopOpacity="0.6" />
            <stop offset="100%" stopColor="var(--cobalt)" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path
          d="M0,180 C240,120 480,260 720,220 C960,180 1200,300 1440,240"
          stroke="url(#sg1)"
          strokeWidth="1"
          fill="none"
        />
        <path
          d="M0,340 C240,400 520,300 780,360 C1040,420 1240,340 1440,400"
          stroke="url(#sg2)"
          strokeWidth="1"
          fill="none"
        />
        <circle cx="720" cy="220" r="2.5" fill="var(--cobalt)" className="signal-dot" />
        <circle
          cx="1040"
          cy="380"
          r="2"
          fill="var(--violet)"
          className="signal-dot"
          style={{ animationDelay: "1.2s" }}
        />
        <circle
          cx="360"
          cy="150"
          r="1.8"
          fill="var(--cobalt)"
          className="signal-dot"
          style={{ animationDelay: "0.6s" }}
        />
      </svg>

      {/* Signal-convergence signature — four inputs merge into one growth decision */}
      <div
        aria-hidden
        className="pointer-events-none hidden lg:block absolute top-28 right-4 xl:right-10 w-[400px] h-[240px] opacity-90"
      >
        <svg viewBox="0 0 400 240" className="w-full h-full overflow-visible">
          <defs>
            <linearGradient id="conv-c" x1="0" x2="1">
              <stop offset="0" stopColor="var(--cobalt)" stopOpacity="0" />
              <stop offset="1" stopColor="var(--cobalt)" stopOpacity="0.7" />
            </linearGradient>
            <linearGradient id="conv-v" x1="0" x2="1">
              <stop offset="0" stopColor="var(--violet)" stopOpacity="0" />
              <stop offset="1" stopColor="var(--violet)" stopOpacity="0.7" />
            </linearGradient>
          </defs>
          {/* subtle grid fragment */}
          <g stroke="color-mix(in oklab, white 5%, transparent)" strokeWidth="0.5">
            {Array.from({ length: 5 }).map((_, i) => (
              <line
                key={`h${i}`}
                x1="0"
                x2="400"
                y1="30"
                y2="30"
                transform={`translate(0 ${i * 45})`}
              />
            ))}
          </g>
          {/* four source nodes → one hub */}
          {[
            { y: 24, label: "Keyword Opportunity", g: "conv-c" },
            { y: 78, label: "Competitor Change", g: "conv-c" },
            { y: 132, label: "Market Opportunity", g: "conv-v" },
            { y: 186, label: "Review Signal", g: "conv-v" },
          ].map((n, i) => (
            <g key={i}>
              <path
                d={`M20 ${n.y} C 130 ${n.y}, 180 120, 250 120`}
                stroke={`url(#${n.g})`}
                strokeWidth="1"
                fill="none"
              />
              <circle
                cx="20"
                cy={n.y}
                r="2.5"
                fill={n.g === "conv-c" ? "var(--cobalt)" : "var(--violet)"}
                className="signal-node"
                style={{ animationDelay: `${i * 0.4}s` }}
              />
              <text
                x="30"
                y={n.y + 3}
                fontSize="9"
                fill="color-mix(in oklab, white 55%, transparent)"
                fontFamily="var(--font-mono)"
                letterSpacing="0.06em"
              >
                {n.label}
              </text>
            </g>
          ))}
          {/* hub — moved left to keep label inside viewport */}
          <circle
            cx="250"
            cy="120"
            r="14"
            fill="none"
            stroke="var(--cobalt)"
            strokeOpacity="0.35"
            strokeWidth="1"
          />
          <circle
            cx="250"
            cy="120"
            r="22"
            fill="none"
            stroke="var(--cobalt)"
            strokeOpacity="0.15"
            strokeWidth="1"
          />
          <circle cx="250" cy="120" r="4" fill="var(--cobalt)" className="signal-node" />
          <text
            x="278"
            y="117"
            fontSize="10"
            fill="color-mix(in oklab, white 78%, transparent)"
            fontFamily="var(--font-mono)"
            letterSpacing="0.14em"
            fontWeight="600"
          >
            GROWTH
          </text>
          <text
            x="278"
            y="130"
            fontSize="10"
            fill="color-mix(in oklab, white 58%, transparent)"
            fontFamily="var(--font-mono)"
            letterSpacing="0.14em"
          >
            DECISION
          </text>
        </svg>
      </div>

      <div className="mx-auto max-w-7xl px-6 pt-24 pb-24 lg:pt-32 lg:pb-32">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2.5 rounded-full bg-surface/50 backdrop-blur px-3 py-1 text-xs border border-hairline">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full rounded-full bg-cobalt opacity-60 animate-ping" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-cobalt" />
            </span>
            <span className="font-mono text-[10px] tracking-[0.14em] uppercase text-muted-foreground">
              New
            </span>
            <span className="h-3 w-px bg-hairline" />
            <span className="text-foreground/90">AI Growth Advisor 2.0</span>
            <ArrowRight className="h-3 w-3 text-muted-foreground" />
          </div>
          <h1 className="font-editorial mt-8 text-[2.75rem] sm:text-6xl lg:text-[5.25rem] font-semibold tracking-[-0.035em] leading-[0.98]">
            Uygulamanızın bir sonraki
            <br />
            <span className="bg-gradient-to-br from-white via-white to-cobalt bg-clip-text text-transparent">
              büyüme hamlesini bilin.
            </span>
          </h1>
          <p className="mt-7 text-lg lg:text-xl text-muted-foreground max-w-2xl leading-relaxed">
            Anahtar kelimelerden rakiplere, pazarlardan kullanıcı yorumlarına kadar tüm önemli
            sinyalleri tek yerde analiz edin. Yapay zekâ verilerinizi yorumlasın ve size öncelikli
            büyüme aksiyonlarını göstersin.
          </p>
          <div className="mt-9 flex flex-wrap items-center gap-3">
            <button className="relative inline-flex items-center gap-2 h-11 px-5 rounded-xl bg-surface-2 border border-hairline hover:border-cobalt/50 hover:bg-surface-3 transition group text-sm font-medium">
              <span className="h-1.5 w-1.5 rounded-full bg-cobalt shadow-[0_0_10px_var(--cobalt)]" />
              Başla
              <ArrowRight className="h-4 w-4 opacity-70 group-hover:translate-x-0.5 transition" />
            </button>
            <button className="inline-flex items-center gap-2 h-11 px-5 rounded-xl border border-hairline hover:bg-surface/60 transition text-sm text-foreground/90">
              <Play className="h-4 w-4" /> Demoyu İncele
            </button>
            <a
              href="#free-aso-tools"
              className="text-sm text-muted-foreground hover:text-foreground transition inline-flex items-center gap-1 ml-1"
            >
              Ücretsiz ASO Araçlarını Keşfet <ArrowUpRight className="h-3.5 w-3.5" />
            </a>
          </div>
        </div>

        <div className="mt-20 lg:mt-24 relative">
          {/* subtle connective line from headline to product */}
          <div
            aria-hidden
            className="absolute -top-12 left-8 h-12 w-px bg-gradient-to-b from-transparent via-hairline to-cobalt/40"
          />
          <HeroCommandCenter />
        </div>
      </div>
    </section>
  );
}

function HeroCommandCenter() {
  return (
    <div className="relative rounded-2xl border border-border bg-card/60 backdrop-blur-xl overflow-hidden shadow-[0_20px_80px_-20px_rgba(0,0,0,0.6)]">
      <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-cobalt/20 blur-3xl" />
      <div className="absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-violet/15 blur-3xl" />

      <div className="relative grid lg:grid-cols-[1fr_1.4fr] gap-0">
        {/* Left: today's action */}
        <div className="p-6 lg:p-8 border-b lg:border-b-0 lg:border-r border-border">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <div className="h-2 w-2 rounded-full bg-success" />
            <span className="uppercase tracking-widest">Bugün ne yapmalısın?</span>
          </div>
          <div className="mt-5 flex items-baseline gap-2">
            <span className="text-6xl font-semibold tracking-tight">3</span>
            <span className="text-sm text-muted-foreground">öncelikli sinyal</span>
          </div>

          <div className="mt-6 space-y-3">
            {[
              { pct: 92, label: "Fırsat skoru", color: "bg-success" },
              { pct: 68, label: "Rekabet baskısı", color: "bg-warning" },
              { pct: 41, label: "Risk sinyali", color: "bg-danger" },
            ].map((r) => (
              <div key={r.label}>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-muted-foreground">{r.label}</span>
                  <span className="tabular-nums">{r.pct}</span>
                </div>
                <div className="h-1.5 rounded-full bg-surface overflow-hidden">
                  <div
                    className={`h-full ${r.color} rounded-full`}
                    style={{ width: `${r.pct}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 rounded-xl border border-border bg-surface/50 p-4">
            <div className="flex items-center gap-2 text-xs text-violet">
              <Brain className="h-3.5 w-3.5" /> Yapay Zekâ Büyüme Danışmanı
            </div>
            <p className="mt-2 text-sm leading-relaxed text-foreground/90">
              Bu 3 sinyal bugünkü büyüme fırsatınızı özetliyor. Öncelikli olarak fırsat keşfini
              incelemenizi öneririm.
            </p>
          </div>
        </div>

        {/* Right: signals */}
        <div className="p-6 lg:p-8 space-y-3">
          <Signal
            tone="success"
            icon={<Target className="h-4 w-4" />}
            title="8 yeni anahtar kelime fırsatı bulundu"
            body="Rakipleriniz bu kelimelerde görünürken uygulamanız henüz sıralanmıyor."
            cta="Fırsatları İncele"
            chart={<Sparkline data={[6, 7, 7, 9, 10, 12, 14, 15, 17, 18]} />}
          />
          <Signal
            tone="cobalt"
            icon={<Radar className="h-4 w-4" />}
            title="Rakibiniz metadata güncelledi"
            body="Güncellemeden sonra 14 önemli anahtar kelimede görünürlük kazandı."
            cta="Değişikliği İncele"
            chart={<Sparkline data={[10, 11, 10, 12, 13, 15, 18, 20, 22, 24]} accent />}
          />
          <Signal
            tone="violet"
            icon={<Globe2 className="h-4 w-4" />}
            title="Suudi Arabistan'da yeni pazar fırsatı"
            body="Uygulamanızın bu pazarda yüksek büyüme potansiyeli bulunuyor."
            cta="Pazarı İncele"
            chart={<Sparkline data={[3, 5, 4, 7, 9, 10, 13, 15, 18, 22]} violet />}
          />
        </div>
      </div>
    </div>
  );
}

function Signal({
  tone,
  icon,
  title,
  body,
  cta,
  chart,
}: {
  tone: "success" | "cobalt" | "violet";
  icon: React.ReactNode;
  title: string;
  body: string;
  cta: string;
  chart: React.ReactNode;
}) {
  const toneMap = {
    success: "bg-success/10 text-success border-success/20",
    cobalt: "bg-cobalt/10 text-cobalt border-cobalt/20",
    violet: "bg-violet/10 text-violet border-violet/20",
  };
  return (
    <div className="group rounded-xl border border-border bg-surface/40 hover:bg-surface/70 transition p-4 flex gap-4 items-center">
      <div
        className={`h-9 w-9 rounded-lg grid place-items-center border ${toneMap[tone]} shrink-0`}
      >
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium text-foreground">{title}</div>
        <div className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{body}</div>
      </div>
      <div className="hidden sm:block w-20 h-8 shrink-0">{chart}</div>
      <button className="h-8 min-w-[130px] justify-center text-xs text-muted-foreground hover:text-foreground border border-border rounded-lg px-3 hover:border-foreground/40 transition shrink-0 hidden md:inline-flex items-center gap-1">
        {cta} <ArrowRight className="h-3 w-3" />
      </button>
    </div>
  );
}

function Sparkline({
  data,
  labels,
  accent,
  violet,
  valueLabel = "Değer",
  invert = false,
}: {
  data: number[];
  labels?: string[];
  accent?: boolean;
  violet?: boolean;
  valueLabel?: string;
  invert?: boolean;
}) {
  const dmax = Math.max(...data),
    dmin = Math.min(...data);
  const [hover, setHover] = useState<number | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * 100;
    // Standard: high v = high on chart. Invert (e.g. rank): low v = high on chart.
    const norm = (v - dmin) / Math.max(dmax - dmin, 1);
    const y = invert ? norm * 100 : 100 - norm * 100;
    return { x, y, v, i };
  });
  const polyStr = pts.map((p) => `${p.x},${p.y}`).join(" ");
  const color = violet ? "var(--violet)" : accent ? "var(--cobalt)" : "var(--success)";
  const gid = `g-${violet ? "v" : accent ? "c" : "s"}-${data.length}-${dmax}-${invert ? "i" : "n"}`;

  const onMove = (e: React.MouseEvent<SVGSVGElement>) => {
    const rect = svgRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    let closest = 0,
      best = Infinity;
    pts.forEach((p) => {
      const d = Math.abs(p.x - x);
      if (d < best) {
        best = d;
        closest = p.i;
      }
    });
    setHover(closest);
  };

  const active = hover !== null ? pts[hover] : null;

  return (
    <div className="relative w-full h-full">
      <svg
        ref={svgRef}
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        className="w-full h-full"
        onMouseMove={onMove}
        onMouseLeave={() => setHover(null)}
        onTouchStart={(e) => {
          const t = e.touches[0];
          const rect = svgRef.current?.getBoundingClientRect();
          if (!rect) return;
          const x = ((t.clientX - rect.left) / rect.width) * 100;
          let closest = 0,
            best = Infinity;
          pts.forEach((p) => {
            const d = Math.abs(p.x - x);
            if (d < best) {
              best = d;
              closest = p.i;
            }
          });
          setHover(closest);
        }}
      >
        <defs>
          <linearGradient id={gid} x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={invert ? 0 : 0.4} />
            <stop offset="100%" stopColor={color} stopOpacity={invert ? 0.4 : 0} />
          </linearGradient>
        </defs>
        <polyline
          points={polyStr}
          fill="none"
          stroke={color}
          strokeWidth="2"
          vectorEffect="non-scaling-stroke"
        />
        <polygon
          points={invert ? `0,0 ${polyStr} 100,0` : `0,100 ${polyStr} 100,100`}
          fill={`url(#${gid})`}
        />
        {/* baseline hint for inverted (rank) mode */}
        {invert && (
          <text
            x="2"
            y="8"
            fontSize="6"
            fill="color-mix(in oklab, white 40%, transparent)"
            fontFamily="var(--font-mono)"
          >
            ↑ daha iyi sıralama
          </text>
        )}
        {active && (
          <>
            <line
              x1={active.x}
              x2={active.x}
              y1="0"
              y2="100"
              stroke="var(--foreground)"
              strokeOpacity="0.25"
              strokeWidth="1"
              vectorEffect="non-scaling-stroke"
            />
            <circle
              cx={active.x}
              cy={active.y}
              r="2.5"
              fill={color}
              stroke="var(--background)"
              strokeWidth="1"
              vectorEffect="non-scaling-stroke"
            />
          </>
        )}
      </svg>
      {active && (
        <div
          className="pointer-events-none absolute z-10 px-2 py-1 rounded-md border border-border bg-card/95 backdrop-blur text-[10px] leading-tight shadow-lg whitespace-nowrap"
          style={{
            left: `${Math.min(Math.max(active.x, 10), 90)}%`,
            top: `${Math.max(active.y - 6, 0)}%`,
            transform: "translate(-50%, -100%)",
          }}
        >
          {labels?.[active.i] && <div className="text-muted-foreground">{labels[active.i]}</div>}
          <div className="tabular-nums font-medium">
            {valueLabel}: {active.v}
          </div>
        </div>
      )}
    </div>
  );
}

/* ---------------------------- TRUST STRIP ---------------------------- */

function TrustStrip() {
  // Placeholder app entries — replace with real customer apps as they onboard.
  // Duplicated in DOM to create a seamless infinite loop (visual only; not additional customers).
  const apps: { name: string; dev?: string; grad: string; initial: string }[] = [
    { name: "App One", dev: "Studio Placeholder", grad: "from-cobalt to-violet", initial: "A" },
    { name: "App Two", dev: "Studio Placeholder", grad: "from-violet to-cobalt", initial: "B" },
    {
      name: "App Three",
      dev: "Studio Placeholder",
      grad: "from-cobalt to-cobalt/40",
      initial: "C",
    },
    {
      name: "App Four",
      dev: "Studio Placeholder",
      grad: "from-violet/70 to-violet/30",
      initial: "D",
    },
    {
      name: "App Five",
      dev: "Studio Placeholder",
      grad: "from-cobalt/70 to-violet/50",
      initial: "E",
    },
    {
      name: "App Six",
      dev: "Studio Placeholder",
      grad: "from-violet/60 to-cobalt/50",
      initial: "F",
    },
    {
      name: "App Seven",
      dev: "Studio Placeholder",
      grad: "from-cobalt/80 to-violet/60",
      initial: "G",
    },
    {
      name: "App Eight",
      dev: "Studio Placeholder",
      grad: "from-violet/80 to-cobalt/70",
      initial: "H",
    },
  ];
  const loop = [...apps, ...apps];
  return (
    <section className="border-y border-hairline bg-surface/15">
      <div className="mx-auto max-w-7xl px-6 py-12">
        <p className="text-center text-[11px] font-mono uppercase tracking-[0.2em] text-muted-foreground">
          Uygulama ekiplerinin büyüme kararları için tasarlandı
        </p>
        <div className="relative mt-8 overflow-hidden">
          {/* edge fades */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-background to-transparent z-10"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-background to-transparent z-10"
          />
          <div className="marquee-track flex items-center gap-10 w-max">
            {loop.map((a, i) => (
              <div
                key={`${a.name}-${i}`}
                className="group flex items-center gap-3 px-2 opacity-70 hover:opacity-100 transition-opacity duration-200"
                aria-hidden={i >= apps.length}
              >
                <div
                  className={`h-12 w-12 rounded-[14px] bg-gradient-to-br ${a.grad} grid place-items-center text-primary-foreground text-base font-semibold shadow-sm shrink-0`}
                >
                  {a.initial}
                </div>
                <div className="leading-tight">
                  <div className="text-sm font-medium text-foreground/90">{a.name}</div>
                  {a.dev && <div className="text-[10px] text-muted-foreground">{a.dev}</div>}
                </div>
              </div>
            ))}
          </div>
        </div>
        <p className="mt-4 text-center text-[10px] text-muted-foreground/70">
          Placeholder — gerçek müşteri uygulamaları eklendikçe burada yer alacak.
        </p>
      </div>
    </section>
  );
}

/* ---------------------------- PHILOSOPHY ---------------------------- */

function Philosophy() {
  const steps = [
    {
      icon: Compass,
      t: "Fırsatı Bul",
      d: "Yeni anahtar kelimeleri, pazarları ve büyüme sinyallerini keşfedin.",
    },
    {
      icon: Brain,
      t: "Nedenini Anla",
      d: "Sıralamaların neden değiştiğini ve rakiplerin ne yaptığını görün.",
    },
    {
      icon: Wand2,
      t: "Harekete Geç",
      d: "AI önerilerini uygulayın ve mağaza içeriklerinizi optimize edin.",
    },
    {
      icon: Activity,
      t: "Sonucu Ölç",
      d: "Yaptığınız değişikliklerin performansa etkisini görün.",
    },
  ];
  return (
    <section className="mx-auto max-w-7xl px-6 py-24 lg:py-32">
      <div className="max-w-2xl">
        <SectionEyebrow icon={Rocket}>Ürün Felsefesi</SectionEyebrow>
        <h2 className="mt-4 text-4xl sm:text-5xl font-semibold tracking-tight">
          Yalnızca veri göstermez.
          <br />
          <span className="text-muted-foreground">Ne yapacağınızı gösterir.</span>
        </h2>
      </div>

      <div className="mt-16 grid lg:grid-cols-4 gap-px bg-border rounded-2xl overflow-hidden border border-border cursor-default select-none">
        {steps.map((s, i) => (
          <div key={s.t} className="relative bg-card p-8 transition">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl border border-border bg-surface grid place-items-center">
                <s.icon className="h-5 w-5 text-cobalt" />
              </div>
              <span className="text-xs tabular-nums text-muted-foreground">0{i + 1}</span>
            </div>
            <h3 className="mt-6 text-xl font-semibold tracking-tight">{s.t}</h3>
            <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{s.d}</p>
            {i < steps.length - 1 && (
              <ArrowRight className="hidden lg:block absolute -right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-border bg-background rounded-full z-10" />
            )}
          </div>
        ))}
      </div>
    </section>
  );
}

function SectionEyebrow({
  icon: Icon,
  children,
}: {
  icon: React.ElementType;
  children: React.ReactNode;
}) {
  return (
    <div className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-muted-foreground">
      <Icon className="h-3.5 w-3.5 text-cobalt" /> {children}
    </div>
  );
}

/* ---------------------------- AI ADVISOR ---------------------------- */

const AI_ANSWERS: {
  q: string;
  answer: React.ReactNode;
  evidence: {
    icon: React.ElementType;
    label: string;
    tone: "success" | "warning" | "danger" | "cobalt";
  }[];
}[] = [
  {
    q: "Organik indirmelerim neden düştü?",
    answer: (
      <>
        Organik görünürlüğünüzdeki düşüşün ana nedeni{" "}
        <mark className="bg-violet-soft text-foreground px-1 rounded">
          8 önemli anahtar kelimede
        </mark>{" "}
        yaşanan sıralama kaybı. App Store Search kaynaklı indirmeler{" "}
        <span className="text-danger">%17 azalırken</span>, trafiğiniz büyük ölçüde sabit kaldı.
      </>
    ),
    evidence: [
      { icon: ArrowDown, label: "8 anahtar kelime sıralama kaybetti", tone: "danger" },
      { icon: TrendingUp, label: "Arama kaynaklı indirmeler −%17", tone: "danger" },
      { icon: Radar, label: "2 rakip metadata güncellemesi", tone: "warning" },
      { icon: MessageSquare, label: "Yorum durumu stabil", tone: "success" },
    ],
  },
  {
    q: "Önümüzdeki ay hangi 10 kelimeye odaklanmalıyım?",
    answer: (
      <>
        Önümüzdeki 30 gün için{" "}
        <mark className="bg-violet-soft text-foreground px-1 rounded">
          10 yüksek potansiyelli kelime
        </mark>{" "}
        önceliklendirildi. Ortalama zorluk düşük ve alaka güçlü — alt-başlık ve anahtar kelime
        alanına eklendiğinde ilk 20'ye giriş olasılığı yüksek.
      </>
    ),
    evidence: [
      { icon: Target, label: "10 aday kelime · ort. difficulty 42", tone: "success" },
      { icon: TrendingUp, label: "Ortalama fırsat skoru 76 ", tone: "success" },
      { icon: Search, label: "7 kelime rakiplerinizde sıralı", tone: "warning" },
      { icon: Brain, label: "Metadata alanları müsait", tone: "cobalt" },
    ],
  },
  {
    q: "Rakiplerim son 30 günde ne değiştirdi?",
    answer: (
      <>
        Takip ettiğiniz 6 rakipten{" "}
        <mark className="bg-violet-soft text-foreground px-1 rounded">4'ü</mark> son 30 günde
        metadata veya kreatif güncelledi. FitTrack Pro güncellemesi sonrası 14 kelimede görünürlük
        kazandı — en dikkat çekici hareket bu.
      </>
    ),
    evidence: [
      { icon: Radar, label: "4 rakip metadata güncelledi", tone: "warning" },
      { icon: Layers, label: "3 rakip screenshot değiştirdi", tone: "warning" },
      { icon: Calendar, label: "2 yeni In-App Event yayını", tone: "cobalt" },
      { icon: TrendingUp, label: "FitTrack Pro +14 anahtar kelime ", tone: "success" },
    ],
  },
  {
    q: "Son metadata güncellemem işe yaradı mı?",
    answer: (
      <>
        14 Mayıs güncellemesi net pozitif etki üretti. Görünürlük{" "}
        <span className="text-success">62 → 74</span> yükseldi, Search downloads{" "}
        <span className="text-success">+21%</span> arttı. Dönüşüm oranındaki değişim istatistiksel
        gürültü sınırlarında.
      </>
    ),
    evidence: [
      { icon: TrendingUp, label: "Görünürlük 62 → 74", tone: "success" },
      { icon: ArrowUp, label: "Arama kaynaklı indirmeler +21%", tone: "success" },
      { icon: Activity, label: "Dönüşüm +0.3 puan · Belirgin Değil", tone: "warning" },
      { icon: ShieldCheck, label: "Yönergelere uyum korundu", tone: "success" },
    ],
  },
  {
    q: "Bir sonraki büyüme pazarım hangisi olmalı?",
    answer: (
      <>
        Mevcut verilere göre Suudi Arabistan en güçlü genişleme adayı. Talep yüksek, rekabet
        seviyesi mevcut uygulama gücünüzle yönetilebilir ve sıralama potansiyeli güçlü. Lokalizasyon
        açığının belirgin olması da doğru uyarlamayla ek büyüme alanı oluşturuyor.
      </>
    ),
    evidence: [
      { icon: Trophy, label: "Fırsat Puanı 92/100", tone: "success" },
      { icon: TrendingUp, label: "Talep 88\u00a0· Yüksek\u00a0", tone: "success" },
      { icon: Target, label: "Rekabet: 42 · Orta-Düşük", tone: "cobalt" },
      { icon: Languages, label: "Sıralama Potansiyeli: 81", tone: "warning" },
    ],
  },
  {
    q: "Apple Ads'te iyi dönüşüm alan ancak organikte zayıf olduğum kelimeler hangileri?",
    answer: (
      <>
        Apple Ads’te %8’in üzerinde dönüşüm oranına sahip{" "}
        <mark className="bg-violet-soft text-foreground px-1 rounded">6 anahtar kelimenin</mark>{" "}
        organik ortalama sırası 28. “Kalori sayacı” ve “adım sayar” en güçlü fırsat adayları olarak
        öne çıkıyor. Bu kelimelerin metadata kapsamını güçlendirmek organik görünürlük açığını
        azaltabilir.
      </>
    ),
    evidence: [
      { icon: Zap, label: "6 anahtar kelimede reklam dönüşüm oranı %8+", tone: "success" },
      { icon: Search, label: "Organik ortalama sıra: #28", tone: "warning" },
      { icon: Target, label: "Kalori sayacı · Edinme başına maliyet: 2,10 $", tone: "cobalt" },
      { icon: TrendingUp, label: "2 fırsat anahtar kelimesi metadata dışında", tone: "success" },
    ],
  },
];

function AIAdvisor() {
  const [idx, setIdx] = useState(0);
  const cur = AI_ANSWERS[idx];
  return (
    <section id="ai-growth-advisor" className="relative border-y border-border atmos-violet">
      <div className="absolute inset-0 -z-0 bg-grid opacity-20 [mask-image:radial-gradient(ellipse_at_center,black,transparent_70%)]" />
      <div className="relative mx-auto max-w-7xl px-6 py-24 lg:py-32">
        <div className="max-w-3xl">
          <SectionEyebrow icon={Brain}>Yapay Zekâ Büyüme Danışmanı</SectionEyebrow>
          <h2 className="mt-4 text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-tight leading-[1.05]">
            Nedenini sorun.
            <br />
            <span className="text-violet">Net cevaplar alın.</span>
          </h2>
          <p className="mt-5 text-base lg:text-lg text-muted-foreground max-w-2xl">
            AI metrik uydurmaz. Platform verinizi analiz eder ve her sonucun arkasındaki kanıtı
            gösterir.
          </p>
        </div>

        <div className="mt-14 grid lg:grid-cols-[1fr_1.2fr] gap-6">
          <div className="rounded-2xl border border-border bg-card p-6">
            <div className="text-xs uppercase tracking-widest text-muted-foreground">
              Örnek Sorular
            </div>
            <div className="mt-4 space-y-2">
              {AI_ANSWERS.map((a, i) => {
                const active = i === idx;
                return (
                  <button
                    key={a.q}
                    type="button"
                    aria-pressed={active}
                    onClick={() => setIdx(i)}
                    className={`w-full text-left px-4 py-3 rounded-xl border transition text-sm flex items-center justify-between group ${active ? "border-violet/40 bg-violet-soft" : "border-border bg-surface/40 hover:bg-surface"}`}
                  >
                    <span className="flex items-center gap-2">
                      <MessageSquare
                        className={`h-3.5 w-3.5 ${active ? "text-violet" : "text-muted-foreground"}`}
                      />{" "}
                      {a.q}
                    </span>
                    <ArrowRight
                      className={`h-3.5 w-3.5 transition ${active ? "opacity-100 text-violet" : "opacity-0 group-hover:opacity-100"}`}
                    />
                  </button>
                );
              })}
            </div>
          </div>

          <div
            key={idx}
            className="rounded-2xl border border-border bg-card overflow-hidden animate-in fade-in duration-300"
          >
            <div className="p-6 border-b border-border">
              <div className="flex items-center gap-2 text-xs">
                <div className="h-6 w-6 rounded-md bg-violet/15 grid place-items-center">
                  <Brain className="h-3.5 w-3.5 text-violet" />
                </div>
                <span className="text-violet font-medium">AI Cevabı</span>
                <span className="text-muted-foreground ml-auto">2s önce</span>
              </div>
              <p className="mt-4 text-base leading-relaxed">{cur.answer}</p>
            </div>
            <div className="p-6 bg-surface/30">
              <div className="text-xs uppercase tracking-widest text-muted-foreground mb-4">
                Kanıtlar
              </div>
              <div className="grid sm:grid-cols-2 gap-3">
                {cur.evidence.map((e, i) => (
                  <EvidenceCard key={i} icon={e.icon} label={e.label} tone={e.tone} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function EvidenceCard({
  icon: Icon,
  label,
  tone,
}: {
  icon: React.ElementType;
  label: string;
  tone: "success" | "warning" | "danger" | "cobalt";
}) {
  const t =
    tone === "success"
      ? "text-success bg-success/10 border-success/20"
      : tone === "warning"
        ? "text-warning bg-warning/10 border-warning/20"
        : tone === "cobalt"
          ? "text-cobalt bg-cobalt/10 border-cobalt/20"
          : "text-danger bg-danger/10 border-danger/20";
  return (
    <div className="flex items-center gap-3 rounded-xl border border-border bg-background/40 p-3">
      <div className={`h-8 w-8 rounded-lg grid place-items-center border ${t}`}>
        <Icon className="h-4 w-4" />
      </div>
      <span className="text-sm">{label}</span>
    </div>
  );
}

/* ------------------------- KEYWORD INTELLIGENCE ------------------------- */

const KW_DATA = [
  {
    kw: "kalori sayacı",
    rank: 24,
    opp: "Yüksek",
    trend: "up" as const,
    potential: "Yüksek",
    vol: 82,
    diff: 41,
    rel: 92,
    dl: "3.2K/ay",
    potPct: 78,
    history: [42, 38, 36, 33, 31, 29, 28, 27, 26, 25, 24, 24],
    insight: "Rakiplerinizin sıralandığı, sizin henüz kapsamadığınız yüksek dönüşümlü bir kelime.",
  },
  {
    kw: "adım sayar",
    rank: 18,
    opp: "Yüksek",
    trend: "up" as const,
    potential: "Yüksek",
    vol: 74,
    diff: 55,
    rel: 88,
    dl: "2.6K/ay",
    potPct: 72,
    history: [30, 29, 28, 27, 26, 24, 22, 21, 20, 19, 18, 18],
    insight: "İstikrarlı yükseliş; subtitle'a eklenerek ilk 10'a girme fırsatı yüksek.",
  },
  {
    kw: "fitness uygulaması",
    rank: 7,
    opp: "Orta",
    trend: "flat" as const,
    potential: "Orta",
    vol: 68,
    diff: 72,
    rel: 80,
    dl: "1.9K/ay",
    potPct: 45,
    history: [9, 8, 8, 7, 7, 7, 7, 8, 7, 7, 7, 7],
    insight: "Yüksek rekabet; mevcut sıralamayı korumak öncelikli, agresif hedef önerilmez.",
  },
  {
    kw: "günlük antrenman",
    rank: 41,
    opp: "Yüksek",
    trend: "up" as const,
    potential: "Yüksek",
    vol: 58,
    diff: 38,
    rel: 74,
    dl: "1.4K/ay",
    potPct: 66,
    history: [55, 52, 49, 47, 46, 45, 44, 43, 42, 42, 41, 41],
    insight: "Rekabet düşük; hızlı sıralama kazanımı için ideal aday.",
  },
  {
    kw: "kilo takibi",
    rank: 12,
    opp: "Orta",
    trend: "up" as const,
    potential: "Orta",
    vol: 61,
    diff: 62,
    rel: 82,
    dl: "1.1K/ay",
    potPct: 58,
    history: [18, 17, 16, 15, 15, 14, 14, 13, 13, 12, 12, 12],
    insight: "Alaka güçlü; içerik optimizasyonu ile ilk 10 erişilebilir.",
  },
];

function KeywordIntel() {
  const [activeKw, setActiveKw] = useState(KW_DATA[0].kw);
  const active = KW_DATA.find((r) => r.kw === activeKw) ?? KW_DATA[0];

  return (
    <section id="keyword-intelligence" className="mx-auto max-w-7xl px-6 py-24 lg:py-32">
      <div className="max-w-2xl">
        <SectionEyebrow icon={Search}>ANAHTAR KELİME & FIRSAT ANALİZİ</SectionEyebrow>
        <h2 className="mt-4 text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-tight">
          Her kelime fırsat değildir
          <br />
          <span className="text-4xl sm:text-5xl lg:text-6xl text-muted-foreground">
            Doğru olanları bulun.
          </span>
        </h2>
      </div>

      <div className="mt-14 rounded-2xl border border-border bg-card overflow-hidden">
        <div className="grid lg:grid-cols-[1.5fr_1fr]">
          {/* Table */}
          <div className="border-b lg:border-b-0 lg:border-r border-border">
            <div className="grid grid-cols-[1.4fr_0.6fr_0.7fr_0.5fr_0.8fr] gap-4 px-6 py-3 border-b border-border text-[11px] uppercase tracking-widest text-muted-foreground bg-surface/30">
              <span>Anahtar Kelime</span>
              <span>Sıralama</span>
              <span>Fırsat</span>
              <span>Trend</span>
              <span>Potansiyel</span>
            </div>
            {KW_DATA.map((r) => {
              const selected = r.kw === activeKw;
              return (
                <button
                  key={r.kw}
                  type="button"
                  onClick={() => setActiveKw(r.kw)}
                  aria-pressed={selected}
                  className={`w-full text-left grid grid-cols-[1.4fr_0.6fr_0.7fr_0.5fr_0.8fr] gap-4 px-6 py-4 items-center text-sm border-b border-border last:border-0 transition ${selected ? "bg-cobalt-soft ring-1 ring-inset ring-cobalt/30" : "hover:bg-surface/40"}`}
                >
                  <span className={`font-medium truncate ${selected ? "text-foreground" : ""}`}>
                    {r.kw}
                  </span>
                  <span className="tabular-nums text-muted-foreground">#{r.rank}</span>
                  <span>
                    <span
                      className={`inline-flex text-xs px-2 py-0.5 rounded-md border ${r.opp === "Yüksek" ? "border-success/30 text-success bg-success/10" : "border-warning/30 text-warning bg-warning/10"}`}
                    >
                      {r.opp}
                    </span>
                  </span>
                  <span>
                    {r.trend === "up" ? (
                      <ArrowUp className="h-4 w-4 text-success" />
                    ) : (
                      <span className="text-muted-foreground">→</span>
                    )}
                  </span>
                  <span className="text-muted-foreground">{r.potential}</span>
                </button>
              );
            })}
          </div>

          {/* Detail panel */}
          <div key={activeKw} className="p-6 bg-surface/20 animate-in fade-in duration-300">
            <div className="text-xs uppercase tracking-widest text-muted-foreground">
              Seçili Kelime
            </div>
            <div className="mt-2 text-2xl font-semibold tracking-tight">{active.kw}</div>
            <div className="mt-1 text-sm text-muted-foreground">
              Sıralama <span className="text-foreground tabular-nums">#{active.rank}</span> ·
              Tahmini indirme {active.dl}
            </div>

            <div className="mt-6 space-y-4">
              <MetricBar label="Popülerlik" v={active.vol} />
              <MetricBar label="Zorluk" v={active.diff} tone="warning" />
              <MetricBar label="Alaka Düzeyi" v={active.rel} tone="success" />
              <MetricBar label="Sıralama Potansiyeli" v={active.potPct} tone="cobalt" />
            </div>

            <div className="mt-6 rounded-xl border border-border bg-background/40 p-4">
              <div className="flex items-baseline justify-between mb-2">
                <div className="text-xs text-muted-foreground">Sıralama hareketi · 30 gün</div>
                {(() => {
                  const first = active.history[0];
                  const last = active.history[active.history.length - 1];
                  const delta = first - last; // positive = improvement
                  return (
                    <div className="text-[11px] tabular-nums">
                      <span className="text-muted-foreground">#{first}</span>
                      <span className="mx-1 text-muted-foreground">→</span>
                      <span className="text-foreground">#{last}</span>
                      <span
                        className={`ml-2 font-medium ${delta > 0 ? "text-success" : delta < 0 ? "text-danger" : "text-muted-foreground"}`}
                      >
                        {delta > 0
                          ? `▲ ${delta} sıra iyileşme`
                          : delta < 0
                            ? `▼ ${Math.abs(delta)} sıra düşüş`
                            : "sabit"}
                      </span>
                    </div>
                  );
                })()}
              </div>
              <div className="h-16">
                <Sparkline data={active.history} accent invert valueLabel="Sıralama #" />
              </div>
            </div>

            <div className="mt-4 rounded-xl border border-cobalt/20 bg-cobalt-soft/40 p-3 text-xs text-foreground/90 leading-relaxed">
              <span className="text-cobalt font-medium">İçgörü · </span>
              {active.insight}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function MetricBar({
  label,
  v,
  tone = "default",
}: {
  label: string;
  v: number;
  tone?: "default" | "success" | "warning" | "cobalt";
}) {
  const c =
    tone === "success"
      ? "bg-success"
      : tone === "warning"
        ? "bg-warning"
        : tone === "cobalt"
          ? "bg-cobalt"
          : "bg-foreground";
  return (
    <div>
      <div className="flex justify-between text-xs mb-1.5">
        <span className="text-muted-foreground">{label}</span>
        <span className="tabular-nums">{v}</span>
      </div>
      <div className="h-1.5 rounded-full bg-surface overflow-hidden">
        <div className={`h-full ${c}`} style={{ width: `${v}%` }} />
      </div>
    </div>
  );
}

/* ------------------------- COMPETITOR TIMELINE ------------------------- */

type MiniMode = "metadata" | "creative" | "localization" | "event";

function MiniCreativeCompare() {
  const [mode, setMode] = useState<MiniMode>("creative");
  const modes: { v: MiniMode; l: string; icon: React.ElementType }[] = [
    { v: "metadata", l: "Metadata", icon: FileText },
    { v: "creative", l: "Kreatif", icon: Layers },
    { v: "localization", l: "Lokalizasyon", icon: Globe2 },
    { v: "event", l: "Store Event", icon: Calendar },
  ];

  const content: Record<
    MiniMode,
    { before: React.ReactNode; after: React.ReactNode; changes: string[]; date: string }
  > = {
    metadata: {
      date: "18 May",
      before: (
        <div className="space-y-1.5">
          <div className="text-[10px] text-muted-foreground uppercase tracking-widest">
            Subtitle
          </div>
          <div className="text-[11px] font-medium leading-tight">Fitness & Kalori Takibi</div>
          <div className="text-[10px] text-muted-foreground uppercase tracking-widest mt-2">
            Keywords
          </div>
          <div className="text-[10px] text-muted-foreground leading-snug">
            fitness, kalori, adım, spor, sağlık
          </div>
        </div>
      ),
      after: (
        <div className="space-y-1.5">
          <div className="text-[10px] text-cobalt uppercase tracking-widest">Subtitle</div>
          <div className="text-[11px] font-medium leading-tight">Kalori Sayacı & AI Koç</div>
          <div className="text-[10px] text-cobalt uppercase tracking-widest mt-2">Keywords</div>
          <div className="text-[10px] text-foreground/80 leading-snug">
            kalori sayacı, adım sayar, kilo takibi, ai koç
          </div>
        </div>
      ),
      changes: [
        "Alt-başlık fayda odaklı yazıldı",
        "Yüksek fırsatlı 4 kelime eklendi",
        "Genel kelimeler kaldırıldı",
      ],
    },
    creative: {
      date: "24 May",
      before: (
        <div className="space-y-1">
          <div className="h-3 w-3/4 rounded bg-foreground/25" />
          <div className="h-2 w-2/3 rounded bg-foreground/15" />
          <div className="mt-2 grid grid-cols-3 gap-1">
            {[0, 1, 2].map((i) => (
              <div key={i} className="aspect-[9/19] rounded bg-foreground/10" />
            ))}
          </div>
        </div>
      ),
      after: (
        <div className="space-y-1">
          <div className="text-[10px] font-semibold leading-tight text-foreground">
            Günlük Kalorini Takip Et
          </div>
          <div className="text-[9px] text-muted-foreground">★ 4.8 · 120K yorum</div>
          <div className="mt-2 grid grid-cols-3 gap-1">
            <div className="aspect-[9/19] rounded bg-gradient-to-b from-cobalt/50 to-violet/30" />
            <div className="aspect-[9/19] rounded bg-gradient-to-b from-violet/50 to-cobalt/30" />
            <div className="aspect-[9/19] rounded bg-gradient-to-b from-cobalt/60 to-violet/20" />
          </div>
        </div>
      ),
      changes: [
        "İlk ekran başlığı fayda odaklı",
        "Sosyal kanıt (★ + yorum sayısı) eklendi",
        "Renk kontrastı arttı",
      ],
    },
    localization: {
      date: "02 Haz",
      before: (
        <div className="space-y-1.5">
          <div className="flex items-center gap-1.5">
            <span className="text-sm">🇹🇷</span>
            <span className="text-[11px] font-medium">TR</span>
          </div>
          <div className="text-[10px] text-muted-foreground leading-snug">Tek dil · 1 pazar</div>
          <div className="mt-2 flex gap-1 opacity-40">{"\n"}</div>
        </div>
      ),
      after: (
        <div className="space-y-1.5">
          <div className="flex items-center gap-1.5">
            <span className="text-sm">🇹🇷</span>
            <span className="text-[11px] font-medium">TR</span>
            <span className="text-[9px] text-cobalt">+ 3 yeni</span>
          </div>
          <div className="text-[10px] text-foreground/80 leading-snug">
            4 dil · 4 pazar (DE, ES, AR-RTL)
          </div>
          <div className="mt-2 flex gap-1">
            <span className="text-sm">🇩🇪</span>
            <span className="text-sm">🇪🇸</span>
            <span className="text-sm">🇸🇦</span>
          </div>
        </div>
      ),
      changes: ["3 yeni pazara lokalize", "Arapça için RTL yerleşimi", "Keyword'ler ülke bazlı"],
    },
    event: {
      date: "10 Haz",
      before: (
        <div className="space-y-1.5">
          <div className="text-[10px] text-muted-foreground uppercase tracking-widest">
            In-App Event
          </div>
          <div className="text-[11px] text-muted-foreground italic">Yayında etkinlik yok</div>
          <div className="h-8 rounded border border-dashed border-border mt-2" />
        </div>
      ),
      after: (
        <div className="space-y-1.5">
          <div className="text-[10px] text-cobalt uppercase tracking-widest">
            In-App Event · Aktif
          </div>
          <div className="text-[11px] font-medium leading-tight">"30 Günlük Kalori Challenge"</div>
          <div className="mt-1 h-8 rounded-md bg-gradient-to-r from-cobalt/40 to-violet/40 grid place-items-center text-[9px] font-medium text-primary-foreground">
            Şimdi Katıl →
          </div>
        </div>
      ),
      changes: ["Yeni In-App Event yayınlandı", "Ana ekranda görsel kart", "Süre: 30 gün"],
    },
  };

  const c = content[mode];

  return (
    <div className="rounded-2xl border border-border bg-card p-6">
      <div className="flex items-center justify-between">
        <div className="text-xs uppercase tracking-widest text-muted-foreground">
          Kreatif Karşılaştırma
        </div>
        <div className="text-[10px] font-mono text-muted-foreground">FitLoop · {c.date}</div>
      </div>

      <div className="mt-3 flex flex-wrap gap-1">
        {modes.map((m) => (
          <button
            key={m.v}
            type="button"
            onClick={() => setMode(m.v)}
            className={`inline-flex items-center gap-1 text-[11px] px-2 py-1 rounded-md border transition ${mode === m.v ? "border-cobalt/40 bg-cobalt-soft text-cobalt" : "border-border bg-surface/40 text-muted-foreground hover:text-foreground"}`}
          >
            <m.icon className="h-3 w-3" /> {m.l}
          </button>
        ))}
      </div>

      <div key={mode} className="mt-4 grid grid-cols-2 gap-3 animate-in fade-in duration-200">
        {[
          { l: "Önce", body: c.before, tone: "before" as const },
          { l: "Sonra", body: c.after, tone: "after" as const },
        ].map((p) => (
          <div key={p.l}>
            <div
              className={`text-[10px] uppercase tracking-widest mb-1.5 ${p.tone === "after" ? "text-cobalt" : "text-muted-foreground"}`}
            >
              {p.l}
            </div>
            <div
              className={`aspect-[9/16] rounded-xl border p-3 overflow-hidden ${p.tone === "after" ? "border-cobalt/40 bg-cobalt-soft" : "border-border bg-surface/30"}`}
            >
              {p.body}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 space-y-1.5">
        <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
          TESPİT EDİLEN DEĞİŞİKLİKLER
        </div>
        <ul className="space-y-1">
          {c.changes.map((ch) => (
            <li key={ch} className="flex gap-2 text-[11px] text-foreground/80">
              <span className="text-cobalt">•</span>
              {ch}
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-3 text-[10px] text-muted-foreground italic leading-relaxed">{"\n"}</div>
    </div>
  );
}

/* ------------------------- COMPETITOR TIMELINE ------------------------- */

function CompetitorTimeline() {
  const events = [
    {
      d: "12 May",
      t: "Rakip ekran görüntülerini değiştirdi",
      tag: "Kreatif",
      icon: Layers,
      tone: "warning",
    },
    {
      d: "18 May",
      t: "14 kelimenin sıralaması yükseldi",
      tag: "Sıralama",
      icon: TrendingUp,
      tone: "success",
    },
    {
      d: "24 May",
      t: "Yeni uygulama içi etkinlik yayınlandı",
      tag: "Etkinlik",
      icon: Calendar,
      tone: "cobalt",
    },
    {
      d: "02 Haz",
      t: "Kategori sıralaması +11 yükseldi",
      tag: "Sıralama",
      icon: Trophy,
      tone: "success",
    },
  ];
  return (
    <section
      id="competitor-intelligence"
      className="border-y border-border bg-gradient-to-b from-background to-surface/20"
    >
      <div className="mx-auto max-w-7xl px-6 py-24 lg:py-32">
        <div className="max-w-2xl">
          <SectionEyebrow icon={Radar}>Rakip & Tarihsel Analiz</SectionEyebrow>
          <h2 className="mt-4 text-4xl sm:text-5xl font-semibold tracking-tight">
            Rakiplerinizin yalnızca bugününü değil,
            <br />
            <span className="text-muted-foreground">ne yaptığını görün.</span>
          </h2>
        </div>

        <div className="mt-14 grid lg:grid-cols-[1.3fr_1fr] gap-6">
          <div className="rounded-2xl border border-border bg-card p-8">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs uppercase tracking-widest text-muted-foreground">
                  RAKIP TIMELINE
                </div>
                <div className="mt-1 text-lg font-medium">FitTrack Pro · Son 60 gün</div>
              </div>
              <div className="text-xs text-muted-foreground">4 önemli değişiklik</div>
            </div>

            <div className="mt-8 relative">
              <div className="absolute left-[19px] top-2 bottom-2 w-px bg-border" />
              <div className="space-y-6">
                {events.map((e) => (
                  <div key={e.d} className="relative flex gap-4">
                    <div
                      className={`h-10 w-10 rounded-full grid place-items-center border shrink-0 z-10 ${
                        e.tone === "success"
                          ? "bg-success/10 border-success/30 text-success"
                          : e.tone === "warning"
                            ? "bg-warning/10 border-warning/30 text-warning"
                            : "bg-cobalt/10 border-cobalt/30 text-cobalt"
                      }`}
                    >
                      <e.icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 pt-1.5">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>{e.d}</span>
                        <span className="px-1.5 py-0.5 rounded border border-border">{e.tag}</span>
                      </div>
                      <div className="mt-1 text-sm font-medium">{e.t}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <p className="mt-8 text-xs text-muted-foreground italic">{"\n"}</p>
          </div>

          {/* Before / After creative — interactive 4-mode compare */}
          <MiniCreativeCompare />
        </div>
      </div>
    </section>
  );
}

/* ------------------------- MARKET OPPORTUNITY ------------------------- */

const COUNTRIES = [
  {
    c: "Suudi Arabistan",
    flag: "🇸🇦",
    score: 92,
    label: "En Güçlü Fırsat",
    store: "App Store",
    demand: 88,
    competition: 42,
    rankability: 81,
    gap: 64,
    trend: [10, 12, 11, 14, 15, 18, 20, 24, 27, 30, 34, 38],
    trendLabels: ["W1", "W2", "W3", "W4", "W5", "W6", "W7", "W8", "W9", "W10", "W11", "W12"],
  },
  {
    c: "BAE",
    flag: "🇦🇪",
    score: 86,
    label: "Yükselen Pazar",
    store: "App Store",
    demand: 79,
    competition: 48,
    rankability: 76,
    gap: 58,
    trend: [8, 9, 11, 10, 13, 14, 16, 17, 19, 22, 24, 27],
    trendLabels: ["W1", "W2", "W3", "W4", "W5", "W6", "W7", "W8", "W9", "W10", "W11", "W12"],
  },
  {
    c: "Türkiye",
    flag: "🇹🇷",
    score: 78,
    label: "Güçlü Mevcut Pazar",
    store: "App Store",
    demand: 72,
    competition: 61,
    rankability: 74,
    gap: 22,
    trend: [30, 32, 31, 34, 33, 35, 36, 34, 37, 38, 40, 41],
    trendLabels: ["W1", "W2", "W3", "W4", "W5", "W6", "W7", "W8", "W9", "W10", "W11", "W12"],
  },
  {
    c: "Almanya",
    flag: "🇩🇪",
    score: 61,
    label: "Orta",
    store: "App Store",
    demand: 64,
    competition: 71,
    rankability: 55,
    gap: 48,
    trend: [22, 21, 23, 22, 24, 23, 25, 24, 26, 25, 27, 26],
    trendLabels: ["W1", "W2", "W3", "W4", "W5", "W6", "W7", "W8", "W9", "W10", "W11", "W12"],
  },
  {
    c: "ABD",
    flag: "🇺🇸",
    score: 44,
    label: "Yüksek Rekabet",
    store: "App Store",
    demand: 92,
    competition: 94,
    rankability: 32,
    gap: 18,
    trend: [40, 38, 41, 39, 42, 40, 43, 41, 42, 40, 43, 41],
    trendLabels: ["W1", "W2", "W3", "W4", "W5", "W6", "W7", "W8", "W9", "W10", "W11", "W12"],
  },
];

function MarketOpportunity() {
  const [idx, setIdx] = useState(0);
  const cur = COUNTRIES[idx];
  return (
    <section id="market-intelligence" className="relative atmos-cobalt border-y border-border">
      <div className="relative mx-auto max-w-7xl px-6 py-24 lg:py-32">
        <div className="max-w-3xl">
          <SectionEyebrow icon={Globe2}>Pazar & Ülke Fırsatları</SectionEyebrow>
          <h2 className="mt-4 text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-tight leading-[1.05]">
            Bir sonraki büyüme pazarınızı
            <br />
            <span className="text-muted-foreground">keşfedin.</span>
          </h2>
          <p className="mt-5 text-base lg:text-lg text-muted-foreground max-w-2xl">
            Talep, rekabet, sıralama potansiyeli ve lokalizasyon açığını birlikte analiz ederek en
            güçlü ülke fırsatlarını keşfedin
          </p>
        </div>

        <div className="mt-14 grid lg:grid-cols-[1.2fr_1fr] gap-6">
          <div className="space-y-2">
            {COUNTRIES.map((c, i) => {
              const active = i === idx;
              return (
                <button
                  key={c.c}
                  type="button"
                  aria-pressed={active}
                  onClick={() => setIdx(i)}
                  className={`w-full text-left rounded-xl border p-4 flex items-center gap-4 transition ${active ? "border-cobalt/40 bg-cobalt-soft" : "border-border bg-card hover:bg-surface"}`}
                >
                  <span className="text-3xl">{c.flag}</span>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium">{c.c}</div>
                    <div className="text-xs text-muted-foreground">{c.label}</div>
                  </div>
                  <div className="w-32">
                    <div className="h-1.5 rounded-full bg-surface overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-cobalt to-violet transition-all"
                        style={{ width: `${c.score}%` }}
                      />
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-semibold tabular-nums">{c.score}</div>
                    <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
                      FIRSAT PUANI
                    </div>
                  </div>
                  <span className="text-xs tabular-nums text-muted-foreground w-6 text-right">
                    #{i + 1}
                  </span>
                </button>
              );
            })}
          </div>

          <div
            key={idx}
            className="rounded-2xl border border-border bg-card p-6 animate-in fade-in duration-300"
          >
            <div className="flex items-center gap-3">
              <span className="text-4xl">{cur.flag}</span>
              <div>
                <div className="text-lg font-semibold">{cur.c}</div>
                <div className="text-xs text-muted-foreground">{cur.store} · Sağlık & Fitness</div>
              </div>
              <div className="ml-auto text-right">
                <div
                  className={`text-3xl font-semibold ${cur.score >= 80 ? "text-success" : cur.score >= 60 ? "text-cobalt" : "text-warning"}`}
                >
                  {cur.score}
                </div>
                <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
                  FIRSAT PUANI
                </div>
              </div>
            </div>

            <div className="mt-6 space-y-3">
              <MetricBar
                label="Talep"
                v={cur.demand}
                tone={cur.demand >= 70 ? "success" : "warning"}
              />
              <MetricBar
                label="Rekabet"
                v={cur.competition}
                tone={cur.competition >= 70 ? "warning" : "success"}
              />
              <MetricBar label="Sıralama Potansiyeli" v={cur.rankability} tone="cobalt" />
              <MetricBar label="Lokalizasyon Açığı" v={cur.gap} />
            </div>

            <div className="mt-6 rounded-xl border border-border bg-surface/40 p-4">
              <div className="text-xs text-muted-foreground mb-2">İndirme trendi · 90 gün</div>
              <div className="h-16">
                <Sparkline
                  data={cur.trend}
                  labels={cur.trendLabels}
                  accent
                  valueLabel="İndirme (K)"
                />
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-1.5">
              {[
                "Ülke Fırsatları",
                "Pazar Keşfi",
                "Niş Keşfi",
                "Yükselen Pazarlar",
                "Mevsimsellik",
                "Yükselen Trendler",
              ].map((t) => (
                <span
                  key={t}
                  className="text-[11px] px-2 py-1 rounded-md border border-border bg-background/40 text-muted-foreground"
                >
                  {t}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------------------------- STORE WORKSPACE ---------------------------- */

type WorkspaceTab = "Overview" | "Listing" | "Creatives" | "Localization" | "Events" | "Publishing";

function StoreWorkspace() {
  const [store, setStore] = useState<"app" | "play">("app");
  const [tab, setTab] = useState<WorkspaceTab>("Listing");
  const nav: WorkspaceTab[] = [
    "Overview",
    "Listing",
    "Creatives",
    "Localization",
    "Events",
    "Publishing",
  ];
  const navLabel: Record<WorkspaceTab, string> = {
    Overview: "Genel Bakış",
    Listing: "Listing",
    Creatives: "Kreatifler",
    Localization: "Lokalizasyon",
    Events: "Etkinlikler",
    Publishing: "Yayınlama",
  };

  type Ctx = {
    icon: React.ElementType;
    tone: "violet" | "cobalt" | "success" | "warning";
    title: string;
    body: string;
  };
  const storeLabel = store === "app" ? "App Store" : "Google Play";

  const contextApp: Record<WorkspaceTab, Ctx[]> = {
    Overview: [
      {
        icon: Activity,
        tone: "cobalt",
        title: "App Store Sağlığı",
        body: "Genel mağaza sağlığı 82/100 · 3 alan orta seviye risk taşıyor",
      },
      {
        icon: TrendingUp,
        tone: "success",
        title: "Son 30 gün",
        body: "Gösterimler %8 arttı, dönüşüm oranı 0,4 puan yükseldi. iOS 17 ve üzeri cihazlarda daha güçlü performans gözlendi.",
      },
      {
        icon: Calendar,
        tone: "warning",
        title: "Bekleyen İş",
        body: "App Store’a gönderilmeyi bekleyen 2 taslak bulunuyor.",
      },
    ],
    Listing: [
      {
        icon: Brain,
        tone: "violet",
        title: "AI Önerisi",
        body: "Altbaşlığa 'adımsayar' ekleyerek 3 orta hacimli kelimede kapsam genişletebilirsiniz.",
      },
      {
        icon: Target,
        tone: "cobalt",
        title: "Kelime Kapsamı",
        body: "100 byte alanında 82/100 kullanıldı · virgülle ayrılmış 12 kelime.",
      },
      {
        icon: ShieldCheck,
        tone: "success",
        title: "Apple Doğrulaması",
        body: "Tüm alanlar App Store Review yönergelerine uygun.",
      },
      {
        icon: Calendar,
        tone: "warning",
        title: "Değişiklik Geçmişi",
        body: "Son değişiklik 2 gün önce · @merve",
      },
    ],
    Creatives: [
      {
        icon: Layers,
        tone: "cobalt",
        title: "Ekran Görüntüsü Setleri",
        body: '6.7", 6.5" ve iPad Pro için tam kapsam · 2 ekran güncellenmeyi bekliyor.',
      },
      {
        icon: Eye,
        tone: "violet",
        title: "App Preview Video",
        body: "15-30 sn App Preview aktif · dönüşümde +6% erken sinyal.",
      },
      {
        icon: ShieldCheck,
        tone: "success",
        title: "Apple Yönerge Kontrolü",
        body: "Tüm görseller App Store Marketing yönergelerine uygun.",
      },
    ],
    Localization: [
      {
        icon: Languages,
        tone: "violet",
        title: "App Store Locale",
        body: "40 App Store bölgesinden 8 dilde tam çeviri · 4 dil kısmen.",
      },
      {
        icon: Target,
        tone: "cobalt",
        title: "Öncelik",
        body: "ar-SA lokalizasyonu tamamlandığında +18% MENA erişimi.",
      },
      {
        icon: Calendar,
        tone: "warning",
        title: "Son güncelleme",
        body: "de-DE 41 gün önce güncellendi — yenilenmeli.",
      },
    ],
    Events: [
      {
        icon: Calendar,
        tone: "violet",
        title: "Aktif In-App Event",
        body: "“Yaz Formu Meydan Okuması” 6 gündür yayında.\nGösterimler önceki döneme göre %12 arttı.",
      },
      {
        icon: Radar,
        tone: "warning",
        title: "Rakip Analizi",
        body: "2 rakibiniz önümüzdeki 10 gün içinde uygulama içi etkinlik yayınlamayı planlıyor.",
      },
      {
        icon: TrendingUp,
        tone: "success",
        title: "İçerik Önerisi",
        body: "Bir sonraki etkinlik kartında “kalori sayacı” ifadesini öne çıkarın. Bu ifade mevcut anahtar kelimeler arasında daha yüksek talep gösteriyor.",
      },
    ],
    Publishing: [
      {
        icon: ShieldCheck,
        tone: "success",
        title: "App Review",
        body: "Metadata ve uygulama derlemesi hazır. Gönderimi engelleyen bir sorun tespit edilmedi.",
      },
      {
        icon: Calendar,
        tone: "cobalt",
        title: "Aşamalı Yayın",
        body: "App Review onayından sonra 7 günlük aşamalı yayın planı başlayacak.",
      },
      {
        icon: Brain,
        tone: "violet",
        title: "Değişim Etkisi",
        body: "6 anahtar kelimede ortalama 8 sıra iyileşme potansiyeli tespit edildi.",
      },
    ],
  };

  const contextPlay: Record<WorkspaceTab, Ctx[]> = {
    Overview: [
      {
        icon: Activity,
        tone: "cobalt",
        title: "Play Store Sağlığı",
        body: "Store listing sağlığı 78/100 · Full description optimizasyonu öneriliyor.",
      },
      {
        icon: TrendingUp,
        tone: "success",
        title: "Son 30 gün",
        body: "Store listing acquisitions +11%, install conv. +0.6pt.",
      },
      {
        icon: Calendar,
        tone: "warning",
        title: "Bekleyen İş",
        body: "1 draft release Play Console'da inceleme bekliyor.",
      },
    ],
    Listing: [
      {
        icon: Brain,
        tone: "violet",
        title: "AI Mağaza Önerisi",
        body: "Full Description'da 'kalori sayacı' 2 kez daha geçmeli · yoğunluk hedefi %1.4.",
      },
      {
        icon: Target,
        tone: "cobalt",
        title: "Anahtar Kelime Kapsamı",
        body: "Title + Short + Full toplamı 24 hedef kelimeyi kapsıyor.",
      },
      {
        icon: FileText,
        tone: "cobalt",
        title: "Açıklama Optimizasyonu",
        body: "Short Description 31/80 · daha güçlü değer önermesi ekleyin.",
      },
      {
        icon: ShieldCheck,
        tone: "success",
        title: "App Store Uygunluk Kontrolü",
        body: "Tüm alanlar Google Play Developer Policy'e uygun.",
      },
      {
        icon: Calendar,
        tone: "warning",
        title: "Değişiklik Geçmişi",
        body: "Son değişiklik 2 gün önce · @merve",
      },
    ],
    Creatives: [
      {
        icon: Layers,
        tone: "cobalt",
        title: "Feature Graphic & İkon",
        body: "1024×500 feature graphic ve 512×512 icon güncel.",
      },
      {
        icon: Eye,
        tone: "violet",
        title: "Telefon / Tablet Görselleri",
        body: '8 telefon, 4 7" tablet, 4 10" tablet görseli aktif.',
      },
      {
        icon: ShieldCheck,
        tone: "success",
        title: "Play Yönerge Kontrolü",
        body: "Tüm asset'ler Google Play metadata policy'e uygun.",
      },
    ],
    Localization: [
      {
        icon: Languages,
        tone: "violet",
        title: "Play Store Locale",
        body: "77 Play locale'inden 8 dilde tam çeviri · 4 dil kısmen.",
      },
      {
        icon: Target,
        tone: "cobalt",
        title: "Öncelik",
        body: "id-ID ve pt-BR tamamlandığında +22% GEM erişimi.",
      },
      {
        icon: Calendar,
        tone: "warning",
        title: "Son güncelleme",
        body: "de-DE 41 gün önce güncellendi — yenilenmeli.",
      },
    ],
    Events: [
      {
        icon: Calendar,
        tone: "violet",
        title: "Promotional Content",
        body: "'Yaz Formu Meydan Okuması' LiveOps kartı 6 gündür yayında.",
      },
      {
        icon: Radar,
        tone: "warning",
        title: "Rakip",
        body: "2 rakip önümüzdeki 10 gün içinde promo card planlıyor.",
      },
      {
        icon: TrendingUp,
        tone: "success",
        title: "Öneri",
        body: "Sıradaki promo card 'kalori sayacı' kelimesini öne çıkarmalı.",
      },
    ],
    Publishing: [
      {
        icon: ShieldCheck,
        tone: "success",
        title: "Play Console Review",
        body: "Metadata ve bundle hazır · Production track'e gönderilebilir.",
      },
      {
        icon: Calendar,
        tone: "cobalt",
        title: "Staged Rollout",
        body: "%10 → %50 → %100 rollout planlandı · Europe/Istanbul.",
      },
      {
        icon: Brain,
        tone: "violet",
        title: "Değişim Etkisi",
        body: "Bu yayın sonrası 6 kelimede +8 sıralama beklentisi.",
      },
    ],
  };

  const context = store === "app" ? contextApp : contextPlay;

  return (
    <section id="store-workspace" className="relative border-y border-border atmos-graphite">
      <div className="mx-auto max-w-[1440px] px-6 py-28 lg:py-36">
        <div className="max-w-3xl">
          <SectionEyebrow icon={Store}>Mağaza & İçerik Çalışma Alanı</SectionEyebrow>
          <h2 className="mt-4 text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-tight leading-[1.05]">
            Analizden uygulamaya,
            <br />
            <span className="text-muted-foreground">tek bir çalışma alanı.</span>
          </h2>
          <p className="mt-5 text-base lg:text-lg text-muted-foreground max-w-2xl">
            Dashboard ne yapacağınızı söyler. Store Workspace ise işi yaptığınız yerdir — metadata,
            görseller, lokalizasyon ve yayınlama tek akışta
          </p>
        </div>

        <div className="mt-16 rounded-2xl border border-border bg-card overflow-hidden shadow-2xl shadow-black/40">
          <div className="border-b border-border px-4 py-3 flex items-center gap-3">
            <div className="flex items-center gap-1 rounded-lg border border-border bg-surface p-1 text-xs">
              <button
                onClick={() => setStore("app")}
                aria-pressed={store === "app"}
                className={`px-3 py-1 rounded-md flex items-center gap-1.5 transition ${store === "app" ? "bg-background text-foreground" : "text-muted-foreground"}`}
              >
                <Smartphone className="h-3 w-3" /> App Store
              </button>
              <button
                onClick={() => setStore("play")}
                aria-pressed={store === "play"}
                className={`px-3 py-1 rounded-md flex items-center gap-1.5 transition ${store === "play" ? "bg-background text-foreground" : "text-muted-foreground"}`}
              >
                <Store className="h-3 w-3" /> Google Play
              </button>
            </div>
            <div className="text-xs text-muted-foreground">
              FitLoop · {store === "app" ? "iOS · tr-TR" : "Android · tr-TR"}
            </div>
            <div className="ml-auto flex items-center gap-1.5 text-xs text-muted-foreground">
              <div className="h-1.5 w-1.5 rounded-full bg-success animate-pulse" />{" "}
              {store === "app"
                ? "App Store Connect taslağı kaydedildi"
                : "Play Console draft kaydedildi"}
            </div>
          </div>

          <div className="grid lg:grid-cols-[220px_1fr_340px] min-h-[640px]">
            <div className="border-b lg:border-b-0 lg:border-r border-border p-3 space-y-0.5">
              {nav.map((n) => {
                const active = n === tab;
                return (
                  <button
                    key={n}
                    type="button"
                    aria-pressed={active}
                    onClick={() => setTab(n)}
                    className={`w-full text-left px-3 py-2 rounded-md text-sm flex items-center gap-2 transition ${active ? "bg-surface text-foreground" : "text-muted-foreground hover:text-foreground hover:bg-surface/50"}`}
                  >
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${active ? "bg-cobalt" : "bg-transparent"}`}
                    />
                    {n === "Listing" ? "Mağaza Bilgileri" : navLabel[n]}
                  </button>
                );
              })}
            </div>

            <div
              key={`${tab}-${store}`}
              className="p-6 border-b lg:border-b-0 lg:border-r border-border animate-in fade-in duration-300"
            >
              <div className="text-xs uppercase tracking-widest text-muted-foreground">
                {tab === "Listing"
                  ? "APP STORE · MAĞAZA BİLGİLERİ"
                  : tab === "Events"
                    ? `${storeLabel} · ETKİNLİKLER`.toUpperCase()
                    : `${storeLabel} · ${navLabel[tab]}`.toUpperCase()}
              </div>

              {tab === "Listing" && store === "app" && (
                <>
                  <FieldRow
                    label="Uygulama Adı"
                    v="FitLoop — Günlük Fitness"
                    limit={30}
                    used={22}
                  />
                  <FieldRow
                    label="Alt Başlık"
                    v="Kalori sayacı & adım takibi"
                    limit={30}
                    used={28}
                  />
                  <FieldRow
                    label="Anahtar Kelimeler · 100 bayt"
                    v="fitness,kalori,adım,antrenman,koşu,spor,vücut"
                    limit={100}
                    used={82}
                    monospace
                  />
                  <div className="mt-6 flex flex-wrap gap-1.5">
                    {["fitness", "kalori", "adım", "antrenman", "koşu", "spor", "günlük"].map(
                      (k, i) => (
                        <span
                          key={k}
                          className={`text-xs px-2 py-1 rounded-md border ${i < 5 ? "border-cobalt/30 bg-cobalt-soft text-cobalt" : "border-border bg-surface/40 text-muted-foreground"}`}
                        >
                          {k}
                        </span>
                      ),
                    )}
                  </div>
                </>
              )}

              {tab === "Listing" && store === "play" && (
                <>
                  <FieldRow
                    label="App Title"
                    v="FitLoop: Fitness & Adım Sayar"
                    limit={50}
                    used={32}
                  />
                  <FieldRow
                    label="Short Description"
                    v="Kişisel fitness koçun cebinde. Kalori, adım ve antrenman tek yerde."
                    limit={80}
                    used={68}
                  />
                  <FieldRow
                    label="Full Description"
                    v="FitLoop, günlük fitness rutininizi kolaylaştıran akıllı bir koçtur. Kalori sayacı, adım takibi ve kişisel antrenman planları ile hedeflerinize ulaşın…"
                    limit={4000}
                    used={1284}
                  />
                  <div className="mt-6 flex flex-wrap gap-1.5">
                    {[
                      "fitness",
                      "kalori sayacı",
                      "adım sayar",
                      "antrenman",
                      "koşu",
                      "spor",
                      "günlük",
                    ].map((k, i) => (
                      <span
                        key={k}
                        className={`text-xs px-2 py-1 rounded-md border ${i < 5 ? "border-cobalt/30 bg-cobalt-soft text-cobalt" : "border-border bg-surface/40 text-muted-foreground"}`}
                      >
                        {k}
                      </span>
                    ))}
                  </div>
                </>
              )}

              {tab === "Overview" && (
                <div className="mt-4 space-y-3">
                  <MetricBar
                    label={
                      store === "app" ? "App Store Mağaza Sağlığı" : "Play Store Mağaza Sağlığı"
                    }
                    v={store === "app" ? 82 : 78}
                    tone="success"
                  />
                  <MetricBar
                    label="Anahtar Kelime Kapsamı"
                    v={store === "app" ? 68 : 74}
                    tone="cobalt"
                  />
                  <MetricBar
                    label={store === "app" ? "App Store Lokalizasyon" : "Play Store Lokalizasyon"}
                    v={store === "app" ? 62 : 58}
                    tone="warning"
                  />
                  <MetricBar
                    label={
                      store === "app"
                        ? "Ekran Görüntüleri & Önizleme"
                        : "Görsel Varlıklar & Ekran Görüntüleri"
                    }
                    v={store === "app" ? 91 : 88}
                    tone="success"
                  />
                </div>
              )}

              {tab === "Creatives" && <CreativeCompare store={store} />}

              {tab === "Localization" && (
                <div className="mt-4 space-y-1.5">
                  <div className="text-xs text-muted-foreground mb-2">
                    {store === "app"
                      ? "App Store · 40 bölge desteği"
                      : "Google Play · 77 locale desteği"}
                  </div>
                  {[
                    { l: "tr-TR", s: "Tamamlandı", tone: "success" },
                    { l: "en-US", s: "Tamamlandı", tone: "success" },
                    { l: "de-DE", s: "Güncelleme gerekli", tone: "warning" },
                    { l: store === "app" ? "ar-SA" : "id-ID", s: "Eksik alanlar", tone: "warning" },
                    { l: store === "app" ? "es-ES" : "pt-BR", s: "Tamamlandı", tone: "success" },
                  ].map((r) => (
                    <div
                      key={r.l}
                      className="flex items-center justify-between rounded-lg border border-border bg-background/40 px-3 py-2 text-sm"
                    >
                      <span className="font-medium">{r.l}</span>
                      <span
                        className={`text-xs ${r.tone === "success" ? "text-success" : "text-warning"}`}
                      >
                        {r.s}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {tab === "Events" && (
                <div className="mt-4 space-y-2">
                  <div className="text-xs text-muted-foreground mb-1">
                    {store === "app"
                      ? "Uygulama İçi Etkinlikler"
                      : "Google Play Promotional Content (LiveOps)"}
                  </div>
                  {(store === "app"
                    ? [
                        {
                          t: "Yaz Formu Meydan Okuması",
                          d: "Yayında · 14 günün 6. günü",
                          tone: "cobalt",
                        },
                        {
                          t: "Kalori Sayacı Lansmanı",
                          d: "Planlandı · 8 gün sonra",
                          tone: "violet",
                        },
                        { t: "Yeni Yıl Fitness Serisi", d: "Taslak", tone: "warning" },
                      ]
                    : [
                        {
                          t: "Yaz Formu Meydan Okuması",
                          d: "Promo Card · Aktif · 6/14 gün",
                          tone: "cobalt",
                        },
                        {
                          t: "Kalori Sayacı Lansmanı",
                          d: "LiveOps Event · Zamanlandı · 8 gün sonra",
                          tone: "violet",
                        },
                        { t: "Yeni Yıl Fitness Serisi", d: "Promo Card · Taslak", tone: "warning" },
                      ]
                  ).map((e) => (
                    <div
                      key={e.t}
                      className="rounded-lg border border-border bg-background/40 p-3 flex items-center justify-between"
                    >
                      <div>
                        <div className="text-sm font-medium">{e.t}</div>
                        <div className="text-xs text-muted-foreground">{e.d}</div>
                      </div>
                      <Calendar
                        className={`h-4 w-4 ${e.tone === "cobalt" ? "text-cobalt" : e.tone === "violet" ? "text-violet" : "text-warning"}`}
                      />
                    </div>
                  ))}
                </div>
              )}

              {tab === "Publishing" && (
                <div className="mt-4 rounded-xl border border-border bg-background/40 p-4">
                  <div className="flex items-center gap-2 text-xs">
                    <ShieldCheck className="h-3.5 w-3.5 text-success" />
                    {store === "app"
                      ? "App Store Connect kontrolleri tamamlandı"
                      : "Play Console validation başarılı"}
                  </div>
                  <div className="mt-4 text-sm">
                    {store === "app"
                      ? "App Review gönderimi · Perşembe, 09:00"
                      : "Aşamalı Yayın %10 · Perşembe 09:00 · Europe/Istanbul"}
                  </div>
                  <div className="mt-1 text-xs text-muted-foreground">
                    {store === "app"
                      ? "14 anahtar kelime güncellemesi, 6 lokalizasyon ve 3 ekran görüntüsü seti gönderime hazır."
                      : "14 kelime, 6 lokalizasyon, 3 graphic asset Production track'e alınacak."}
                  </div>
                  <div className="mt-4 flex gap-2">
                    <span className="text-xs px-2 py-1 rounded-md border border-cobalt/30 text-cobalt bg-cobalt-soft">
                      {store === "app" ? "Aşamalı Yayın" : "Staged Rollout"}
                    </span>
                    <span className="text-xs px-2 py-1 rounded-md border border-border text-muted-foreground">
                      Change impact preview hazır
                    </span>
                  </div>
                </div>
              )}
            </div>

            <div
              key={`ctx-${tab}-${store}`}
              className="p-4 bg-surface/20 space-y-3 animate-in fade-in duration-300"
            >
              {context[tab].map((c) => (
                <ContextCard
                  key={c.title}
                  icon={c.icon}
                  tone={c.tone}
                  title={c.title}
                  body={c.body}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function FieldRow({
  label,
  v,
  limit,
  used,
  monospace,
}: {
  label: string;
  v: string;
  limit: number;
  used: number;
  monospace?: boolean;
}) {
  const pct = (used / limit) * 100;
  return (
    <div className="mt-5">
      <div className="flex justify-between text-xs">
        <span className="text-muted-foreground">{label}</span>
        <span className={`tabular-nums ${pct > 90 ? "text-warning" : "text-muted-foreground"}`}>
          {used}&nbsp;/&nbsp;{limit}
        </span>
      </div>
      <div
        className={`mt-1.5 rounded-lg border border-border bg-background/60 px-3 py-2.5 text-sm ${monospace ? "font-mono text-[13px]" : ""}`}
      >
        {v}
      </div>
      <div className="mt-1.5 h-0.5 rounded-full bg-surface overflow-hidden">
        <div
          className={`h-full ${pct > 90 ? "bg-warning" : "bg-cobalt"}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

function ContextCard({
  icon: Icon,
  tone,
  title,
  body,
}: {
  icon: React.ElementType;
  tone: "violet" | "cobalt" | "success" | "warning";
  title: string;
  body: string;
}) {
  const map = {
    violet: "text-violet bg-violet/10 border-violet/20",
    cobalt: "text-cobalt bg-cobalt/10 border-cobalt/20",
    success: "text-success bg-success/10 border-success/20",
    warning: "text-warning bg-warning/10 border-warning/20",
  };
  return (
    <div className="rounded-xl border border-border bg-card p-3">
      <div className="flex items-center gap-2">
        <div className={`h-6 w-6 rounded-md grid place-items-center border ${map[tone]}`}>
          <Icon className="h-3.5 w-3.5" />
        </div>
        <div className="text-xs font-medium">{title}</div>
      </div>
      <p className="mt-2 text-xs text-muted-foreground leading-relaxed">{body}</p>
    </div>
  );
}

/* --------------------------- CHANGE IMPACT --------------------------- */

function ChangeImpact() {
  const before = [
    { l: "Görünürlük", v: 62 },
    { l: "Arama Kaynaklı İndirmeler", v: "8.4B" },
    { l: "Dönüşüm", v: "%4.8" },
  ];
  const after = [
    { l: "Görünürlük", v: 74, d: "+12" },
    { l: "Arama Kaynaklı İndirmeler", v: "10.2B", d: "+21%" },
    { l: "Dönüşüm", v: "%5.1", d: "+0,3" },
  ];
  const funnel = [
    { l: "Gösterimler", v: 812000, w: 100 },
    { l: "Ürün Sayfası Görüntülemeleri", v: 214000, w: 62 },
    { l: "İndirmeler", v: 42800, w: 32 },
    { l: "Gelir", v: "18.4 bin $", w: 18 },
  ];
  return (
    <section id="analytics" className="mx-auto max-w-7xl px-6 py-24 lg:py-32">
      <div className="max-w-2xl">
        <SectionEyebrow icon={Activity}>ANALİTİK & DEĞİŞİM ETKİSİ</SectionEyebrow>
        <h2 className="mt-4 text-4xl sm:text-5xl font-semibold tracking-tight">
          Yaptığınız değişiklik
          <br />
          <span className="text-muted-foreground">gerçekten işe yaradı mı?</span>
        </h2>
      </div>

      <div className="mt-14 grid lg:grid-cols-[1.35fr_1fr] gap-6">
        <div className="rounded-2xl border border-border bg-card overflow-hidden">
          {/* Event timeline anchor */}
          <div className="relative px-8 pt-8 pb-4">
            <div className="flex items-center gap-3">
              <div className="relative flex h-8 w-8 shrink-0">
                <span className="absolute inline-flex h-full w-full rounded-full bg-cobalt/20 animate-ping" />
                <span className="relative inline-flex h-8 w-8 rounded-full bg-cobalt/15 border border-cobalt/40 items-center justify-center">
                  <Calendar className="h-3.5 w-3.5 text-cobalt" />
                </span>
              </div>
              <div className="min-w-0">
                <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
                  DEĞIŞIKLIK KAYDI
                </div>
                <div className="text-base font-semibold leading-tight">
                  14 Mayıs ·&nbsp;Mağaza bilgileri güncellendi
                </div>
              </div>
              <span className="ml-auto text-[11px] px-2 py-0.5 rounded-md border border-cobalt/30 bg-cobalt-soft text-cobalt shrink-0">
                App Store Connect
              </span>
            </div>

            {/* Story rail: Aksiyon → Değişim → Sonuç */}
            <div className="mt-6 grid grid-cols-[auto_1fr_auto_1fr_auto] items-center gap-3 text-[10px] uppercase tracking-widest text-muted-foreground">
              <span className="text-cobalt">Aksiyon</span>
              <span className="h-px bg-gradient-to-r from-cobalt/60 to-hairline" />
              <span>Değişim</span>
              <span className="h-px bg-gradient-to-r from-hairline to-success/60" />
              <span className="text-success">Sonuç</span>
            </div>
          </div>

          <div className="px-8 pb-8 grid grid-cols-[1fr_auto_1fr] gap-5 items-stretch">
            <div>
              <div className="text-xs uppercase tracking-widest text-muted-foreground mb-3">
                Önce
              </div>
              <div className="space-y-3">
                {before.map((b) => (
                  <div key={b.l} className="rounded-lg border border-border bg-surface/40 p-3">
                    <div className="text-xs text-muted-foreground">{b.l}</div>
                    <div className="text-xl font-semibold mt-0.5 tabular-nums">{b.v}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-col items-center justify-center gap-2 px-1">
              <div className="w-px flex-1 bg-gradient-to-b from-cobalt/40 via-hairline to-success/40" />
              <ArrowRight className="h-4 w-4 text-muted-foreground -rotate-0" />
              <div className="w-px flex-1 bg-gradient-to-b from-cobalt/40 via-hairline to-success/40" />
            </div>

            <div>
              <div className="text-xs uppercase tracking-widest text-success mb-3">Sonra</div>
              <div className="space-y-3">
                {after.map((a) => (
                  <div key={a.l} className="rounded-lg border border-success/20 bg-success/5 p-3">
                    <div className="text-xs text-muted-foreground">{a.l}</div>
                    <div className="flex items-baseline gap-2 mt-0.5">
                      <div className="text-xl font-semibold tabular-nums">{a.v}</div>
                      <div className="text-xs text-success tabular-nums">{a.d}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="border-t border-hairline bg-surface/20 px-8 py-3 text-[11px] text-muted-foreground">
            Değişiklik sonrasında gözlenen performans hareketidir; tek başına nedensellik kanıtı
            değildir.
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-8">
          <div className="text-xs uppercase tracking-widest text-muted-foreground">
            MAĞAZA PERFORMANS AKIŞI
          </div>
          <div className="mt-6 space-y-3">
            {funnel.map((f, i) => (
              <div key={f.l}>
                <div className="flex justify-between text-sm mb-1.5">
                  <span>{f.l}</span>
                  <span className="tabular-nums text-muted-foreground">
                    {typeof f.v === "number" ? f.v.toLocaleString("tr-TR") : f.v}
                  </span>
                </div>
                <div className="h-8 rounded-md bg-surface/40 overflow-hidden relative">
                  <div
                    className="h-full bg-gradient-to-r from-cobalt to-violet/60"
                    style={{ width: `${f.w}%` }}
                  />
                </div>
                {i < funnel.length - 1 && (
                  <div className="h-2 flex justify-center">
                    <div className="w-px h-full bg-border" />
                  </div>
                )}
              </div>
            ))}
          </div>
          <div className="mt-6 text-xs text-muted-foreground">
            App Store Connect ve Google Play Console verileriyle otomatik olarak eşleştirilir.
          </div>
        </div>
      </div>
    </section>
  );
}

/* --------------------------- ORGANIC + PAID --------------------------- */

function OrganicPaid() {
  const rows = [
    {
      kw: "kalori sayacı",
      org: "#24",
      orgNum: 24,
      ads: "412",
      adsNum: 412,
      cpa: "$2.10",
      opp: "Yüksek",
      signal: "Yüksek Organik Fırsat",
      insight: (
        <>
          <strong>"kalori sayacı"</strong> Apple Ads üzerinden güçlü dönüşüm sağlıyor ancak organik
          sıralamanız <strong>#24</strong>. Metadata hedeflemesini güçlendirmek organik görünürlüğü
          artırma fırsatı yaratabilir.
        </>
      ),
    },
    {
      kw: "adım sayar",
      org: "#18",
      orgNum: 18,
      ads: "336",
      adsNum: 336,
      cpa: "$1.85",
      opp: "Yüksek",
      signal: "Yüksek Organik Fırsat",
      insight: (
        <>
          <strong>"adım sayar"</strong> için CPA düşük ve organik sıralama <strong>#18</strong> —
          subtitle içine eklendiğinde ilk 10'a giriş olasılığı yüksek.
        </>
      ),
    },
    {
      kw: "fitness plan",
      org: "#41",
      orgNum: 41,
      ads: "228",
      adsNum: 228,
      cpa: "$1.62",
      opp: "Orta",
      signal: "Orta Organik Fırsat",
      insight: (
        <>
          <strong>"fitness plan"</strong> düşük CPA'ya rağmen organikte <strong>#41</strong>.
          Metadata değişikliğinden önce ekran görüntülerinde bu kavramın öne çıkarılması denenmeli.
        </>
      ),
    },
  ];
  const [idx, setIdx] = useState(0);
  const cur = rows[idx];
  return (
    <section className="relative border-y border-border atmos-blend">
      <div className="relative mx-auto max-w-7xl px-6 py-24 lg:py-32">
        <div className="max-w-3xl">
          <SectionEyebrow icon={Zap}>ORGANIK + REKLAM ANALIZI</SectionEyebrow>
          <h2 className="mt-4 text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-tight leading-[1.05]">
            Reklam verilerinizden
            <br />
            <span className="text-muted-foreground">organik büyüme fırsatları çıkarın.</span>
          </h2>
          <p className="mt-5 text-base lg:text-lg text-muted-foreground max-w-2xl">
            Güçlü reklam sinyalleri + zayıf organik sıralama = organik büyüme fırsatı
          </p>
        </div>

        {/* HERO COMPARISON */}
        <div
          key={idx}
          className="mt-16 rounded-3xl border border-border bg-card overflow-hidden animate-in fade-in duration-300"
        >
          <div className="px-8 py-5 border-b border-border flex items-center gap-3 bg-surface/30">
            <span className="text-[11px] uppercase tracking-widest text-muted-foreground">
              Seçili Anahtar Kelime
            </span>
            <span className="text-lg font-semibold">"{cur.kw}"</span>
            <span className="ml-auto inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-md border border-success/30 bg-success/10 text-success">
              <Target className="h-3.5 w-3.5" /> {cur.signal}
            </span>
          </div>

          <div className="grid lg:grid-cols-[1fr_auto_1fr]">
            {/* ORGANIC */}
            <div className="p-8 lg:p-10 border-b lg:border-b-0 lg:border-r border-border">
              <div className="flex items-center gap-2 text-[11px] uppercase tracking-widest text-warning">
                <ArrowDown className="h-3.5 w-3.5" /> ORGANIK
              </div>
              <div className="mt-4 flex items-baseline gap-3">
                <div className="text-6xl lg:text-7xl font-semibold tabular-nums leading-none">
                  {cur.org}
                </div>
                <div className="text-sm text-muted-foreground">sıralama</div>
              </div>
              <div className="mt-6 text-sm text-muted-foreground">
                İlk 10'a girmek için{" "}
                <strong className="text-foreground">{Math.max(cur.orgNum - 10, 1)} sıra</strong>{" "}
                ilerleme gerekli.
              </div>
              <div className="mt-6 h-1.5 rounded-full bg-surface overflow-hidden">
                <div
                  className="h-full bg-warning"
                  style={{ width: `${Math.min(100 - cur.orgNum, 100)}%` }}
                />
              </div>
            </div>

            {/* CENTER SIGNAL */}
            <div className="relative grid place-items-center px-6 py-8 lg:px-10 bg-surface/20 border-b lg:border-b-0 lg:border-r border-border">
              <div className="text-center">
                <div className="inline-flex items-center justify-center h-14 w-14 rounded-full border border-success/40 bg-success/10 text-success">
                  <Zap className="h-6 w-6" />
                </div>
                <div className="mt-4 text-xs uppercase tracking-widest text-muted-foreground">
                  Büyüme Sinyali
                </div>
                <div className="mt-1 text-sm font-medium text-success max-w-[9rem]">
                  {cur.signal}
                </div>
              </div>
            </div>

            {/* PAID */}
            <div className="p-8 lg:p-10">
              <div className="flex items-center gap-2 text-[11px] uppercase tracking-widest text-cobalt">
                <TrendingUp className="h-3.5 w-3.5" /> REKLAM
              </div>
              <div className="mt-4 flex items-baseline gap-3">
                <div className="text-6xl lg:text-7xl font-semibold tabular-nums leading-none">
                  {cur.ads}
                </div>
                <div className="text-sm text-muted-foreground">
                  Apple Reklam Kaynaklı İndirmeler
                </div>
              </div>
              <div className="mt-6 grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="text-[11px] uppercase tracking-widest text-muted-foreground">
                    CPA
                  </div>
                  <div className="mt-1 text-2xl font-semibold tabular-nums text-cobalt">
                    {cur.cpa}
                  </div>
                </div>
                <div>
                  <div className="text-[11px] uppercase tracking-widest text-muted-foreground">
                    Fırsat
                  </div>
                  <div className="mt-1 text-2xl font-semibold text-foreground">{cur.opp}</div>
                </div>
              </div>
            </div>
          </div>

          {/* AI INSIGHT */}
          <div className="border-t border-violet/25 bg-background/40 px-8 py-6 flex flex-col md:flex-row md:items-center gap-4">
            <div className="flex items-center gap-2 shrink-0">
              <div className="h-8 w-8 rounded-lg border border-violet/30 bg-violet/10 grid place-items-center">
                <Brain className="h-4 w-4 text-violet" />
              </div>
              <span className="text-xs uppercase tracking-widest text-violet font-medium">
                AI ÖNERİLERİ
              </span>
            </div>
            <p className="text-sm lg:text-base leading-relaxed text-foreground/90">{cur.insight}</p>
          </div>
        </div>

        {/* KEYWORD SWITCHER */}
        <div className="mt-6 grid sm:grid-cols-3 gap-3">
          {rows.map((r, i) => {
            const active = i === idx;
            return (
              <button
                key={r.kw}
                type="button"
                aria-pressed={active}
                onClick={() => setIdx(i)}
                className={`text-left rounded-xl border px-4 py-3 transition ${active ? "border-cobalt/40 bg-cobalt-soft" : "border-border bg-card hover:bg-surface/50"}`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{r.kw}</span>
                  {active && <Check className="h-4 w-4 text-cobalt" />}
                </div>
                <div className="mt-1.5 flex items-center gap-3 text-xs text-muted-foreground tabular-nums">
                  <span>Sıralama&nbsp;{r.org}</span>
                  <span>·</span>
                  <span>{r.ads} indirme</span>
                  <span>·</span>
                  <span>{r.cpa}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* --------------------------- REVIEW INTEL --------------------------- */

function ReviewIntel() {
  return (
    <section id="review-intelligence" className="relative">
      <div className="mx-auto max-w-7xl px-6 py-24 lg:py-32">
        <div className="max-w-3xl">
          <SectionEyebrow icon={MessageSquare}>YORUM ANALİZİ</SectionEyebrow>
          <h2 className="mt-4 text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-tight leading-[1.05]">
            Binlerce yorumu
            <br />
            <span className="text-muted-foreground">kolayca analiz edip fırsatları görün.</span>
          </h2>
          <p className="mt-5 text-base lg:text-lg text-muted-foreground max-w-2xl">
            Yorumları otomatik olarak analiz edin; yükselen şikâyetleri, en çok talep edilen
            özellikleri ve rakiplerin zayıf noktalarını hızla ortaya çıkarın.
          </p>
        </div>

        {/* AI SUMMARY BAR */}
        <div className="mt-14 rounded-2xl border border-violet/25 bg-background/40 px-6 py-5 flex flex-col md:flex-row md:items-center gap-4">
          <div className="flex items-center gap-2 shrink-0">
            <div className="h-8 w-8 rounded-lg border border-violet/30 bg-violet/10 grid place-items-center">
              <Brain className="h-4 w-4 text-violet" />
            </div>
            <span className="text-xs uppercase tracking-widest text-violet font-medium">
              AI ÖZETİ · SON 30 GÜN
            </span>
          </div>
          <p className="text-sm lg:text-base leading-relaxed">
            Son 30 günde fiyatla ilgili olumsuz yorumlar{" "}
            <strong className="text-danger">%38 arttı</strong>. Kullanıcılar en çok{" "}
            <strong className="text-foreground">çevrimdışı kullanım</strong> özelliği talep ediyor.
            Rakip <strong className="text-foreground">FitPro</strong>'da{" "}
            <strong className="text-foreground">login problemleri</strong> yorumları hızla artıyor.
          </p>
        </div>

        {/* THREE STRONG SIGNAL CARDS */}
        <div className="mt-6 grid lg:grid-cols-3 gap-6">
          <div className="rounded-2xl border border-border bg-card p-8 relative overflow-hidden">
            <div className="absolute -top-16 -right-16 h-40 w-40 rounded-full bg-danger/10 blur-3xl" />
            <div className="relative flex items-center gap-2 text-[11px] uppercase tracking-widest text-danger">
              <Flame className="h-3.5 w-3.5" /> En Hızlı Artan Şikâyet
            </div>
            <div className="relative mt-5 text-2xl font-semibold">Abonelik Fiyatı</div>
            <div className="relative mt-4 flex items-baseline gap-2">
              <div className="text-5xl lg:text-6xl font-semibold tabular-nums text-danger leading-none">
                +38%
              </div>
              <div className="text-xs text-muted-foreground">son 30 gün</div>
            </div>
            <div className="relative mt-6 h-10">
              <Sparkline data={[12, 14, 16, 18, 22, 26, 30, 34, 38, 42, 48, 54]} />
            </div>
            <div className="relative mt-4 text-xs text-muted-foreground">342 yorum ·</div>
          </div>

          <div className="rounded-2xl border border-border bg-card p-8 relative overflow-hidden">
            <div className="absolute -top-16 -right-16 h-40 w-40 rounded-full bg-success/10 blur-3xl" />
            <div className="relative flex items-center gap-2 text-[11px] uppercase tracking-widest text-success">
              <Lightbulb className="h-3.5 w-3.5" /> En Çok İstenen Özellik
            </div>
            <div className="relative mt-5 text-2xl font-semibold">Çevrimdışı Kullanım</div>
            <div className="relative mt-4 flex items-baseline gap-2">
              <div className="text-5xl lg:text-6xl font-semibold tabular-nums text-success leading-none">
                842
              </div>
              <div className="text-xs text-muted-foreground">talep</div>
            </div>
            <div className="relative mt-6 space-y-2">
              {[
                { l: "Çevrimdışı Kullanım", v: 842, tone: "success" },
                { l: "Koyu Tema", v: 512, tone: "muted" },
                { l: "Cihaz Desteği", v: 176, tone: "muted" },
              ].map((t) => (
                <div key={t.l} className="flex items-center gap-3 text-xs">
                  <div className="flex-1 truncate">{t.l}</div>
                  <div className="w-20 h-1 rounded-full bg-surface overflow-hidden">
                    <div
                      className={`h-full ${t.tone === "success" ? "bg-success" : "bg-muted-foreground/40"}`}
                      style={{ width: `${(t.v / 842) * 100}%` }}
                    />
                  </div>
                  <span className="tabular-nums text-muted-foreground w-10 text-right">{t.v}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-card p-8 relative overflow-hidden">
            <div className="absolute -top-16 -right-16 h-40 w-40 rounded-full bg-warning/10 blur-3xl" />
            <div className="relative flex items-center gap-2 text-[11px] uppercase tracking-widest text-warning">
              <AlertTriangle className="h-3.5 w-3.5" /> RAKIPTE ÖNE ÇIKAN SORUN
            </div>
            <div className="relative mt-5 text-2xl font-semibold">Giriş Sorunları</div>
            <div className="relative mt-4 flex items-baseline gap-2">
              <div className="text-5xl lg:text-6xl font-semibold tabular-nums text-warning leading-none">
                Yüksek
              </div>
            </div>
            <div className="relative mt-4 text-xs text-muted-foreground">
              FitPro yorumlarında sık tekrarlanıyor · farklılaşma fırsatı
            </div>
            <div className="relative mt-5 rounded-lg border border-border bg-surface/40 p-3 text-xs text-muted-foreground">
              "Uygulamaya giremiyorum" · "Şifre sıfırlama çalışmıyor"&nbsp;
            </div>
          </div>
        </div>

        {/* SENTIMENT STRIP */}
        <div className="mt-6 rounded-2xl border border-border bg-card p-6 flex flex-col md:flex-row md:items-center gap-6">
          <div className="flex items-center gap-2 text-xs text-success">
            <TrendingUp className="h-3.5 w-3.5" /> Duygu Eğilimi · 90 gün
          </div>
          <div className="flex items-baseline gap-2">
            <div className="text-3xl font-semibold tabular-nums">+18</div>
            <div className="text-xs text-success">net olumlu yorum sayısı</div>
          </div>
          <div className="flex-1 h-12">
            <Sparkline data={[45, 44, 46, 48, 47, 49, 52, 54, 55, 58, 60, 63]} />
          </div>
          <div className="flex flex-wrap gap-1.5">
            {["AI Özeti", "Duygu Analizi", "Konular", "Rakip Analizi", "Çeviri", "AI Yanıtı"].map(
              (t) => (
                <span
                  key={t}
                  className="text-[11px] px-2 py-1 rounded-md border border-border bg-surface/40 text-muted-foreground"
                >
                  {t}
                </span>
              ),
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------ FREE TOOLS ------------------------------ */

function FreeTools() {
  const tools = [
    {
      i: Wrench,
      t: "App Store Karakter Sayacı",
      d: "Başlık, alt başlık ve açıklama alanlarındaki karakter ve byte limitlerini gerçek zamanlı olarak kontrol edin.",
    },
    {
      i: Wrench,
      t: "iOS Anahtar Kelime Optimizasyonu",
      d: "iOS anahtar kelime alanı için en verimli ve tekrarsız kelime kombinasyonunu oluşturun.",
    },
    {
      i: Wrench,
      t: "Anahtar Kelime Yoğunluğu Analizi",
      d: "Metadata metninizde anahtar kelimelerin kullanım sıklığını ve dağılımını analiz edin.",
    },
    {
      i: Wrench,
      t: "Anahtar Kelime Kombinasyon Aracı",
      d: "Kelime köklerinden anlamlı, tekrarsız ve çakışmayan ASO kombinasyonları üretin.",
    },
    {
      i: Star,
      t: "Hedef Puan Hesaplayıcı",
      d: "Hedeflediğiniz ortalama puana ulaşmak için gereken yeni değerlendirme sayısını hesaplayın.",
    },
    {
      i: Eye,
      t: "Mağaza Sayfası Önizlemesi",
      d: "App Store ve Google Play mağaza sayfalarınızı yayınlamadan önce önizleyin.",
    },
    {
      i: Layers,
      t: "Ekran Görüntüsü Gereksinim Kontrolü",
      d: "Ekran görüntülerinizin cihaz, boyut ve mağaza gereksinimlerine uygunluğunu kontrol edin.",
    },
    {
      i: FileText,
      t: "Temel ASO Denetimi",
      d: "Metadata, kreatif ve mağaza görünürlüğünüzü analiz ederek temel sorunları ortaya çıkarın.",
    },
  ];
  return (
    <section id="free-aso-tools" className="border-y border-border bg-surface/10">
      <div className="mx-auto max-w-7xl px-6 py-20 lg:py-24">
        <div className="flex flex-wrap items-end justify-between gap-6 max-w-4xl">
          <div>
            <SectionEyebrow icon={Wrench}>Ücretsiz ASO Araçları</SectionEyebrow>
            <h2 className="mt-4 text-4xl sm:text-5xl font-semibold tracking-tight">
              Ücretsiz ASO araçları.
            </h2>
            <p className="mt-3 text-muted-foreground">
              Kayıt olmadan kullanın. Üyelik veya ücretli abonelik gerekmez.
            </p>
          </div>
          <Link
            to="/ucretsiz-aso-araclari"
            className="inline-flex items-center h-10 px-4 rounded-md border border-border bg-transparent text-sm hover:bg-surface transition"
          >
            Tüm Araçları Gör <ArrowRight className="h-4 w-4 ml-1.5" />
          </Link>
        </div>

        <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {tools.map((t) => (
            <div key={t.t} className="rounded-xl border border-border bg-card p-5">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-lg bg-surface-2 border border-border grid place-items-center">
                  <t.i className="h-4 w-4 text-cobalt" />
                </div>
                <div className="text-sm font-medium leading-snug">{t.t}</div>
              </div>
              <p className="mt-3 text-xs text-muted-foreground leading-relaxed">{t.d}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------ TOP APPS ------------------------------ */

const STORE_OPTS = [
  { v: "app-store", l: "App Store" },
  { v: "google-play", l: "Google Play" },
];
const COUNTRY_OPTS = [
  { v: "tr", l: "🇹🇷 Türkiye" },
  { v: "us", l: "🇺🇸 Amerika Birleşik Devletleri" },
  { v: "sa", l: "🇸🇦 Suudi Arabistan" },
  { v: "ae", l: "🇦🇪 Birleşik Arap Emirlikleri" },
  { v: "de", l: "🇩🇪 Almanya" },
  { v: "gb", l: "🇬🇧 Birleşik Krallık" },
];
const CATEGORY_OPTS = [
  { v: "overall", l: "Genel" },
  { v: "games", l: "Oyunlar" },
  { v: "health-fitness", l: "Sağlık & Fitness" },
  { v: "finance", l: "Finans" },
  { v: "productivity", l: "Verimlilik" },
  { v: "education", l: "Eğitim" },
  { v: "entertainment", l: "Eğlence" },
  { v: "shopping", l: "Alışveriş" },
];

const APP_POOLS: Record<string, string[]> = {
  "health-fitness": [
    "PulseFit",
    "StepJoy",
    "Cardio Lab",
    "YogaKit",
    "RunMate",
    "FitLoop",
    "MoveWell",
    "SleepArc",
  ],
  games: [
    "Pixel Quest",
    "Arcane Rush",
    "Blockade",
    "Kingdom Fall",
    "TapVerse",
    "Speedster",
    "Neon Dash",
    "Sky Duel",
  ],
  finance: [
    "Wallet+",
    "Sparo",
    "LedgerX",
    "CoinPath",
    "BudgetIQ",
    "MoneyMap",
    "PayFlow",
    "StackFin",
  ],
  productivity: [
    "Focusly",
    "TaskArc",
    "NotePeak",
    "Flowdesk",
    "Draftly",
    "Kanbo",
    "TimeVault",
    "Zenpad",
  ],
  education: [
    "Learnly",
    "Kodex",
    "MindLab",
    "Studeo",
    "Prisma Edu",
    "Grammarix",
    "SkillTree",
    "Wordward",
  ],
  entertainment: [
    "Streamly",
    "Vibe",
    "TuneOrbit",
    "PodBeat",
    "ReelLoop",
    "ChilliTV",
    "Playpal",
    "Rhythmly",
  ],
  shopping: ["Cartly", "Shopwave", "Trendio", "Buylane", "Marketo", "Priceo", "Fetchly", "Nowmart"],
  overall: [
    "Chatly",
    "Photoglow",
    "MapGo",
    "Vaultly",
    "LinkNest",
    "Snapline",
    "Notewise",
    "Newsly",
  ],
};

const CAT_LABELS: Record<string, string> = {
  "health-fitness": "Sağlık & Fitness",
  games: "Oyunlar",
  finance: "Finans",
  productivity: "Verimlilik",
  education: "Eğitim",
  entertainment: "Eğlence",
  shopping: "Alışveriş",
  overall: "Genel",
};

type ShotKind = "calories" | "goals" | "steps" | "progress" | "habits" | "social" | "cta" | "basic";
type Shot = { title: string; sub: string; accent: string; kind: ShotKind; tone: "old" | "new" };
type CreativeSet = {
  date: string;
  version: string;
  iconLabel: string;
  iconGradient: string;
  headline: string;
  shots: Shot[];
};

const CREATIVE_DATA: Record<"app" | "play", { before: CreativeSet; after: CreativeSet }> = {
  app: {
    before: {
      date: "12 Mayıs",
      version: "v3.4.0",
      iconLabel: "FL",
      iconGradient: "from-slate-500 to-slate-700",
      headline: "Fitness & Kalori Takibi",
      shots: [
        {
          title: "Kalori Takibi",
          sub: "Günlük giriş",
          accent: "from-slate-700/60 to-slate-900/60",
          kind: "calories",
          tone: "old",
        },
        {
          title: "Hedefler",
          sub: "Kilo & aktivite",
          accent: "from-slate-700/60 to-slate-900/60",
          kind: "goals",
          tone: "old",
        },
        {
          title: "Adım Sayar",
          sub: "Otomatik izleme",
          accent: "from-slate-700/60 to-slate-900/60",
          kind: "steps",
          tone: "old",
        },
        {
          title: "İlerleme",
          sub: "Aylık rapor",
          accent: "from-slate-700/60 to-slate-900/60",
          kind: "progress",
          tone: "old",
        },
        {
          title: "Alışkanlıklar",
          sub: "Günlük seri",
          accent: "from-slate-700/60 to-slate-900/60",
          kind: "habits",
          tone: "old",
        },
      ],
    },
    after: {
      date: "28 Mayıs",
      version: "v3.5.0",
      iconLabel: "FL",
      iconGradient: "from-cobalt to-violet",
      headline: "Günlük kalorini takip et. Hedeflerine ulaş.",
      shots: [
        {
          title: "Günlük kalorini takip et",
          sub: "1,842 / 2,200 kcal",
          accent: "from-cobalt/50 to-violet/40",
          kind: "calories",
          tone: "new",
        },
        {
          title: "Hedeflerine ulaş",
          sub: "-4.2 kg · 6 hafta",
          accent: "from-violet/50 to-cobalt/40",
          kind: "goals",
          tone: "new",
        },
        {
          title: "Adımlarını ve aktivitelerini izle",
          sub: "★ 4.8 · 120K yorum",
          accent: "from-cobalt/50 to-cobalt/20",
          kind: "social",
          tone: "new",
        },
        {
          title: "İlerlemeni tek ekranda gör",
          sub: "Haftalık özet",
          accent: "from-violet/40 to-cobalt/40",
          kind: "progress",
          tone: "new",
        },
        {
          title: "Sağlıklı alışkanlıklar oluştur",
          sub: "Ücretsiz Başla →",
          accent: "from-cobalt/60 to-violet/30",
          kind: "cta",
          tone: "new",
        },
      ],
    },
  },
  play: {
    before: {
      date: "12 Mayıs",
      version: "v3.4.0",
      iconLabel: "FL",
      iconGradient: "from-slate-500 to-slate-700",
      headline: "FitLoop — Fitness & Adım Sayar",
      shots: [
        {
          title: "Adım Sayar",
          sub: "Günlük hedefler",
          accent: "from-slate-700/60 to-slate-900/60",
          kind: "steps",
          tone: "old",
        },
        {
          title: "Kalori Günlüğü",
          sub: "Yeme takibi",
          accent: "from-slate-700/60 to-slate-900/60",
          kind: "calories",
          tone: "old",
        },
        {
          title: "Hedefler",
          sub: "Kilo yönetimi",
          accent: "from-slate-700/60 to-slate-900/60",
          kind: "goals",
          tone: "old",
        },
        {
          title: "İlerleme",
          sub: "Aylık rapor",
          accent: "from-slate-700/60 to-slate-900/60",
          kind: "progress",
          tone: "old",
        },
      ],
    },
    after: {
      date: "28 Mayıs",
      version: "v3.5.0",
      iconLabel: "FL",
      iconGradient: "from-cobalt to-violet",
      headline: "Günlük kalorini takip et — AI Koçunla",
      shots: [
        {
          title: "Günlük kalorini takip et",
          sub: "AI destekli günlük",
          accent: "from-cobalt/50 to-violet/40",
          kind: "calories",
          tone: "new",
        },
        {
          title: "Hedeflerine ulaş",
          sub: "Kişisel plan",
          accent: "from-violet/50 to-cobalt/40",
          kind: "goals",
          tone: "new",
        },
        {
          title: "Adımlarını ve aktivitelerini izle",
          sub: "★ 4.7 · 340K yorum",
          accent: "from-cobalt/50 to-cobalt/20",
          kind: "social",
          tone: "new",
        },
        {
          title: "İlerlemeni tek ekranda gör",
          sub: "Haftalık özet",
          accent: "from-violet/40 to-cobalt/40",
          kind: "progress",
          tone: "new",
        },
        {
          title: "Sağlıklı alışkanlıklar oluştur",
          sub: "Hemen Dene →",
          accent: "from-cobalt/60 to-violet/30",
          kind: "cta",
          tone: "new",
        },
      ],
    },
  },
};

function ShotMock({ shot, size = "sm" }: { shot: Shot; size?: "sm" | "lg" }) {
  const isNew = shot.tone === "new";
  const accentText = isNew ? "text-foreground" : "text-slate-300";
  const primaryBar = isNew ? "bg-cobalt" : "bg-slate-500";
  const secondaryBar = isNew ? "bg-violet/70" : "bg-slate-600";
  const chip = isNew
    ? "bg-cobalt/25 text-cobalt border-cobalt/40"
    : "bg-slate-700/60 text-slate-300 border-slate-600/60";
  const s = size === "lg";
  const px = s ? "p-3" : "p-1.5";
  const titleCls = s ? "text-[11px]" : "text-[8px]";
  const subCls = s ? "text-[9px]" : "text-[7px]";

  const renderBody = () => {
    switch (shot.kind) {
      case "calories":
        return (
          <div className="mt-1 flex-1 flex flex-col items-center justify-center gap-1">
            <div
              className={`relative ${s ? "h-16 w-16" : "h-9 w-9"} rounded-full border-[3px] border-foreground/10`}
            >
              <div
                className={`absolute inset-0 rounded-full border-[3px] ${isNew ? "border-cobalt" : "border-slate-500"} border-b-transparent border-l-transparent rotate-[130deg]`}
              />
              <div
                className={`absolute inset-0 grid place-items-center ${s ? "text-[10px]" : "text-[6px]"} font-bold ${accentText}`}
              >
                1842
              </div>
            </div>
            <div className={`${subCls} text-muted-foreground`}>kcal · 84%</div>
          </div>
        );
      case "goals":
        return (
          <div className="mt-1 flex-1 flex flex-col justify-center gap-1">
            {[70, 55, 82].map((v, i) => (
              <div key={i}>
                <div className={`h-1 rounded-full bg-foreground/10 overflow-hidden`}>
                  <div
                    className={`h-full ${i % 2 ? secondaryBar : primaryBar}`}
                    style={{ width: `${v}%` }}
                  />
                </div>
              </div>
            ))}
            <div className={`${subCls} ${accentText} font-medium mt-0.5`}>-4.2 kg</div>
          </div>
        );
      case "steps":
        return (
          <div className="mt-1 flex-1 flex flex-col justify-center gap-1">
            <div
              className={`${s ? "text-lg" : "text-[10px]"} font-bold ${accentText} tabular-nums`}
            >
              8,240
            </div>
            <div className="flex items-end gap-0.5 h-8">
              {[40, 65, 30, 80, 55, 90, 70].map((v, i) => (
                <div
                  key={i}
                  className={`flex-1 ${primaryBar} rounded-sm`}
                  style={{ height: `${v}%` }}
                />
              ))}
            </div>
          </div>
        );
      case "progress":
        return (
          <div className="mt-1 flex-1 flex flex-col justify-center">
            <svg viewBox="0 0 100 40" className="w-full h-full" preserveAspectRatio="none">
              <polyline
                points="0,30 15,26 30,28 45,20 60,22 75,12 100,8"
                fill="none"
                stroke={isNew ? "var(--cobalt)" : "#64748b"}
                strokeWidth="2"
              />
              <polyline
                points="0,30 15,26 30,28 45,20 60,22 75,12 100,8 100,40 0,40"
                fill={isNew ? "url(#g1)" : "#64748b33"}
                opacity="0.3"
              />
              <defs>
                <linearGradient id="g1" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0" stopColor="var(--cobalt)" stopOpacity="0.5" />
                  <stop offset="1" stopColor="var(--cobalt)" stopOpacity="0" />
                </linearGradient>
              </defs>
            </svg>
          </div>
        );
      case "habits":
        return (
          <div className="mt-1 flex-1 grid grid-cols-4 gap-0.5 content-center">
            {Array.from({ length: 16 }).map((_, i) => (
              <div
                key={i}
                className={`aspect-square rounded-[2px] ${[2, 5, 7, 8, 9, 11, 13, 14].includes(i) ? primaryBar : "bg-foreground/10"}`}
              />
            ))}
          </div>
        );
      case "social":
        return (
          <div className="mt-1 flex-1 flex flex-col items-center justify-center gap-1">
            <div className={`${s ? "text-base" : "text-[10px]"} font-bold text-warning`}>★ 4.8</div>
            <div className={`${subCls} text-muted-foreground`}>120K yorum</div>
            <div className={`px-1.5 py-0.5 rounded-full border ${chip} ${subCls} font-medium`}>
              Editor's Choice
            </div>
          </div>
        );
      case "cta":
        return (
          <div className="mt-1 flex-1 flex flex-col justify-end gap-1">
            <div className={`${subCls} ${accentText} leading-tight`}>7 gün ücretsiz</div>
            <div
              className={`rounded-md ${primaryBar} ${s ? "py-1.5 text-[10px]" : "py-1 text-[7px]"} text-center font-semibold text-primary-foreground`}
            >
              Ücretsiz Başla →
            </div>
          </div>
        );
      default:
        return <div className="flex-1" />;
    }
  };

  return (
    <div className={`h-full w-full flex flex-col ${px}`}>
      <div className={`${titleCls} font-semibold ${accentText} leading-tight`}>{shot.title}</div>
      <div className={`${subCls} text-muted-foreground mt-0.5 leading-tight`}>{shot.sub}</div>
      {renderBody()}
    </div>
  );
}

function CreativeCard({
  set,
  label,
  tone,
  store,
  activeShot,
  onShotClick,
}: {
  set: CreativeSet;
  label: string;
  tone: "before" | "after";
  store: "app" | "play";
  activeShot: number;
  onShotClick: (i: number) => void;
}) {
  const isAfter = tone === "after";
  const isPlay = store === "play";
  return (
    <div
      className={`rounded-2xl border p-4 ${isAfter ? "border-cobalt/40 bg-cobalt-soft" : "border-border bg-background/40"}`}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span
            className={`text-[10px] uppercase tracking-widest font-semibold ${isAfter ? "text-cobalt" : "text-muted-foreground"}`}
          >
            {label}
          </span>
          <span className="text-xs text-muted-foreground">· {set.date}</span>
        </div>
        <span className="text-[10px] text-muted-foreground tabular-nums">{set.version}</span>
      </div>

      <div className="flex items-center gap-3 mb-3">
        <div
          className={`h-12 w-12 rounded-2xl bg-gradient-to-br ${set.iconGradient} grid place-items-center text-primary-foreground text-sm font-bold shadow-lg`}
        >
          {set.iconLabel}
        </div>
        <div className="min-w-0">
          <div className="text-sm font-medium truncate">{set.headline}</div>
          <div className="text-[11px] text-muted-foreground">
            {isPlay
              ? "Google Play · Feature Graphic + Ekran Görüntüleri"
              : 'App Store · iPhone 6.7" Screenshots'}
          </div>
        </div>
      </div>

      {isPlay && (
        <div
          className={`aspect-[1024/500] rounded-lg mb-2 border border-border overflow-hidden bg-gradient-to-br ${isAfter ? "from-cobalt/30 to-violet/30" : "from-slate-700/40 to-slate-900/50"} p-3 flex items-center gap-3`}
        >
          <div
            className={`h-14 w-14 rounded-2xl bg-gradient-to-br ${set.iconGradient} grid place-items-center text-primary-foreground font-bold shadow-lg shrink-0`}
          >
            {set.iconLabel}
          </div>
          <div className="min-w-0">
            <div className="text-[11px] font-semibold leading-tight">{set.headline}</div>
            <div className="text-[9px] text-muted-foreground mt-0.5">
              Feature Graphic · 1024×500
            </div>
            <div
              className={`mt-1.5 inline-block px-2 py-0.5 rounded-full text-[8px] font-medium ${isAfter ? "bg-cobalt/30 text-cobalt" : "bg-slate-700/60 text-slate-300"}`}
            >
              {isAfter ? "★ 4.7 · Editor's Choice" : "Health & Fitness"}
            </div>
          </div>
        </div>
      )}

      <div className={`grid gap-1.5 ${set.shots.length >= 5 ? "grid-cols-5" : "grid-cols-4"}`}>
        {set.shots.map((s, i) => {
          const active = i === activeShot;
          return (
            <button
              key={i}
              type="button"
              onClick={() => onShotClick(i)}
              className={`relative aspect-[9/19.5] rounded-[10px] border overflow-hidden bg-gradient-to-b ${s.accent} text-left transition ${active ? "border-cobalt ring-2 ring-cobalt/40" : "border-border hover:border-cobalt/40"}`}
            >
              <ShotMock shot={s} />
              <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-6 h-0.5 rounded-full bg-foreground/20" />
            </button>
          );
        })}
      </div>

      {!isPlay && (
        <div className="mt-2 rounded-md border border-border bg-background/40 px-2 py-1.5 flex items-center gap-1.5 text-[10px] text-muted-foreground">
          <Play className="h-3 w-3 text-violet" /> App Preview · 22 sn
        </div>
      )}
    </div>
  );
}

function CreativeCompare({ store }: { store: "app" | "play" }) {
  const data = CREATIVE_DATA[store];
  const [view, setView] = useState<"side" | "before" | "after">("side");
  const [activeShot, setActiveShot] = useState(0);

  useEffect(() => {
    setActiveShot(0);
  }, [store]);

  const showBefore = view !== "after";
  const showAfter = view !== "before";

  return (
    <div className="mt-4 space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="text-xs text-muted-foreground">
          Kreatif karşılaştırma · {store === "app" ? "App Store" : "Google Play"}
        </div>
        <div className="inline-flex items-center rounded-lg border border-border bg-background/40 p-0.5 text-[11px]">
          {[
            { v: "before", l: "Önce" },
            { v: "side", l: "Yan Yana" },
            { v: "after", l: "Sonra" },
          ].map((o) => (
            <button
              key={o.v}
              type="button"
              onClick={() => setView(o.v as typeof view)}
              className={`px-2.5 py-1 rounded-md transition ${view === o.v ? "bg-surface-2 text-foreground" : "text-muted-foreground hover:text-foreground"}`}
            >
              {o.l}
            </button>
          ))}
        </div>
      </div>

      <div
        key={`${store}-${view}`}
        className={`grid gap-3 animate-in fade-in duration-200 ${view === "side" ? "md:grid-cols-2" : "grid-cols-1"}`}
      >
        {showBefore && (
          <CreativeCard
            set={data.before}
            label="Önce"
            tone="before"
            store={store}
            activeShot={activeShot}
            onShotClick={setActiveShot}
          />
        )}
        {showAfter && (
          <CreativeCard
            set={data.after}
            label="Sonra"
            tone="after"
            store={store}
            activeShot={activeShot}
            onShotClick={setActiveShot}
          />
        )}
      </div>

      {/* Persistent large preview — Before + After side by side for the selected shot */}
      {(() => {
        const idxB = Math.min(activeShot, data.before.shots.length - 1);
        const idxA = Math.min(activeShot, data.after.shots.length - 1);
        const before = data.before.shots[idxB];
        const after = data.after.shots[idxA];
        return (
          <div className="rounded-xl border border-border bg-background/40 p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
                Seçili Ekran · #{activeShot + 1}
              </div>
              <div className="text-[10px] text-muted-foreground">
                Küçük resimlere tıklayarak sürümleri karşılaştırın
              </div>
            </div>
            <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-4">
              <div className="flex flex-col items-center gap-2">
                <div
                  className={`aspect-[9/19.5] w-32 md:w-40 rounded-[16px] border border-border bg-gradient-to-b ${before.accent} overflow-hidden`}
                >
                  <ShotMock shot={before} size="lg" />
                </div>
                <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
                  Önce · {data.before.date}
                </div>
              </div>
              <div className="flex flex-col items-center gap-1.5 text-muted-foreground">
                <ArrowRight className="h-4 w-4" />
                <span className="text-[10px] uppercase tracking-widest">Değişim</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <div
                  className={`aspect-[9/19.5] w-32 md:w-40 rounded-[16px] border border-cobalt/40 ring-1 ring-cobalt/20 bg-gradient-to-b ${after.accent} overflow-hidden`}
                >
                  <ShotMock shot={after} size="lg" />
                </div>
                <div className="text-[10px] uppercase tracking-widest text-cobalt">
                  Sonra · {data.after.date}
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      <div className="grid md:grid-cols-2 gap-3">
        <div className="rounded-xl border border-border bg-background/40 p-4">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="h-3.5 w-3.5 text-cobalt" />
            <span className="text-xs font-semibold">3 önemli değişiklik algılandı</span>
          </div>
          <ol className="divide-y divide-hairline text-xs">
            {[
              {
                t: "İlk ekran mesajı sadeleştirildi",
                d: "Ana değer önerisi daha hızlı anlaşılacak şekilde öne çıkarıldı.",
              },
              {
                t: "Kalori takibi ana değer önerisi haline getirildi",
                d: "En güçlü ürün faydası görsel hiyerarşide daha belirgin hale getirildi.",
              },
              {
                t: "CTA daha doğrudan hale getirildi",
                d: "Kullanıcının atması beklenen sonraki adım daha açık hale getirildi.",
              },
            ].map((it, i) => (
              <li key={i} className="flex gap-3 py-2.5 first:pt-0 last:pb-0">
                <span className="font-mono tabular-nums text-[10px] text-muted-foreground pt-0.5 w-4 shrink-0">
                  0{i + 1}
                </span>
                <div className="min-w-0">
                  <div className="text-foreground font-medium leading-snug">{it.t}</div>
                  <div className="text-muted-foreground leading-snug mt-0.5">{it.d}</div>
                </div>
              </li>
            ))}
          </ol>
        </div>
        <div className="rounded-xl border border-border bg-background/40 p-4">
          <div className="flex items-center gap-2 mb-1">
            <Activity className="h-3.5 w-3.5 text-violet" />
            <span className="text-xs font-semibold">Değişiklik Sonrası Gözlenen</span>
          </div>
          <div className="text-[10px] text-muted-foreground mb-3">
            Algılanan değişiklik sonrasında gözlemlendi · nedensellik değil.
          </div>
          <div className="space-y-2 text-xs">
            <div className="flex items-baseline justify-between gap-3 rounded-lg border border-border bg-surface/40 px-3 py-2">
              <div className="text-muted-foreground">Dönüşüm</div>
              <div className="font-mono tabular-nums text-sm text-success">%4.8 → %5.2</div>
            </div>
            <div className="flex items-baseline justify-between gap-3 rounded-lg border border-border bg-surface/40 px-3 py-2">
              <div className="text-muted-foreground">Arama Kaynaklı İndirmeler</div>
              <div className="font-mono tabular-nums text-sm text-success">%+11</div>
            </div>
            <div className="flex items-baseline justify-between gap-3 rounded-lg border border-border bg-surface/40 px-3 py-2">
              <div className="text-muted-foreground">Ürün Sayfası Görüntülemeleri</div>
              <div className="font-mono tabular-nums text-sm text-foreground/80">Stabil</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function makeTopApps(store: string, country: string, cat: string, type: string) {
  const seed = (store + country + cat + type).split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  const pool = APP_POOLS[cat] ?? APP_POOLS.overall;
  return Array.from({ length: 5 }).map((_, i) => {
    const idx = (seed + i * 3) % pool.length;
    const n = pool[idx];
    const s = (seed + i * 7) % 10;
    const up: boolean | null = s < 4 ? true : s < 7 ? false : null;
    const num = up === null ? 0 : (s % 5) + 1;
    return { r: i + 1, n, cat: CAT_LABELS[cat], up, d: up === null ? "0" : (up ? "+" : "-") + num };
  });
}

function FilterSelect({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: { v: string; l: string }[];
  onChange: (v: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [activeIdx, setActiveIdx] = useState(() =>
    Math.max(
      0,
      options.findIndex((o) => o.v === value),
    ),
  );
  const ref = useRef<HTMLDivElement>(null);
  const btnRef = useRef<HTMLButtonElement>(null);
  const current = options.find((o) => o.v === value);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        btnRef.current?.focus();
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        setActiveIdx((i) => (i + 1) % options.length);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setActiveIdx((i) => (i - 1 + options.length) % options.length);
      } else if (e.key === "Enter") {
        e.preventDefault();
        onChange(options[activeIdx].v);
        setOpen(false);
        btnRef.current?.focus();
      }
    };
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open, activeIdx, options, onChange]);

  return (
    <div ref={ref} className="relative">
      <button
        ref={btnRef}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => {
          setOpen((o) => !o);
          setActiveIdx(
            Math.max(
              0,
              options.findIndex((o) => o.v === value),
            ),
          );
        }}
        className="flex items-center gap-2 rounded-lg border border-border bg-surface/40 px-3 py-1.5 text-xs hover:bg-surface transition"
      >
        <span className="text-muted-foreground">{label}:</span>
        <span className="font-medium text-foreground">{current?.l ?? ""}</span>
        <ChevronDown
          className={`h-3 w-3 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && (
        <div
          role="listbox"
          className="absolute left-0 top-[calc(100%+6px)] z-50 min-w-[220px] rounded-xl border border-border bg-card shadow-xl shadow-black/40 p-1 animate-in fade-in zoom-in-95 duration-150 origin-top-left"
        >
          {options.map((o, i) => {
            const selected = o.v === value;
            const active = i === activeIdx;
            return (
              <button
                key={o.v}
                type="button"
                role="option"
                aria-selected={selected}
                onMouseEnter={() => setActiveIdx(i)}
                onClick={() => {
                  onChange(o.v);
                  setOpen(false);
                  btnRef.current?.focus();
                }}
                className={`w-full flex items-center justify-between gap-3 rounded-lg px-3 py-2 text-sm text-left transition ${active ? "bg-surface-2 text-foreground" : "text-muted-foreground hover:text-foreground"}`}
              >
                <span className={selected ? "text-foreground font-medium" : ""}>{o.l}</span>
                {selected && <Check className="h-3.5 w-3.5 text-cobalt" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

function TopApps() {
  const [store, setStore] = useState("app-store");
  const [country, setCountry] = useState("tr");
  const [cat, setCat] = useState("health-fitness");
  const [type, setType] = useState("top-free");
  const typeOpts = [
    { v: "top-free", l: "En İyi Ücretsiz" },
    { v: "top-paid", l: "En İyi Ücretli" },
    { v: "top-grossing", l: "En Çok Gelir" },
  ];
  const apps = makeTopApps(store, country, cat, type);
  const href = `/top-apps?store=${store}&country=${country}&category=${cat}&type=${type}`;
  return (
    <section id="top-apps" className="mx-auto max-w-7xl px-6 pt-12 lg:pt-16 pb-24 lg:pb-32">
      <div className="max-w-2xl">
        <SectionEyebrow icon={Trophy}>En İyi Uygulamalar</SectionEyebrow>
        <h2 className="mt-4 text-4xl sm:text-5xl font-semibold tracking-tight">
          Her pazarda en iyi uygulamaları
          <br />
          <span className="text-muted-foreground">keşfedin.</span>
        </h2>
      </div>

      <div className="mt-14 rounded-2xl border border-border bg-card overflow-hidden">
        <div className="border-b border-border p-4 flex flex-wrap gap-2 items-center">
          <FilterSelect label="Mağaza" value={store} options={STORE_OPTS} onChange={setStore} />
          <FilterSelect label="Ülke" value={country} options={COUNTRY_OPTS} onChange={setCountry} />
          <FilterSelect label="Kategori" value={cat} options={CATEGORY_OPTS} onChange={setCat} />
          <FilterSelect label="Liste Türü" value={type} options={typeOpts} onChange={setType} />
        </div>

        <div key={`${store}-${country}-${cat}-${type}`} className="animate-in fade-in duration-300">
          {apps.map((a) => (
            <div
              key={a.r}
              className="grid grid-cols-[40px_48px_1fr_auto] gap-4 items-center px-6 py-4 border-b border-border last:border-0 hover:bg-surface/30 transition"
            >
              <span className="text-2xl font-semibold tabular-nums text-muted-foreground">
                #{a.r}
              </span>
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-cobalt to-violet grid place-items-center text-primary-foreground font-semibold">
                {a.n[0]}
              </div>
              <div>
                <div className="font-medium">{a.n}</div>
                <div className="text-xs text-muted-foreground">{a.cat}</div>
              </div>
              <div
                className={`text-sm tabular-nums flex items-center gap-1 ${a.up === true ? "text-success" : a.up === false ? "text-danger" : "text-muted-foreground"}`}
              >
                {a.up === true ? (
                  <ArrowUp className="h-3 w-3" />
                ) : a.up === false ? (
                  <ArrowDown className="h-3 w-3" />
                ) : (
                  "—"
                )}
                {a.d}
              </div>
            </div>
          ))}
        </div>

        <div className="p-4 border-t border-border flex items-center justify-between">
          <span className="text-xs text-muted-foreground">
            Anlık sıralamalar herkese açıktır. Tarihsel derinlik platform içindedir.
          </span>
          <a
            href={href}
            className="inline-flex items-center h-8 px-3 rounded-md border border-border bg-transparent text-xs hover:bg-surface transition"
          >
            İlk 100'ü Gör <ArrowRight className="h-3 w-3 ml-1.5" />
          </a>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------ DEMO ------------------------------ */

function DemoSection() {
  return (
    <section
      id="demo"
      className="border-y border-border bg-gradient-to-b from-surface/10 to-background"
    >
      <div className="mx-auto max-w-7xl px-6 py-24 lg:py-32">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <SectionEyebrow icon={Play}>Herkese Açık Demo</SectionEyebrow>
            <h2 className="mt-4 text-4xl sm:text-5xl font-semibold tracking-tight">
              Üye olmadan
              <br />
              <span className="text-muted-foreground">ürünü keşfedin.</span>
            </h2>
            <p className="mt-4 text-muted-foreground leading-relaxed max-w-lg">
              Instagram'ın herkese açık verileriyle hazırlanmış salt okunur demo üzerinden
              platformun nasıl çalıştığını inceleyin. Anahtar kelime analizi, rakip analizi,
              tarihsel değişiklikler, kreatif zekâsı, yorumlar, pazar fırsatları ve yapay zekâ
              içgörüleri — hepsi canlı örneklerle.
            </p>
            <div className="mt-8 flex flex-wrap gap-2">
              {[
                "Anahtar Kelime",
                "Rakipler",
                "Tarihsel",
                "Kreatif",
                "Yorumlar",
                "Pazarlar",
                "AI İçgörüleri",
              ].map((t) => (
                <span
                  key={t}
                  className="text-xs px-2.5 py-1 rounded-md border border-border bg-surface/40 text-muted-foreground"
                >
                  {t}
                </span>
              ))}
            </div>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button className="bg-foreground text-background hover:bg-foreground/90">
                Demoyu İncele <ArrowRight className="h-4 w-4 ml-1.5" />
              </Button>
              <span className="text-xs text-muted-foreground self-center">
                Salt okunur · Kayıt gerekmez
              </span>
            </div>
          </div>

          <div className="relative rounded-2xl border border-border bg-card p-8 shadow-[0_20px_80px_-20px_rgba(0,0,0,0.6)]">
            <div className="absolute -top-16 -right-16 h-40 w-40 bg-violet/20 blur-3xl rounded-full" />
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-pink-500 via-orange-400 to-yellow-400 grid place-items-center text-primary-foreground font-bold text-2xl shadow-lg">
                Ig
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Demo Uygulama</div>
                <div className="text-lg font-semibold">Instagram</div>
                <div className="text-xs text-muted-foreground">Fotoğraf & Video · Meta</div>
              </div>
              <div className="ml-auto text-xs px-2 py-1 rounded-md border border-cobalt/30 text-cobalt bg-cobalt-soft">
                Salt Okunur
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <MiniStat label="Takip edilen kelime" v="14.2K" />
              <MiniStat label="Ülke" v="83" />
              <MiniStat label="Rakip" v="12" />
              <MiniStat label="AI içgörüsü" v="46" />
            </div>

            <div className="mt-4 rounded-xl border border-border bg-surface/30 p-4">
              <div className="text-xs text-muted-foreground">Örnek AI özet</div>
              <p className="mt-1.5 text-sm">
                Reels güncellemesinden sonra 22 keyword'de ortalama +6 sıralama artışı gözlendi.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function MiniStat({ label, v }: { label: string; v: string }) {
  return (
    <div className="rounded-lg border border-border bg-surface/30 p-3">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="text-xl font-semibold tabular-nums mt-0.5">{v}</div>
    </div>
  );
}

/* --------------------------- GLOBAL PLATFORM --------------------------- */

function GlobalPlatform() {
  return (
    <section className="mx-auto max-w-7xl px-6 py-24">
      <div className="rounded-2xl border border-border bg-card p-8 lg:p-12 grid lg:grid-cols-2 gap-10 items-center">
        <div>
          <SectionEyebrow icon={Languages}>Küresel Platform</SectionEyebrow>
          <h2 className="mt-4 text-3xl sm:text-4xl font-semibold tracking-tight">
            Global büyüme için tasarlandı.
          </h2>
          <p className="mt-3 text-muted-foreground">
            Arayüz dilini seçin, analiz edeceğiniz ülkeyi bağımsız olarak belirleyin. Arapça için
            tam RTL desteği. Dünya üzerinde erişilebilen tüm App Store ve Google Play pazarları.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {[
            { l: "Türkçe", c: "TR" },
            { l: "English", c: "EN" },
            { l: "Arapça", c: "AR", rtl: true },
            { l: "Español", c: "ES" },
          ].map((lang) => (
            <div
              key={lang.c}
              className="flex items-center justify-between rounded-xl border border-border bg-surface/40 px-4 py-3"
            >
              <span className={`text-sm ${lang.rtl ? "font-medium" : ""}`}>{lang.l}</span>
              <span className="text-[10px] tracking-widest text-muted-foreground border border-border rounded px-1.5 py-0.5">
                {lang.rtl ? "RTL" : lang.c}
              </span>
            </div>
          ))}
          <div className="col-span-2 flex items-center gap-2 rounded-xl border border-cobalt/30 bg-cobalt-soft px-4 py-3 text-sm">
            <MapPin className="h-4 w-4 text-cobalt" />
            <span>Ülke ve dil seçimleri birbirinden bağımsızdır.</span>
          </div>
        </div>
      </div>
    </section>
  );
}

/* --------------------------- TESTIMONIALS --------------------------- */

function Testimonials() {
  const items = [
    {
      q: "Platform sayesinde yalnızca sıralamaları takip etmek yerine hangi keyword'lere gerçekten odaklanmamız gerektiğini görebiliyoruz.",
      n: "Örnek Müşteri",
      r: "Founder — Örnek Uygulama",
      app: "A",
    },
    {
      q: "AI Growth Advisor, veri ekibimizin bir haftada yaptığı analizin özetini bize dakikalar içinde sunuyor.",
      n: "Örnek Müşteri",
      r: "Head of Growth — Örnek Uygulama",
      app: "B",
    },
    {
      q: "Rakip timeline'ı, benim rekabet analizinde harcadığım zamanı en az yarıya indirdi.",
      n: "Örnek Müşteri",
      r: "ASO Lead — Örnek Uygulama",
      app: "C",
    },
  ];
  return (
    <section
      id="testimonials"
      className="border-y border-border bg-gradient-to-b from-background to-surface/10"
    >
      <div className="mx-auto max-w-7xl px-6 py-24 lg:py-32">
        <div className="max-w-2xl">
          <SectionEyebrow icon={Sparkles}>Müşteri Yorumları</SectionEyebrow>
          <h2 className="mt-4 text-4xl sm:text-5xl font-semibold tracking-tight">
            Uygulama geliştiricileri ve büyüme ekipleri
            <br />
            <span className="text-muted-foreground">ne diyor?</span>
          </h2>
        </div>

        <div className="mt-14 grid md:grid-cols-3 gap-4">
          {items.map((t, i) => (
            <figure key={i} className="rounded-2xl border border-border bg-card p-6 flex flex-col">
              <div className="text-cobalt text-2xl leading-none">"</div>
              <blockquote className="mt-2 text-sm leading-relaxed flex-1">{t.q}</blockquote>
              <figcaption className="mt-6 flex items-center gap-3 pt-6 border-t border-border">
                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-surface to-surface-2 border border-border" />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium">{t.n}</div>
                  <div className="text-xs text-muted-foreground truncate">{t.r}</div>
                </div>
                <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-cobalt to-violet grid place-items-center text-primary-foreground text-xs font-bold">
                  {t.app}
                </div>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ----------------------------- FINAL CTA ----------------------------- */

function FinalCTA() {
  return (
    <section id="pricing" className="mx-auto max-w-7xl px-6 py-24 lg:py-32">
      <div className="relative rounded-3xl border border-border bg-card overflow-hidden p-12 lg:p-20 text-center">
        <div className="absolute inset-0 bg-radial-cobalt opacity-70" />
        <div className="absolute inset-0 bg-grid opacity-20 [mask-image:radial-gradient(ellipse_at_center,black,transparent_70%)]" />
        <div className="relative">
          <h2 className="text-4xl sm:text-6xl font-semibold tracking-tight max-w-3xl mx-auto">
            Bir sonraki adımınızı
            <br />
            <span className="bg-gradient-to-br from-white to-cobalt bg-clip-text text-transparent">
              şansa bırakmayın.
            </span>
          </h2>
          <p className="mt-6 text-muted-foreground max-w-xl mx-auto">
            Uygulamanızı, rakiplerinizi ve pazarınızı anlayın.&nbsp;
            <br />
            Her sinyali net bir büyüme fırsatına dönüştürün.
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-3">
            <Button
              size="lg"
              className="bg-foreground text-background hover:bg-foreground/90 h-11 px-6"
            >
              Başla <ArrowRight className="h-4 w-4 ml-1.5" />
            </Button>
            <Button size="lg" variant="outline" className="bg-transparent border-border h-11 px-6">
              <Play className="h-4 w-4 mr-1.5" />
              Demoyu İncele
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------ FOOTER ------------------------------ */

function Footer() {
  const cols = [
    { h: "Ürün", l: ["Öne Çıkanlar", "Fiyatlandırma", "Demo"] },
    { h: "Ücretsiz", l: ["Ücretsiz ASO Araçları", "Top Apps"] },
    { h: "Kaynaklar", l: ["Blog", "ASO Rehberleri", "ASO Sözlüğü"] },
    { h: "Şirket", l: ["Hakkımızda", "İletişim"] },
    { h: "Yasal", l: ["Gizlilik", "Kullanım Koşulları", "Çerezler"] },
  ];
  return (
    <footer className="border-t border-border bg-background">
      <div className="mx-auto max-w-7xl px-6 py-16">
        <div className="grid lg:grid-cols-[1.4fr_repeat(5,1fr)] gap-10">
          <div>
            <div className="flex items-center gap-2">
              <span className="h-7 w-7 rounded-lg bg-gradient-to-br from-cobalt to-violet grid place-items-center">
                <Sparkles className="h-3.5 w-3.5 text-primary-foreground" />
              </span>
              <span className="font-semibold tracking-tight">Sonar</span>
            </div>
            <p className="mt-4 text-sm text-muted-foreground max-w-xs leading-relaxed">
              ASO Intelligence, App Market Intelligence ve AI Growth Advisor tek çatı altında.
            </p>
            <div className="mt-6 inline-flex items-center gap-2 rounded-lg border border-border bg-surface/40 px-3 py-1.5 text-xs">
              <Globe2 className="h-3.5 w-3.5 text-muted-foreground" />
              <span>Türkçe</span>
              <ChevronDown className="h-3 w-3 text-muted-foreground" />
            </div>
          </div>
          {cols.map((c) => (
            <div key={c.h}>
              <div className="text-xs uppercase tracking-widest text-muted-foreground">{c.h}</div>
              <ul className="mt-4 space-y-2.5 text-sm">
                {c.l.map((i) => (
                  <li key={i}>
                    <a href="#" className="text-muted-foreground hover:text-foreground transition">
                      {i}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
      <div className="border-t border-border">
        <div className="mx-auto max-w-7xl px-6 py-6 flex flex-wrap justify-between gap-4 text-xs text-muted-foreground">
          <span>© 2026 Sonar Intelligence.</span>
          <span>Uygulama büyümesi için ciddi araçlar.</span>
        </div>
      </div>
    </footer>
  );
}

/* Fix Button variants: outline hover needs foreground preservation */
