export const SUPPORTED_LOCALES = ["ar", "en"] as const;
export type SupportedLocale = (typeof SUPPORTED_LOCALES)[number];
export const DEFAULT_LOCALE: SupportedLocale = "ar";

/** Not routed. A locale joins SUPPORTED_LOCALES only when routing, dictionary, and metadata exist. */
export const PLANNED_LOCALES = ["tr", "es", "zh", "fr"] as const;
export type PlannedLocale = (typeof PLANNED_LOCALES)[number];
export type AppLocale = SupportedLocale | PlannedLocale;

export const LANGUAGE_MENU: { code: AppLocale; native: string; ready: boolean }[] = [
  { code: "ar", native: "العربية", ready: true },
  { code: "en", native: "English", ready: true },
  { code: "tr", native: "Türkçe", ready: false },
  { code: "es", native: "Español", ready: false },
  { code: "zh", native: "中文", ready: false },
  { code: "fr", native: "Français", ready: false },
];

export const LOCALE_DIRECTION: Record<AppLocale, "rtl" | "ltr"> = {
  ar: "rtl",
  en: "ltr",
  tr: "ltr",
  es: "ltr",
  zh: "ltr",
  fr: "ltr",
};

/** routing, dictionary, and metadata must all be true before a locale joins SUPPORTED_LOCALES. */
export const LOCALE_COVERAGE: Record<
  AppLocale,
  { routing: boolean; dictionary: boolean; metadata: boolean }
> = {
  ar: { routing: true, dictionary: true, metadata: true },
  en: { routing: true, dictionary: true, metadata: true },
  tr: { routing: false, dictionary: false, metadata: false },
  es: { routing: false, dictionary: false, metadata: false },
  zh: { routing: false, dictionary: false, metadata: false },
  fr: { routing: false, dictionary: false, metadata: false },
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

