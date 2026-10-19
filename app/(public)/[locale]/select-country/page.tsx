import type { Metadata } from "next";
import Link from "next/link";
import { headers } from "next/headers";
import { getBaseDomainForCountryLinks, parseHost } from "@/lib/domain";
import {
  DEFAULT_LOCALE,
  isSupportedLocale,
  type SupportedLocale,
} from "@/lib/localization";
import { fetchCountries, type Country } from "@/lib/api/countries";
import { getSiteOrigin } from "@/lib/seo/origin";
import { t } from "@/lib/translations";
import { resolveCountryFlagUrl } from "@/lib/flags/resolveCountryFlagUrl";
import styles from "./select-country.module.css";
import { SelectCountryLink } from "./SelectCountryLink";
import {
  isPreviewCountryMode,
  previewCountrySwitchPath,
} from "@/lib/preview/countryMode";

function buildCountryHost(
  isoCode: string,
  baseDomain: string,
  port?: string,
): string {
  const host = `${isoCode.toLowerCase()}.${baseDomain}`;
  return port ? `${host}:${port}` : host;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const resolved = await params;
  const loc: SupportedLocale = isSupportedLocale(resolved.locale)
    ? resolved.locale
    : DEFAULT_LOCALE;

  const headersList = await headers();
  const origin = getSiteOrigin(headersList);
  const path = `/${loc}/select-country`;
  const canonical = `${origin}${path}`;

  const title = t("selectCountry.metaTitle", loc);
  const description = t("selectCountry.metaDescription", loc);

  const arUrl = `${origin}/ar/select-country`;
  const enUrl = `${origin}/en/select-country`;

  return {
    title,
    description,
    keywords: [
      "ANANAS",
      "أناناس",
      "اختر الدولة",
      "choose country",
      "classifieds",
      "إعلانات",
      "الأردن",
      "مصر",
      "السعودية",
      "الإمارات",
      "Jordan",
      "Egypt",
      "Saudi Arabia",
      "UAE",
    ],
    robots: {
      index: true,
      follow: true,
      googleBot: { index: true, follow: true },
    },
    alternates: {
      canonical,
      languages: {
        ar: arUrl,
        en: enUrl,
        "x-default": arUrl,
      },
    },
    openGraph: {
      type: "website",
      locale: loc === "ar" ? "ar_AR" : "en_US",
      alternateLocale: loc === "ar" ? ["en_US"] : ["ar_AR"],
      url: canonical,
      title,
      description,
      siteName: "ANANAS",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

function buildJsonLd(opts: {
  locale: SupportedLocale;
  origin: string;
  canonicalPath: string;
  countries: Country[];
  linkBaseDomain: string;
  proto: string;
  port?: string;
  preview: boolean;
}) {
  const {
    locale,
    origin,
    canonicalPath,
    countries,
    linkBaseDomain,
    proto,
    port,
    preview,
  } = opts;

  const pageUrl = `${origin}${canonicalPath}`;
  const available = countries.filter((c) => c.iso2 || c.iso_code);

  const itemListElements = available.map((country, index) => {
    const iso = (country.iso2 || country.iso_code || "").toLowerCase();
    const host = buildCountryHost(iso, linkBaseDomain, port);
    const url = preview
      ? `${origin}${previewCountrySwitchPath(locale, iso)}`
      : `${proto}://${host}/${locale}`;
    return {
      "@type": "ListItem",
      position: index + 1,
      name: country.name,
      item: url,
    };
  });

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": `${origin}/#website`,
        name: "ANANAS",
        url: origin,
        inLanguage: [ "ar", "en" ],
      },
      {
        "@type": "WebPage",
        "@id": `${pageUrl}#webpage`,
        url: pageUrl,
        name: t("selectCountry.h1", locale),
        description: t("selectCountry.metaDescription", locale),
        inLanguage: locale,
        isPartOf: { "@id": `${origin}/#website` },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: t("selectCountry.breadcrumbHome", locale),
            item: `${origin}/${locale}`,
          },
          {
            "@type": "ListItem",
            position: 2,
            name: t("selectCountry.breadcrumbCurrent", locale),
            item: pageUrl,
          },
        ],
      },
      {
        "@type": "ItemList",
        name: t("selectCountry.listTitle", locale),
        numberOfItems: itemListElements.length,
        itemListElement: itemListElements,
      },
    ],
  };
}

