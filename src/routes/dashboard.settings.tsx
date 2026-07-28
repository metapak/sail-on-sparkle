import { createFileRoute } from "@tanstack/react-router";
import { Sun, Moon, Monitor } from "lucide-react";
import { Panel, SettingsPage } from "@/components/shared";
import { cn } from "@/lib/utils";
import { useTheme, type ThemeChoice } from "@/lib/theme";

export const Route = createFileRoute("/dashboard/settings")({
  head: () => ({
    meta: [
      { title: "Ayarlar — Sonar Dashboard" },
      {
        name: "description",
        content: "Çalışma alanı ayarlarını, tercihlerinizi ve entegrasyonları yönetin.",
      },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: SettingsRoute,
});

const OPTIONS: {
  value: ThemeChoice;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}[] = [
  { value: "light", label: "Açık", icon: Sun },
  { value: "dark", label: "Koyu", icon: Moon },
  { value: "system", label: "Sistem", icon: Monitor },
];

function SettingsRoute() {
  const { theme, setTheme } = useTheme();

  return (
    <SettingsPage className="space-y-6">
      <div>
        <div className="eyebrow mb-1">AYARLAR</div>
        <h1 className="font-editorial text-2xl font-semibold tracking-tight sm:text-3xl">
          Ayarlar
        </h1>
        <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
          Çalışma alanı ayarlarını, tercihlerinizi ve entegrasyonları yönetin.
        </p>
      </div>

      <Panel className="p-5 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="max-w-lg">
            <h2 className="text-sm font-semibold">Görünüm</h2>
            <p className="mt-1 text-xs text-muted-foreground">
              Sonar panelinin görünümünü cihazınıza veya kişisel tercihinize göre ayarlayın.
            </p>
          </div>
          <div
            role="radiogroup"
            aria-label="Görünüm tercihi"
            className="inline-flex shrink-0 items-center gap-1 rounded-lg border border-hairline bg-surface/50 p-1"
          >
            {OPTIONS.map((o) => {
              const active = theme === o.value;
              return (
                <button
                  key={o.value}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  onClick={() => setTheme(o.value)}
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition",
                    active
                      ? "bg-primary/15 text-foreground ring-1 ring-[color:var(--cobalt)]/30"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  <o.icon className="h-3.5 w-3.5" />
                  {o.label}
                </button>
              );
            })}
          </div>
        </div>
      </Panel>

      <Panel className="p-5 sm:p-6">
        <h2 className="text-sm font-semibold">Diğer ayarlar</h2>
        <p className="mt-1 text-xs text-muted-foreground">
          Uygulama ve mağaza bağlantıları, bildirim tercihleri, ekip ve rol yönetimi yakında bu
          alana eklenecek.
        </p>
      </Panel>
    </SettingsPage>
  );
}
