/**
 * CENTRAL LOCALE + I18N FOUNDATION (Phase 13)
 *
 * - Supported locales: tr (default), en, es, ar.
 * - Locale drives: <html lang>, <html dir>, interface font family
 *   (Inter for tr/en/es, Noto Sans Arabic for ar), number/date formatting and
 *   collation.
 * - All new visible strings must be added to the dictionaries here and read
 *   through `useT()` — never hardcoded in route files.
 */
import * as React from "react";

export const LOCALES = ["tr", "en", "es", "ar"] as const;
export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "tr";

export const LOCALE_DIR: Record<Locale, "ltr" | "rtl"> = {
  tr: "ltr",
  en: "ltr",
  es: "ltr",
  ar: "rtl",
};

export const LOCALE_LABEL: Record<Locale, string> = {
  tr: "Türkçe",
  en: "English",
  es: "Español",
  ar: "العربية",
};

/** Intl locale tags used for number/date formatting and collation. */
export const INTL_TAG: Record<Locale, string> = {
  tr: "tr-TR",
  en: "en-US",
  es: "es-ES",
  ar: "ar",
};

/* ---------------- Dictionaries ---------------- */
/** Shared UI keys. Feature keys are added here as pages are localized. */
export const MESSAGES = {
  tr: {
    "common.retry": "Tekrar Dene",
    "common.error": "Bir sorun oluştu",
    "common.empty": "Sonuç bulunamadı",
    "common.emptyFiltered": "Filtrelerle eşleşen kayıt yok",
    "common.loading": "Yükleniyor",
    "common.close": "Kapat",
    "common.search": "Ara",
    "common.compare": "Karşılaştır",
    "common.apply": "Uygula",
    "common.reset": "Sıfırla",
    "common.save": "Kaydet",
    "common.cancel": "Vazgeç",
    "theme.light": "Açık",
    "theme.dark": "Koyu",
    "theme.system": "Sistem",
    "table.rowsPerPage": "Sayfa başına satır",
    "table.selected": "seçili",
  },
  en: {
    "common.retry": "Retry",
    "common.error": "Something went wrong",
    "common.empty": "No results found",
    "common.emptyFiltered": "No records match your filters",
    "common.loading": "Loading",
    "common.close": "Close",
    "common.search": "Search",
    "common.compare": "Compare",
    "common.apply": "Apply",
    "common.reset": "Reset",
    "common.save": "Save",
    "common.cancel": "Cancel",
    "theme.light": "Light",
    "theme.dark": "Dark",
    "theme.system": "System",
    "table.rowsPerPage": "Rows per page",
    "table.selected": "selected",
  },
  es: {
    "common.retry": "Reintentar",
    "common.error": "Algo salió mal",
    "common.empty": "No se encontraron resultados",
    "common.emptyFiltered": "Ningún registro coincide con los filtros",
    "common.loading": "Cargando",
    "common.close": "Cerrar",
    "common.search": "Buscar",
    "common.compare": "Comparar",
    "common.apply": "Aplicar",
    "common.reset": "Restablecer",
    "common.save": "Guardar",
    "common.cancel": "Cancelar",
    "theme.light": "Claro",
    "theme.dark": "Oscuro",
    "theme.system": "Sistema",
    "table.rowsPerPage": "Filas por página",
    "table.selected": "seleccionados",
  },
  ar: {
    "common.retry": "إعادة المحاولة",
    "common.error": "حدث خطأ ما",
    "common.empty": "لا توجد نتائج",
    "common.emptyFiltered": "لا توجد سجلات مطابقة للفلاتر",
    "common.loading": "جارٍ التحميل",
    "common.close": "إغلاق",
    "common.search": "بحث",
    "common.compare": "مقارنة",
    "common.apply": "تطبيق",
    "common.reset": "إعادة تعيين",
    "common.save": "حفظ",
    "common.cancel": "إلغاء",
    "theme.light": "فاتح",
    "theme.dark": "داكن",
    "theme.system": "النظام",
    "table.rowsPerPage": "صفوف في الصفحة",
    "table.selected": "محدد",
  },
} as const satisfies Record<Locale, Record<string, string>>;

export type MessageKey = keyof (typeof MESSAGES)["tr"];

/* ---------------- Context ---------------- */
interface LocaleContextValue {
  locale: Locale;
  dir: "ltr" | "rtl";
  setLocale: (l: Locale) => void;
  t: (key: MessageKey) => string;
  formatNumber: (value: number, options?: Intl.NumberFormatOptions) => string;
  formatDate: (value: Date | string | number, options?: Intl.DateTimeFormatOptions) => string;
  compare: (a: string, b: string) => number;
}

const LocaleContext = React.createContext<LocaleContextValue | null>(null);

const STORAGE_KEY = "sonar.locale";

export function LocaleProvider({
  children,
  initialLocale = DEFAULT_LOCALE,
}: {
  children: React.ReactNode;
  initialLocale?: Locale;
}) {
  const [locale, setLocaleState] = React.useState<Locale>(initialLocale);

  // Read persisted locale after hydration only (deterministic SSR output).
  React.useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY) as Locale | null;
      if (stored && LOCALES.includes(stored)) setLocaleState(stored);
    } catch {
      /* storage unavailable */
    }
  }, []);

  React.useEffect(() => {
    const root = document.documentElement;
    root.lang = locale;
    root.dir = LOCALE_DIR[locale];
  }, [locale]);

  const setLocale = React.useCallback((next: Locale) => {
    setLocaleState(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      /* storage unavailable */
    }
  }, []);

  const value = React.useMemo<LocaleContextValue>(() => {
    const tag = INTL_TAG[locale];
    const collator = new Intl.Collator(tag, { numeric: true, sensitivity: "base" });
    return {
      locale,
      dir: LOCALE_DIR[locale],
      setLocale,
      t: (key) => MESSAGES[locale][key] ?? MESSAGES[DEFAULT_LOCALE][key] ?? String(key),
      formatNumber: (v, options) => new Intl.NumberFormat(tag, options).format(v),
      formatDate: (v, options) =>
        new Intl.DateTimeFormat(tag, options ?? { dateStyle: "medium" }).format(new Date(v)),
      compare: (a, b) => collator.compare(a, b),
    };
  }, [locale, setLocale]);

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

/** Locale access. Falls back to the default locale outside a provider. */
export function useLocale(): LocaleContextValue {
  const ctx = React.useContext(LocaleContext);
  if (ctx) return ctx;
  const tag = INTL_TAG[DEFAULT_LOCALE];
  const collator = new Intl.Collator(tag, { numeric: true, sensitivity: "base" });
  return {
    locale: DEFAULT_LOCALE,
    dir: LOCALE_DIR[DEFAULT_LOCALE],
    setLocale: () => {},
    t: (key) => MESSAGES[DEFAULT_LOCALE][key] ?? String(key),
    formatNumber: (v, options) => new Intl.NumberFormat(tag, options).format(v),
    formatDate: (v, options) =>
      new Intl.DateTimeFormat(tag, options ?? { dateStyle: "medium" }).format(new Date(v)),
    compare: (a, b) => collator.compare(a, b),
  };
}

export function useT() {
  return useLocale().t;
}
