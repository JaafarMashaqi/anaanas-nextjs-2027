import { getApiUrl } from './config'

export type CmsPageSummary = {
  id: number
  slug: string
  name: string
  title: string
}

export type CmsPageRecord = CmsPageSummary & {
  seo_title: string
  seo_description: string
  content: string
  updated_at?: string | null
}

type CmsPageResponse = {
  success?: boolean
  data?: CmsPageRecord
  message?: string
}

type CmsPagesListResponse = {
  success?: boolean
  data?: CmsPageSummary[]
}

export async function fetchCmsPage(
  slug: string,
  locale?: string,
  options?: { revalidateSeconds?: number },
): Promise<CmsPageRecord | null> {
  const searchParams = new URLSearchParams()
  if (locale) searchParams.set('land', locale)
  const query = searchParams.toString()
  const url = getApiUrl(`/api/pages/${encodeURIComponent(slug)}${query ? `?${query}` : ''}`)

  const res = await fetch(
    url,
    options?.revalidateSeconds != null
      ? { next: { revalidate: options.revalidateSeconds } }
      : { cache: 'no-store' },
  )

  if (res.status === 404) return null
  if (!res.ok) {
    throw new Error(`Failed to fetch page: ${res.status} ${res.statusText}`)
  }

  const json = (await res.json()) as CmsPageResponse
  return json.data ?? null
}

export async function fetchCmsPages(
  locale?: string,
  options?: { revalidateSeconds?: number },
): Promise<CmsPageSummary[]> {
  const searchParams = new URLSearchParams()
  if (locale) searchParams.set('land', locale)
  const query = searchParams.toString()
  const url = getApiUrl(`/api/pages${query ? `?${query}` : ''}`)

  const res = await fetch(
    url,
    options?.revalidateSeconds != null
      ? { next: { revalidate: options.revalidateSeconds } }
      : { cache: 'no-store' },
  )

  if (!res.ok) {
    throw new Error(`Failed to fetch pages: ${res.status} ${res.statusText}`)
  }

  const json = (await res.json()) as CmsPagesListResponse
  return Array.isArray(json.data) ? json.data : []
}
