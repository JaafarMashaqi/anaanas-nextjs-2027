import { NextRequest, NextResponse } from "next/server";
import {
  parseHost,
  getBaseDomainFromEnv,
  buildCountryHost,
  getBaseDomainForCountryLinks,
} from "./lib/domain";
import { DEFAULT_LOCALE, SUPPORTED_LOCALES } from "./lib/localization";
import { detectVisitorCountryIso2 } from "./lib/geo/detectVisitorCountry";
import { fetchSupportedCountryIso2Set } from "./lib/geo/supportedIsoCodes";
import { shouldSkipCountryGeoRouting } from "./lib/geo/shouldSkipGeoRouting";
import {
  PREFERRED_COUNTRY_COOKIE,
  PREFERRED_COUNTRY_MAX_AGE,
  normalizePreferredCountryIso2,
  readPreferredCountryIsoFromRequest,
} from "./lib/geo/preferredCountryCookie";
import { BLOGS_HOST_RESERVED_SEGMENTS } from "./lib/blogs/paths";

const PUBLIC_FILE = /\.(.*)$/;

function requestProto(req: NextRequest): string {
  const p = req.headers.get("x-forwarded-proto");
  if (p) return p.split(",")[0]?.trim() || "https";
  return "https";
}

function tenantRedirect(
  req: NextRequest,
  iso: string,
  pathname: string,
  search: string,
) {
  const hostCtx = parseHost(req.headers.get("host"));
  const base = getBaseDomainForCountryLinks(hostCtx);
  const proto = requestProto(req);
  const host = buildCountryHost(iso, base, hostCtx.port);
  const next = new URL(`${proto}://${host}${pathname}${search}`);
  return NextResponse.redirect(next);
}

/** Mismatch tenant vs geo: send to apex picker (avoids wrong-country subdomain). */
function apexSelectCountryRedirect(req: NextRequest, locale: string) {
  const hostCtx = parseHost(req.headers.get("host"));
  const base = getBaseDomainFromEnv() ?? hostCtx.baseDomain;
  const proto = requestProto(req);
  const host = hostCtx.port ? `${base}:${hostCtx.port}` : base;
  const next = new URL(`${proto}://${host}/${locale}/select-country`);
  return NextResponse.redirect(next);
}

function applyPreferredCountryCookie(
  res: NextResponse,
  req: NextRequest,
  iso: string,
) {
  const code = normalizePreferredCountryIso2(iso);
  if (!code) return res;

  const baseRaw = getBaseDomainFromEnv() ?? "";
  const base = baseRaw.split(":")[0]?.toLowerCase() ?? "";
  const secure = requestProto(req) === "https";

  res.cookies.set({
    name: PREFERRED_COUNTRY_COOKIE,
    value: code,
    path: "/",
    maxAge: PREFERRED_COUNTRY_MAX_AGE,
    sameSite: "lax",
    secure,
    ...(base && !base.includes("localhost") ? { domain: base } : {}),
  });
  return res;
}

/**
 * On blogs.{base}: public URLs omit `/blogs` — rewrite internally or redirect canonical.
 */
function resolveBlogsHostRedirect(
  req: NextRequest,
  locale: string,
): NextResponse | null {
  const segments = req.nextUrl.pathname.split("/").filter(Boolean);

  if (segments[1] === "blogs") {
    const rest = segments.slice(2);
    if (rest[0] === "category" && rest.length >= 2) {
      const url = req.nextUrl.clone();
      url.pathname = `/${locale}/cat/${rest.slice(1).join("/")}`;
      return NextResponse.redirect(url);
    }
    const url = req.nextUrl.clone();
    url.pathname =
      rest.length > 0 ? `/${locale}/${rest.join("/")}` : `/${locale}`;
    return NextResponse.redirect(url);
  }

  if (segments[1] === "category" && segments.length >= 3) {
    const url = req.nextUrl.clone();
    url.pathname = `/${locale}/cat/${segments.slice(2).join("/")}`;
    return NextResponse.redirect(url);
  }

  return null;
}

function resolveBlogsHostRewritePath(
  req: NextRequest,
  locale: string,
): string | null {
  const segments = req.nextUrl.pathname.split("/").filter(Boolean);

  if (segments.length === 1) {
    return `/${locale}/blogs`;
  }

  const second = segments[1]?.toLowerCase() ?? "";

  if (second === "cat" && segments.length >= 3) {
    return `/${locale}/blogs/cat/${segments.slice(2).join("/")}`;
  }

  if (second === "category" && segments.length >= 3) {
    return `/${locale}/blogs/cat/${segments.slice(2).join("/")}`;
  }

  if (second && !BLOGS_HOST_RESERVED_SEGMENTS.has(second)) {
    return `/${locale}/blogs/${segments.slice(1).join("/")}`;
  }

  return null;
}

