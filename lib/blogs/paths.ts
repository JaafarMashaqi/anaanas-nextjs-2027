import type { SupportedLocale } from '@/lib/localization'

/** Paths that must not be rewritten to blog article routes on the blogs host. */
export const BLOGS_HOST_RESERVED_SEGMENTS = new Set([
  'select-country',
  'auth',
  'p',
  'sections',
  'contact',
  'settings',
  'profile',
  'my-posts',
  'post',
  'home',
  'search',
  'blogs',
  'cat',
  'category',
])

export function isBlogsHostFromHeader(value: string | null | undefined): boolean {
  return value === '1'
}

export function blogListPath(locale: SupportedLocale, isBlogsHost: boolean): string {
  return isBlogsHost ? `/${locale}` : `/${locale}/blogs`
}

export function blogCategoryPath(
  locale: SupportedLocale,
  categorySlug: string,
  isBlogsHost: boolean,
): string {
  return isBlogsHost
    ? `/${locale}/cat/${categorySlug}`
    : `/${locale}/blogs/cat/${categorySlug}`
}

export function blogPostPath(
  locale: SupportedLocale,
  slug: string,
  isBlogsHost: boolean,
): string {
  return isBlogsHost ? `/${locale}/${slug}` : `/${locale}/blogs/${slug}`
}

export function blogPaginationPath(
  locale: SupportedLocale,
  page: number,
  isBlogsHost: boolean,
  categorySlug?: string | null,
): string {
  const base = categorySlug
    ? blogCategoryPath(locale, categorySlug, isBlogsHost)
    : blogListPath(locale, isBlogsHost)
  if (page <= 1) return base
  return `${base}?page=${page}`
}

/** True when pathname is a blog category route (supports /cat/ and legacy /category/). */
export function isBlogCategoryPathname(pathname: string | null | undefined): boolean {
  if (!pathname) return false
  return /\/(blogs\/)?(cat|category)\/[^/]+/.test(pathname)
}

export function activeCategorySlugFromPathname(
  pathname: string | null | undefined,
): string | null {
  if (!pathname) return null
  const match = pathname.match(/\/(?:blogs\/)?(?:cat|category)\/([^/?#]+)/)
  return match?.[1] ?? null
}
