import { API_BASE_URL, getApiUrl } from '@/lib/api/config'

/**
 * Normalizes media URLs returned by the API for Next/Image and `<img>`.
 *
 * Goals:
 *  - **Idempotent.** Calling the function twice on the same value must yield
 *    the same result; otherwise upstream callers (e.g. PostCard mapping
 *    avatars before passing to CommentItem) end up double-rewriting paths.
 *  - **Local-asset safe.** Next.js static assets (`/_next/...`), public folder
 *    paths (`/assets/...`, `/images/...`, `/icons/...`), `data:`/`blob:` URIs
 *    and absolute external URLs must never be rewritten to the API host —
 *    those are served by the Next.js dev/prod server, not Laravel.
 *  - **Storage-aware.** When `NEXT_PUBLIC_MEDIA_CDN_URL` is set, any
 *    `/storage/...` path (or absolute `localhost` URL pointing at storage) is
 *    rewritten to the CDN mirror that keeps the same path layout. Otherwise
 *    we fall back to Laravel's public storage origin.
 */
function resolveMediaCdnBase(): string | null {
  const raw = process.env.NEXT_PUBLIC_MEDIA_CDN_URL?.trim()
  if (!raw) return null
  return raw.replace(/\/$/, '')
}

const CDN_BASE = resolveMediaCdnBase()

/**
 * Path prefixes that are owned by the Next.js application itself and must
 * always be served from the current page origin — never rewritten to the
 * Laravel/API host.  Anything matched here is returned untouched so the
 * browser resolves it against the active origin (jo.localhost, prod, etc.).
 */
const LOCAL_NEXT_PREFIXES = [
  '/_next/',
  '/assets/',
  '/images/',
  '/icons/',
  '/static/',
  '/favicon',
  '/manifest',
  '/sw.js',
]

function isLocalNextPath(path: string): boolean {
  return LOCAL_NEXT_PREFIXES.some((p) => path.startsWith(p))
}

function joinCdn(path: string): string {
  if (!CDN_BASE) return ''
  const normalized = path.replace(/^\/+/, '')
  return `${CDN_BASE}/${normalized}`
}

export function resolveMediaUrl(url?: string | null): string {
  if (url == null || typeof url !== 'string') return ''
  const u = url.trim()
  if (!u) return ''

  // Inline / object URLs always pass through.
  if (u.startsWith('data:') || u.startsWith('blob:')) return u

  // `/post-media/...` — local mirror served from Laravel APP_URL (MEDIA_DRIVER=local).
  if (u.startsWith('/post-media/')) {
    if (CDN_BASE) return joinCdn(u.slice('/post-media/'.length))
    return getApiUrl(u)
  }
  if (u.startsWith('post-media/')) {
    if (CDN_BASE) return joinCdn(u.slice('post-media/'.length))
    return getApiUrl(`/${u}`)
  }

  // Storage paths returned from the Laravel API.  These get the CDN/API
  // treatment and are the only "/" paths we ever rewrite.
  if (u.startsWith('/storage/')) {
    if (CDN_BASE) return joinCdn(u.slice('/storage/'.length))
    return getApiUrl(u)
  }
  if (u.startsWith('storage/')) {
    if (CDN_BASE) return joinCdn(u.slice('storage/'.length))
    return getApiUrl(`/${u}`)
  }

  // Next.js / public-folder paths must stay relative to the current origin.
  if (isLocalNextPath(u)) return u

  if (u.startsWith('//')) {
    return `https:${u}`
  }

  if (u.startsWith('http://') || u.startsWith('https://')) {
    // Absolute URL — only one transformation we still want to apply: a
    // localhost/127.0.0.1 host pointing at /storage/... should be redirected
    // to the CDN (or normalized API host).  Any other absolute URL passes
    // through unchanged so we never re-mangle CloudFront/S3/Next-hosted
    // assets.
    try {
      const parsed = new URL(u)
      const isLocalHost =
        parsed.hostname === 'localhost' ||
        parsed.hostname === '127.0.0.1' ||
        parsed.hostname.endsWith('.localhost')

      if (isLocalHost && parsed.pathname.startsWith('/storage/')) {
        const stripped = parsed.pathname.slice('/storage/'.length)
        if (CDN_BASE) {
          return `${CDN_BASE}/${stripped}${parsed.search || ''}`
        }
        const api = new URL(API_BASE_URL)
        parsed.protocol = api.protocol
        parsed.hostname = api.hostname
        parsed.port = api.port
        return parsed.toString()
      }
    } catch {
      /* malformed absolute URL — fall through to return as-is */
    }
    return u
  }

  // Other "/" paths are treated as Next.js / public-folder relative URLs and
  // must NOT be rewritten to the API host (e.g. `/_next/...` defaults).  They
  // already passed the LOCAL_NEXT_PREFIXES check above so anything else here
  // is a custom local route — leave it alone.
  if (u.startsWith('/')) return u

  // Bare paths like "upload/photos/.../foo.webp" returned from API accessors
  // — resolve to CDN first, otherwise to Laravel's public/storage.
  if (CDN_BASE) return joinCdn(u)
  return getApiUrl(`/storage/${u.replace(/^\/+/, '')}`)
}
