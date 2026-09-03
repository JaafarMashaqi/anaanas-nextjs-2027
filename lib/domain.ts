export type HostContext = {
  hostname: string
  port?: string
  baseDomain: string
  hasCountrySubdomain: boolean
  countrySubdomain?: string
  isBlogsSubdomain?: boolean
}

const FALLBACK_HOSTNAME = 'localhost'

/** Subdomains that are never treated as ISO country codes (www, app, staging, …). */
const RESERVED_SUBDOMAINS = new Set([
  'www',
  'm',
  'mobile',
  'app',
  'api',
  'admin',
  'stg',
  'staging',
  'stage',
  'dev',
  'test',
  'local',
  'static',
  'cdn',
  'mail',
  'webmail',
  'ftp',
  'smtp',
  'in',
  'out',
  'ar',
  'en',
  'blogs',
])

/** Registered site domain (e.g. `anaanas.com`) without subdomain — used for apex URLs. */
export function getBaseDomainFromEnv(): string | null {
  const raw = process.env.NEXT_PUBLIC_BASE_DOMAIN?.trim()
  if (!raw) return null
  return raw
    .replace(/^https?:\/\//, '')
    .split('/')[0]
    .toLowerCase()
    .split(':')[0]
}

function isLikelyIsoCountryCode(label: string): boolean {
  return /^[a-z]{2,3}$/i.test(label)
}

/**
 * Parse `Host` header: country subdomain, base domain for links, and whether
 * the request is on a tenant host (e.g. jo.anaanas.com).
 *
 * Set `NEXT_PUBLIC_BASE_DOMAIN=anaanas.com` in production so the apex host
 * `anaanas.com` is not mistaken for a country + TLD `com` (which produced
 * broken links like https://jo.com/...).
 */
export function parseHost(hostHeader: string | null): HostContext {
  const rawHost = (hostHeader ?? FALLBACK_HOSTNAME).trim()
  const [hostnamePart = FALLBACK_HOSTNAME, port] = rawHost.split(':')
  const hostname = hostnamePart.toLowerCase()
  const labels = hostname.split('.').filter(Boolean)

  const baseEnv = getBaseDomainFromEnv()
  if (baseEnv) {
    if (hostname === baseEnv) {
      return {
        hostname,
        port,
        baseDomain: baseEnv,
        hasCountrySubdomain: false,
      }
    }
    if (hostname === `www.${baseEnv}`) {
      return {
        hostname,
        port,
        baseDomain: baseEnv,
        hasCountrySubdomain: false,
      }
    }
    if (hostname.endsWith(`.${baseEnv}`)) {
      const prefix = hostname.slice(0, -baseEnv.length - 1)
      if (!prefix.includes('.')) {
        const p = prefix.toLowerCase()
        if (RESERVED_SUBDOMAINS.has(p)) {
          return {
            hostname,
            port,
            baseDomain: baseEnv,
            hasCountrySubdomain: false,
            isBlogsSubdomain: p === 'blogs',
          }
        }
        if (isLikelyIsoCountryCode(p)) {
          return {
            hostname,
            port,
            baseDomain: baseEnv,
            hasCountrySubdomain: true,
            countrySubdomain: p,
          }
        }
      }
      return {
        hostname,
        port,
        baseDomain: baseEnv,
        hasCountrySubdomain: false,
      }
    }
  }

  if (labels.length === 0) {
    return {
      hostname: FALLBACK_HOSTNAME,
      port,
      baseDomain: FALLBACK_HOSTNAME,
      hasCountrySubdomain: false,
    }
  }

  if (labels.length === 1) {
    return {
      hostname,
      port,
      baseDomain: hostname,
      hasCountrySubdomain: false,
    }
  }

  // Two labels: e.g. anaanas.com (apex) vs blogs.localhost
  if (labels.length === 2) {
    const [a, b] = labels
    const aLower = a.toLowerCase()
    if (RESERVED_SUBDOMAINS.has(aLower)) {
      return {
        hostname,
        port,
        baseDomain: `${a}.${b}`,
        hasCountrySubdomain: false,
        isBlogsSubdomain: aLower === 'blogs',
      }
    }
    if (a.length > 3 || !isLikelyIsoCountryCode(a)) {
      return {
        hostname,
        port,
        baseDomain: `${a}.${b}`,
        hasCountrySubdomain: false,
      }
    }
    // jo.com-style: 2-char first label; treat as "country" + base TLD (legacy)
    return {
      hostname,
      port,
      baseDomain: b,
      hasCountrySubdomain: true,
      countrySubdomain: a.toLowerCase(),
    }
  }

  const firstLabel = labels[0]!
  if (RESERVED_SUBDOMAINS.has(firstLabel.toLowerCase()) || !isLikelyIsoCountryCode(firstLabel)) {
    return {
      hostname,
      port,
      baseDomain: labels.slice(1).join('.') || FALLBACK_HOSTNAME,
      hasCountrySubdomain: false,
      isBlogsSubdomain: firstLabel.toLowerCase() === 'blogs',
    }
  }

  return {
    hostname,
    port,
    baseDomain: labels.slice(1).join('.') || FALLBACK_HOSTNAME,
    hasCountrySubdomain: true,
    countrySubdomain: firstLabel.toLowerCase(),
  }
}

export function buildCountryHost(
  country: string,
  baseDomain: string,
  port?: string
): string {
  const host = `${country.toLowerCase()}.${baseDomain}`
  return port ? `${host}:${port}` : host
}

/** Base hostname for country links: env wins so apex pages build correct subdomains. */
export function getBaseDomainForCountryLinks(hostInfo: HostContext): string {
  return getBaseDomainFromEnv() ?? hostInfo.baseDomain
}

export function isBlogsHost(hostHeader: string | null): boolean {
  return parseHost(hostHeader).isBlogsSubdomain === true
}