export default async function SelectCountryPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const resolvedParams = await params;
  const initialLocale: SupportedLocale = isSupportedLocale(resolvedParams.locale)
    ? resolvedParams.locale
    : DEFAULT_LOCALE;

  let countries: Country[] = [];
  try {
    countries = await fetchCountries({ revalidateSeconds: 600 });
  } catch (error) {
    console.error("select-country: fetchCountries", error);
  }

  const availableCountries = countries.filter(
    (country) => country.iso2 || country.iso_code,
  );

  const headersList = await headers();
  const hostInfo = parseHost(headersList.get("host"));
  const linkBaseDomain = getBaseDomainForCountryLinks(hostInfo);
  const proto =
    headersList.get("x-forwarded-proto")?.split(",")[0]?.trim() || "https";
  const origin = getSiteOrigin(headersList);
  const preview = isPreviewCountryMode();
  const canonicalPath = `/${initialLocale}/select-country`;

  const jsonLd = buildJsonLd({
    locale: initialLocale,
    origin,
    canonicalPath,
    countries: availableCountries,
    linkBaseDomain,
    proto,
    port: hostInfo.port,
    preview,
  });

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd),
        }}
      />
      <div className={styles.page}>
        <div className={styles.inner}>
          <a href="#country-list" className={styles.skipLink}>
            {t("selectCountry.skipToList", initialLocale)}
          </a>

          <header className={styles.topBar}>
            <span className={styles.brandMark}>ANANAS</span>
            <nav
              className={styles.langSwitch}
              aria-label={t("selectCountry.langSwitchAria", initialLocale)}
            >
              <Link
                href="/ar/select-country"
                className={`${styles.langLink} ${initialLocale === "ar" ? styles.langLinkActive : ""}`}
                hrefLang="ar"
                lang="ar"
              >
                {t("selectCountry.switchToAr", initialLocale)}
              </Link>
              <Link
                href="/en/select-country"
                className={`${styles.langLink} ${initialLocale === "en" ? styles.langLinkActive : ""}`}
                hrefLang="en"
                lang="en"
              >
                {t("selectCountry.switchToEn", initialLocale)}
              </Link>
            </nav>
          </header>

          <main className={styles.main}>
            <div className={styles.heroPanel}>
              <article className={styles.hero}>
                <p className={styles.eyebrow}>ANANAS</p>
                <h1 className={styles.h1}>{t("selectCountry.h1", initialLocale)}</h1>
                <p className={styles.lead}>{t("selectCountry.lead", initialLocale)}</p>
                <p className={styles.intro}>{t("selectCountry.intro", initialLocale)}</p>
              </article>
            </div>

            <nav aria-label={t("selectCountry.breadcrumbCurrent", initialLocale)}>
              <ol className={styles.breadcrumb}>
                <li>
                  <Link href={`/${initialLocale}`}>{t("selectCountry.breadcrumbHome", initialLocale)}</Link>
                </li>
                <li className={styles.breadcrumbSep} aria-hidden>
                  /
                </li>
                <li aria-current="page">{t("selectCountry.breadcrumbCurrent", initialLocale)}</li>
              </ol>
            </nav>

            <section
              id="country-list"
              className={styles.section}
              aria-labelledby="countries-heading"
            >
              <h2 id="countries-heading" className={styles.sectionHead}>
                {t("selectCountry.listTitle", initialLocale)}
              </h2>
              {availableCountries.length > 0 ? (
                <>
                  <ul className={styles.countryGrid} role="list">
                    {availableCountries.map((country, index) => {
                      const isoCode = (
                        country.iso2 ||
                        country.iso_code ||
                        ""
                      ).toLowerCase();
                      const countryHost = buildCountryHost(
                        isoCode,
                        linkBaseDomain,
                        hostInfo.port,
                      );
                      const countryUrl = preview
                        ? previewCountrySwitchPath(initialLocale, isoCode)
                        : `${proto}://${countryHost}/${initialLocale}`;
                      const isoUpper = isoCode.toUpperCase();
                      const flagAlt =
                        initialLocale === "ar"
                          ? `علم ${country.name} — رمز الدولة ${isoUpper}`
                          : `Flag of ${country.name} — country code ${isoUpper}`;

                      const flagSrc = resolveCountryFlagUrl(
                        isoCode,
                        country.flag_full_path,
                      );

                      return (
                        <li key={String(country.id)}>
                          <SelectCountryLink
                            href={countryUrl}
                            iso2={isoCode}
                            className={styles.countryCard}
                            hrefLang={initialLocale}
                          >
                            <div className={styles.flagWrap}>
                              {flagSrc ? (
                                <img
                                  src={flagSrc}
                                  alt={flagAlt}
                                  width={128}
                                  height={128}
                                  className={styles.flagImg}
                                  loading={index < 8 ? "eager" : "lazy"}
                                  fetchPriority={index < 4 ? "high" : undefined}
                                  decoding="async"
                                />
                              ) : (
                                <div className={styles.flagFallback}>
                                  {initialLocale === "ar" ? "لا يوجد علم" : "No flag"}
                                </div>
                              )}
                              <span className={styles.isoBadge} title={`${t("selectCountry.isoLabel", initialLocale)}: ${isoUpper}`}>
                                {isoUpper}
                              </span>
                            </div>
                            <div className={styles.cardBody}>
                              <h3 className={styles.countryName}>{country.name}</h3>
                              <p className={styles.cardCta}>
                                {t("selectCountry.cardCta", initialLocale)}
                              </p>
                              <p className={styles.cardHint}>
                                {t("selectCountry.cardHint", initialLocale)}
                              </p>
                            </div>
                          </SelectCountryLink>
                        </li>
                      );
                    })}
                  </ul>
                  <p className={styles.countNote}>
                    {initialLocale === "ar"
                      ? `عدد الدول المعروضة: ${availableCountries.length}. اختر بلدك للانتقال إلى النسخة المحلية من أناناس.`
                      : `${availableCountries.length} countries available. Pick yours to open the local ANANAS site.`}
                  </p>
                </>
              ) : (
                <p className={styles.emptyState} role="status">
                  {t("selectCountry.empty", initialLocale)}
                </p>
              )}
            </section>
          </main>
        </div>
      </div>
    </>
  );
}
