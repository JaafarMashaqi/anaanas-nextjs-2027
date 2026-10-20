import { getApiUrl } from '@/lib/api/config'
import type { SupportedLocale } from '@/lib/localization'
import FeaturedPostsStripClient from './FeaturedPostsStripClient'

type Props = {
  locale: SupportedLocale
  countryId?: number
}

export async function fetchFeaturedPosts(countryId: number | null, locale: string) {
  const qs = new URLSearchParams({ land: locale, limit: '8' })
  if (countryId) qs.set('country_id', String(countryId))
  try {
    const res = await fetch(getApiUrl(`/api/home/featured-posts?${qs}`), {
      headers: { Accept: 'application/json' },
      next: { revalidate: 60 },
    })
    if (!res.ok) return []
    const json = (await res.json()) as { success?: boolean; data?: Record<string, unknown>[] }
    return json?.success && Array.isArray(json.data) ? json.data : []
  } catch {
    return []
  }
}

export default async function FeaturedPostsStrip({ locale, countryId, posts: provided }: Props & { posts?: Record<string, unknown>[] }) {
  const posts = provided ?? (await fetchFeaturedPosts(countryId ?? null, locale))
  if (posts.length === 0) return null

  return <FeaturedPostsStripClient locale={locale} posts={posts} />
}
