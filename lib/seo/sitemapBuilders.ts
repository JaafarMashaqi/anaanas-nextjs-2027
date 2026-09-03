import { headers } from 'next/headers'

import { getBaseDomainFromEnv, parseHost } from '@/lib/domain'
import { DEFAULT_LOCALE, SUPPORTED_LOCALES } from '@/lib/localization'
import { fetchBlogCategories, fetchBlogs } from '@/lib/api/blogs'
import { blogCategoryPath, blogListPath, blogPostPath } from '@/lib/blogs/paths'
import { resolveCountryIdFromHeaders } from '@/lib/server/resolveCountryIdFromHeaders'
import {
  fetchSitemapCities,
  fetchSitemapCountries,
  fetchSitemapPostsMeta,
  fetchSitemapPostsPage,
  fetchSitemapSections,
} from '@/lib/server/fetchSitemapData'
import { resolveSeoOrigin } from '@/lib/seo/resolveSeoOrigin'
import { buildSitemapIndexXml, buildUrlSetXml, toSitemapLastmod, type SitemapUrlEntry } from '@/lib/seo/sitemapXml'

export const SITEMAP_REVALIDATE = 86_400

export function xmlResponse(body: string): Response {
  return new Response(body, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': `public, max-age=${SITEMAP_REVALIDATE}, stale-while-revalidate=604800`,
    },
  })
}

export async function resolveCountryIso2FromRequest(): Promise<string | null> {
  const headersList = await headers()

  const fromHeader = headersList.get('x-country')?.trim().toLowerCase()
  if (fromHeader) return fromHeader

  const host = headersList.get('x-forwarded-host') || headersList.get('host')
  const hostInfo = parseHost(host)

  if (hostInfo.hasCountrySubdomain && hostInfo.countrySubdomain) {
    return hostInfo.countrySubdomain.toLowerCase()
  }

  const countryId = await resolveCountryIdFromHeaders()
  if (!countryId) return null

  const countries = await fetchSitemapCountries()
  const match = countries.find((c) => c.id === countryId)
  return match?.iso2?.toLowerCase() ?? null
}

export function buildTenantOrigin(origin: string, countryIso2: string | null): string {
  if (!countryIso2) return origin

  const baseDomain = getBaseDomainFromEnv()
  if (!baseDomain) return origin

  try {
    const url = new URL(origin)
    const tenantHost = `${countryIso2.toLowerCase()}.${baseDomain}`
    if (url.host === tenantHost) return origin
    return `${url.protocol}//${tenantHost}`
  } catch {
    return origin
  }
}

export async function buildStaticSitemapUrls(origin: string): Promise<SitemapUrlEntry[]> {
  const now = new Date().toISOString().slice(0, 10)
  const urls: SitemapUrlEntry[] = []

  for (const locale of SUPPORTED_LOCALES) {
    urls.push({ loc: `${origin}/${locale}`, lastmod: now })
    urls.push({ loc: `${origin}/${locale}/select-country`, lastmod: now })
    urls.push({ loc: `${origin}/${locale}/contact`, lastmod: now })
    urls.push({ loc: `${origin}/${locale}/blogs`, lastmod: now })
  }

  return urls
}

export async function buildBlogsSitemapUrls(origin: string): Promise<SitemapUrlEntry[]> {
  const urls: SitemapUrlEntry[] = []

  for (const locale of SUPPORTED_LOCALES) {
    urls.push({ loc: `${origin}${blogListPath(locale, false)}` })

    try {
      const categories = await fetchBlogCategories(locale, { revalidateSeconds: 86_400 })
      for (const category of categories) {
        urls.push({
          loc: `${origin}${blogCategoryPath(locale, category.slug, false)}`,
        })
      }

      let page = 1
      let lastPage = 1
      do {
        const result = await fetchBlogs(locale, { page, revalidateSeconds: 86_400 })
        for (const post of result.data) {
          urls.push({
            loc: `${origin}${blogPostPath(locale, post.slug, false)}`,
            lastmod: toSitemapLastmod(post.published_at),
          })
        }
        lastPage = result.meta?.last_page ?? 1
        page += 1
      } while (page <= lastPage)
    } catch {
      // API unavailable during sitemap build — keep index URLs only
    }
  }

  return urls
}

