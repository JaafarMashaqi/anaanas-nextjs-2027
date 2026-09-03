import { getApiUrl } from './config'

export type BlogCategory = {
  id: number
  slug: string
  name: string
  description: string
  image_url: string | null
  blogs_count?: number
}

export type BlogAuthor = {
  id: number
  name: string
  avatar_url: string | null
}

export type BlogImage = {
  id: number
  url: string | null
  sort_order: number
}

export type BlogPost = {
  id: number
  slug: string
  title: string
  excerpt: string
  content?: string
  seo_title: string
  seo_description: string
  cover_image_url: string | null
  published_at: string | null
  likes_count: number
  views_count: number
  comments_count: number
  category: { id: number; slug: string; name: string } | null
  author?: BlogAuthor | null
  images?: BlogImage[]
  liked_by_me?: boolean
}

export type BlogComment = {
  id: number
  blog_id: number
  parent_id: number | null
  body: string
  created_at: string | null
  user: BlogAuthor | null
  replies_count: number
}

type ListResponse = {
  success?: boolean
  data?: BlogPost[]
  meta?: {
    current_page?: number
    last_page?: number
    per_page?: number
    total?: number
  }
}

export async function fetchBlogCategories(
  locale?: string,
  options?: { revalidateSeconds?: number },
): Promise<BlogCategory[]> {
  const params = new URLSearchParams()
  if (locale) params.set('land', locale)
  const url = getApiUrl(`/api/blog-categories?${params}`)

  const res = await fetch(
    url,
    options?.revalidateSeconds != null
      ? { next: { revalidate: options.revalidateSeconds } }
      : { cache: 'no-store' },
  )
  if (!res.ok) throw new Error(`Failed to fetch blog categories: ${res.status}`)
  const json = await res.json()
  return Array.isArray(json.data) ? json.data : []
}

export async function fetchBlogs(
  locale?: string,
  options?: { category?: string; page?: number; revalidateSeconds?: number },
): Promise<{ data: BlogPost[]; meta: ListResponse['meta'] }> {
  const params = new URLSearchParams()
  if (locale) params.set('land', locale)
  if (options?.category) params.set('category', options.category)
  if (options?.page) params.set('page', String(options.page))
  const url = getApiUrl(`/api/blogs?${params}`)

  const res = await fetch(
    url,
    options?.revalidateSeconds != null
      ? { next: { revalidate: options.revalidateSeconds } }
      : { cache: 'no-store' },
  )
  if (!res.ok) throw new Error(`Failed to fetch blogs: ${res.status}`)
  const json = (await res.json()) as ListResponse
  return { data: json.data ?? [], meta: json.meta }
}

export async function fetchBlogBySlug(
  slug: string,
  locale?: string,
  options?: { revalidateSeconds?: number },
): Promise<BlogPost | null> {
  const params = new URLSearchParams()
  if (locale) params.set('land', locale)
  const url = getApiUrl(`/api/blogs/${encodeURIComponent(slug)}?${params}`)

  const res = await fetch(
    url,
    options?.revalidateSeconds != null
      ? { next: { revalidate: options.revalidateSeconds } }
      : { cache: 'no-store' },
  )
  if (res.status === 404) return null
  if (!res.ok) throw new Error(`Failed to fetch blog: ${res.status}`)
  const json = await res.json()
  return json.data ?? null
}

export async function fetchBlogComments(
  blogId: number,
  page = 1,
): Promise<{ data: BlogComment[]; meta: Record<string, unknown> }> {
  const res = await fetch(`/api/blogs/${blogId}/comments?page=${page}`, {
    headers: { Accept: 'application/json' },
    cache: 'no-store',
  })
  const json = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(json?.message || 'Failed to load comments')
  return { data: json.data ?? [], meta: json.meta ?? {} }
}

export async function postBlogComment(
  blogId: number,
  body: string,
  parentId?: number,
): Promise<BlogComment> {
  const res = await fetch(`/api/blogs/${blogId}/comments`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ body, ...(parentId ? { parent_id: parentId } : {}) }),
  })
  const json = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(json?.message || 'Failed to post comment')
  return json.data as BlogComment
}

export async function toggleBlogLike(
  blogId: number,
): Promise<{ liked: boolean; likes_count: number }> {
  const res = await fetch(`/api/blogs/${blogId}/reactions`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ type: 'like' }),
  })
  const json = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(json?.message || 'Failed to react')
  return json.data as { liked: boolean; likes_count: number }
}

export async function logBlogView(blogId: number): Promise<void> {
  await fetch(`/api/blogs/${blogId}/events`, {
    method: 'POST',
    headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
    body: JSON.stringify({ event: 'blog_view' }),
  }).catch(() => {
    /* non-critical */
  })
}
