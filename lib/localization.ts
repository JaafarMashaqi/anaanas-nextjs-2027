export const SUPPORTED_LOCALES = ["ar", "en"] as const;
export type SupportedLocale = (typeof SUPPORTED_LOCALES)[number];
export const DEFAULT_LOCALE: SupportedLocale = "ar";

/** Not routed. The sixth locale stays unset until the founder names it. */
export const PLANNED_LOCALES = ["tr", "fr", "es"] as const;
export type PlannedLocale = (typeof PLANNED_LOCALES)[number];
export type AppLocale = SupportedLocale | PlannedLocale;

export const LOCALE_DIRECTION: Record<AppLocale, "rtl" | "ltr"> = {
  ar: "rtl",
  en: "ltr",
  tr: "ltr",
  fr: "ltr",
  es: "ltr",
};

/** routing, dictionary, and metadata must all be true before a locale joins SUPPORTED_LOCALES. */
export const LOCALE_COVERAGE: Record<
  AppLocale,
  { routing: boolean; dictionary: boolean; metadata: boolean }
> = {
  ar: { routing: true, dictionary: true, metadata: true },
  en: { routing: true, dictionary: true, metadata: true },
  tr: { routing: false, dictionary: false, metadata: false },
  fr: { routing: false, dictionary: false, metadata: false },
  es: { routing: false, dictionary: false, metadata: false },
};

export const isSupportedLocale = (
  locale: string | null | undefined
): locale is SupportedLocale =>
  Boolean(
    locale &&
      SUPPORTED_LOCALES.includes(locale as SupportedLocale)
  );

export const SUPPORTED_COUNTRIES = ["jo", "eg", "sa", "ae" ,"demo"] as const;
export type SupportedCountry = (typeof SUPPORTED_COUNTRIES)[number];

