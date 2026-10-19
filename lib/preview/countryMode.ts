import { normalizePreferredCountryIso2 } from "@/lib/geo/preferredCountryCookie";

/**
 * Explicit preview switch. Set both variables in the preview process only.
 * Hostname is never used to infer this mode, so production subdomain routing
 * stays active wherever the flag is absent.
 */
export function isPreviewCountryMode(): boolean {
  if (typeof window !== "undefined") {
    return document.documentElement.dataset.previewCountry === "1";
  }
  return (
    process.env.ANANAS_PREVIEW_COUNTRY_MODE === "1" ||
    process.env.NEXT_PUBLIC_ANANAS_PREVIEW_COUNTRY_MODE === "1"
  );
}

/** Initial country when the preview has no saved preference. */
export const PREVIEW_DEFAULT_COUNTRY = "jo";

/** Query read only while preview mode is on, then stripped by middleware. */
export const PREVIEW_COUNTRY_QUERY = "ananas_country";

export function previewCountrySwitchPath(locale: string, iso2: string): string {
  const code = normalizePreferredCountryIso2(iso2);
  if (!code) return `/${locale}`;
  return `/${locale}?${PREVIEW_COUNTRY_QUERY}=${code}`;
}