export async function middleware(req: NextRequest) {
  const { nextUrl } = req;
  const { pathname, search } = nextUrl;

  if (
    PUBLIC_FILE.test(pathname) ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/assets") ||
    pathname.startsWith("/favicon") ||
    pathname.startsWith("/robots") ||
    pathname.startsWith("/sitemap")
  ) {
    const hostCtx = parseHost(req.headers.get("host"));
    if (hostCtx.hasCountrySubdomain && hostCtx.countrySubdomain) {
      const res = NextResponse.next();
      res.headers.set("x-country", hostCtx.countrySubdomain);
      return res;
    }
    return NextResponse.next();
  }

  const { hasCountrySubdomain, countrySubdomain, isBlogsSubdomain } = parseHost(
    req.headers.get("host"),
  );

  const segments = pathname.split("/");
  const maybeLocale = segments[1];
  const localeIsPresent = SUPPORTED_LOCALES.includes(
    maybeLocale as (typeof SUPPORTED_LOCALES)[number],
  );

  if (!localeIsPresent) {
    const url = nextUrl.clone();
    url.pathname = `/${DEFAULT_LOCALE}${
      pathname === "/" ? "" : pathname
    }`;
    return NextResponse.redirect(url);
  }

  const locale = maybeLocale as (typeof SUPPORTED_LOCALES)[number];

  if (segments[1] === "blogs" && segments[2] === "category" && segments.length >= 4) {
    const url = nextUrl.clone();
    url.pathname = `/${locale}/blogs/cat/${segments.slice(3).join("/")}`;
    return NextResponse.redirect(url);
  }

  const isSelectCountry = segments[2] === "select-country";
  const skipGeo = shouldSkipCountryGeoRouting(req) || isBlogsSubdomain === true;
  const preferredIso = readPreferredCountryIsoFromRequest(req);

  if (isBlogsSubdomain) {
    const blogsRedirect = resolveBlogsHostRedirect(req, locale);
    if (blogsRedirect) {
      return blogsRedirect;
    }
  }

  let supported = new Set<string>();
  let detected: string | null = null;

  if (!skipGeo) {
    const [{ code }, s] = await Promise.all([
      detectVisitorCountryIso2(req),
      fetchSupportedCountryIso2Set(),
    ]);
    supported = s;
    detected = code;
  }

  const subNorm = countrySubdomain?.toLowerCase() ?? "";

  // Tenant host lists a plausible ISO label, but API has no such country → picker on apex.
  if (
    !skipGeo &&
    hasCountrySubdomain &&
    subNorm &&
    supported.size > 0 &&
    !supported.has(subNorm)
  ) {
    return apexSelectCountryRedirect(req, locale);
  }

  // Mismatch geo vs subdomain: allow browsing if user explicitly chose this tenant (cookie).
  if (!skipGeo && hasCountrySubdomain && subNorm) {
    if (
      detected &&
      supported.size > 0 &&
      supported.has(detected) &&
      supported.has(subNorm) &&
      detected !== subNorm
    ) {
      if (preferredIso !== subNorm) {
        return apexSelectCountryRedirect(req, locale);
      }
    }
  }

  if (!hasCountrySubdomain && !isBlogsSubdomain) {
    if (!skipGeo) {
      if (detected && supported.has(detected)) {
        if (!isSelectCountry) {
          return tenantRedirect(req, detected, pathname, search);
        }
        return tenantRedirect(req, detected, `/${locale}`, search);
      }
      if (preferredIso && supported.has(preferredIso)) {
        if (!isSelectCountry) {
          return tenantRedirect(req, preferredIso, pathname, search);
        }
        return tenantRedirect(req, preferredIso, `/${locale}`, search);
      }
    }

    if (!isSelectCountry) {
      const url = nextUrl.clone();
      url.pathname = `/${locale}/select-country`;
      return NextResponse.redirect(url);
    }
  }

  const requestHeaders = new Headers(req.headers);
  requestHeaders.set("x-locale", locale);

  if (isBlogsSubdomain) {
    requestHeaders.delete("x-country");
    requestHeaders.set("x-blogs-host", "1");
  } else if (countrySubdomain) {
    requestHeaders.set("x-country", countrySubdomain);
  } else {
    requestHeaders.delete("x-country");
  }

  const blogsRewritePath =
    isBlogsSubdomain === true
      ? resolveBlogsHostRewritePath(req, locale)
      : null;

  let res: NextResponse;
  if (blogsRewritePath != null) {
    const url = req.nextUrl.clone();
    url.pathname = blogsRewritePath;
    res = NextResponse.rewrite(url, {
      request: { headers: requestHeaders },
    });
  } else {
    res = NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  }

  // Align preference with the active tenant (apex can read it if geo detection fails later).
  const syncSubCookie =
    Boolean(subNorm) &&
    normalizePreferredCountryIso2(subNorm) === subNorm &&
    (supported.size === 0 || supported.has(subNorm));
  if (syncSubCookie) {
    res = applyPreferredCountryCookie(res, req, subNorm);
  }

  return res;
}

export const config = {
  matcher: ["/((?!_next|api|favicon.ico|.*\\..*).*)"],
};