export async function buildSectionsSitemapUrls(origin: string, countryIso2: string): Promise<SitemapUrlEntry[]> {
  const rows = await fetchSitemapSections(countryIso2)
  const urls: SitemapUrlEntry[] = []

  for (const locale of SUPPORTED_LOCALES) {
    for (const row of rows) {
      const lastmod = toSitemapLastmod(row.updated_at)
      if (row.category_slug) {
        urls.push({
          loc: `${origin}/${locale}/sections/${row.section_slug}/${row.category_slug}`,
          lastmod,
        })
      } else {
        urls.push({
          loc: `${origin}/${locale}/sections/${row.section_slug}`,
          lastmod,
        })
      }
    }
  }

  return urls
}

export async function buildCitiesSitemapUrls(
  origin: string,
  countryIso2: string,
): Promise<SitemapUrlEntry[]> {
  const [cities, sections] = await Promise.all([
    fetchSitemapCities(countryIso2),
    fetchSitemapSections(countryIso2),
  ])

  const primarySection = sections.find((row) => !row.category_slug)?.section_slug
  if (!primarySection) return []

  const urls: SitemapUrlEntry[] = []
  for (const locale of SUPPORTED_LOCALES) {
    for (const city of cities) {
      urls.push({
        loc: `${origin}/${locale}/sections/${primarySection}?city_id=${city.city_id}`,
        lastmod: toSitemapLastmod(city.updated_at),
      })
    }
  }

  return urls
}

export async function buildPostsSitemapUrlsForPage(
  origin: string,
  countryIso2: string,
  page: number,
): Promise<SitemapUrlEntry[]> {
  const posts = await fetchSitemapPostsPage(countryIso2, page)
  const urls: SitemapUrlEntry[] = []

  for (const locale of SUPPORTED_LOCALES) {
    for (const post of posts) {
      urls.push({
        loc: `${origin}/${locale}/post/${post.id}`,
        lastmod: toSitemapLastmod(post.updated_at || post.publish_date),
      })
    }
  }

  return urls
}

/** @deprecated Use buildPostsSitemapUrlsForPage per page. */
export async function buildPostsSitemapUrls(origin: string, countryIso2: string): Promise<SitemapUrlEntry[]> {
  const meta = await fetchSitemapPostsMeta(countryIso2)
  const lastPage = meta?.last_page ?? 1
  const all: SitemapUrlEntry[] = []

  for (let page = 1; page <= lastPage; page += 1) {
    const chunk = await buildPostsSitemapUrlsForPage(origin, countryIso2, page)
    all.push(...chunk)
  }

  return all
}

export async function buildTenantSitemapIndex(origin: string, countryIso2: string): Promise<string> {
  const entries: SitemapUrlEntry[] = [
    { loc: `${origin}/sitemap-static.xml` },
    { loc: `${origin}/sitemap-blogs.xml` },
    { loc: `${origin}/sitemap-sections.xml` },
    { loc: `${origin}/sitemap-cities.xml` },
  ]

  if (!countryIso2) {
    return buildSitemapIndexXml(entries)
  }

  const meta = await fetchSitemapPostsMeta(countryIso2)
  const lastPage = Math.max(1, meta?.last_page ?? 1)

  for (let page = 1; page <= lastPage; page += 1) {
    entries.push({ loc: `${origin}/sitemap-posts-${page}.xml` })
  }

  return buildSitemapIndexXml(entries)
}

function resolveSitemapBaseDomain(origin: string): string | null {
  const fromEnv = getBaseDomainFromEnv()
  if (fromEnv) return fromEnv

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim()
  if (siteUrl) {
    try {
      const host = new URL(siteUrl).hostname.toLowerCase().replace(/^www\./, '')
      return host || null
    } catch {
      // fall through
    }
  }

  try {
    const host = new URL(origin).hostname.toLowerCase().replace(/^www\./, '')
    const labels = host.split('.').filter(Boolean)
    if (labels.length >= 2) {
      return labels.slice(-2).join('.')
    }
  } catch {
    return null
  }

  return null
}

export async function buildCountriesSitemapIndex(origin: string): Promise<string> {
  const countries = await fetchSitemapCountries()
  const baseDomain = resolveSitemapBaseDomain(origin)
  const entries: SitemapUrlEntry[] = []

  let proto = 'https'
  try {
    proto = new URL(origin).protocol
  } catch {
    proto = 'https:'
  }

  for (const country of countries) {
    const iso2 = country.iso2?.toLowerCase()
    if (!iso2) continue

    const tenantOrigin = baseDomain ? `${proto}//${iso2}.${baseDomain}` : origin

    entries.push({
      loc: `${tenantOrigin}/sitemap.xml`,
      lastmod: toSitemapLastmod(country.updated_at),
    })
  }

  return buildSitemapIndexXml(entries)
}

export { buildUrlSetXml, DEFAULT_LOCALE }
