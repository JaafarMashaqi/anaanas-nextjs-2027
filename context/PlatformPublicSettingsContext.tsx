'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'

export type PlatformPublicSocial = {
  facebook: string | null
  twitter: string | null
  linkedin: string | null
  youtube: string | null
  instagram: string | null
}

export type PlatformPublicContact = {
  phone: string | null
  whatsapp: string | null
  phone_href: string | null
  whatsapp_href: string | null
}

export type PlatformPublicSettings = {
  post_report_allow_guests: boolean
  post_report_threshold: number
  social: PlatformPublicSocial
  contact: PlatformPublicContact
}

type PlatformPublicSettingsContextValue = {
  settings: PlatformPublicSettings | null
  loading: boolean
  error: Error | null
  refetch: () => Promise<void>
}

const EMPTY_SOCIAL: PlatformPublicSocial = {
  facebook: null,
  twitter: null,
  linkedin: null,
  youtube: null,
  instagram: null,
}

const EMPTY_CONTACT: PlatformPublicContact = {
  phone: null,
  whatsapp: null,
  phone_href: null,
  whatsapp_href: null,
}

const DEFAULT_SETTINGS: PlatformPublicSettings = {
  post_report_allow_guests: false,
  post_report_threshold: 5,
  social: EMPTY_SOCIAL,
  contact: EMPTY_CONTACT,
}

const PlatformPublicSettingsContext = createContext<PlatformPublicSettingsContextValue | null>(null)

/** Module-level cache so remounts / multiple consumers don't re-hit the network. */
let cachedSettings: PlatformPublicSettings | null = null
let cachedAt = 0
let inflight: Promise<PlatformPublicSettings> | null = null
const CACHE_TTL_MS = 5 * 60 * 1000

function normalizeSettings(raw: unknown): PlatformPublicSettings {
  const data = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>
  const socialRaw = (data.social && typeof data.social === 'object' ? data.social : {}) as Record<
    string,
    unknown
  >
  const contactRaw = (data.contact && typeof data.contact === 'object' ? data.contact : {}) as Record<
    string,
    unknown
  >

  const asNullableString = (v: unknown): string | null => {
    if (typeof v !== 'string') return null
    const trimmed = v.trim()
    return trimmed.length > 0 ? trimmed : null
  }

  return {
    post_report_allow_guests: Boolean(data.post_report_allow_guests),
    post_report_threshold: Math.max(1, Number(data.post_report_threshold) || 5),
    social: {
      facebook: asNullableString(socialRaw.facebook),
      twitter: asNullableString(socialRaw.twitter),
      linkedin: asNullableString(socialRaw.linkedin),
      youtube: asNullableString(socialRaw.youtube),
      instagram: asNullableString(socialRaw.instagram),
    },
    contact: {
      phone: asNullableString(contactRaw.phone),
      whatsapp: asNullableString(contactRaw.whatsapp),
      phone_href: asNullableString(contactRaw.phone_href),
      whatsapp_href: asNullableString(contactRaw.whatsapp_href),
    },
  }
}

async function fetchPlatformPublicSettings(force = false): Promise<PlatformPublicSettings> {
  const now = Date.now()
  if (!force && cachedSettings && now - cachedAt < CACHE_TTL_MS) {
    return cachedSettings
  }
  if (!force && inflight) {
    return inflight
  }

  inflight = (async () => {
    const res = await fetch('/api/platform/public-settings', {
      headers: { Accept: 'application/json' },
      cache: 'no-store',
    })
    const json = await res.json().catch(() => ({}))
    if (!res.ok) {
      throw new Error(
        (typeof json?.message === 'string' && json.message) ||
          `Failed to load public settings (${res.status})`,
      )
    }
    const next = normalizeSettings(json?.data)
    cachedSettings = next
    cachedAt = Date.now()
    return next
  })()

  try {
    return await inflight
  } finally {
    inflight = null
  }
}

export function PlatformPublicSettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<PlatformPublicSettings | null>(cachedSettings)
  const [loading, setLoading] = useState(!cachedSettings)
  const [error, setError] = useState<Error | null>(null)

  const load = useCallback(async (force = false) => {
    setLoading(true)
    setError(null)
    try {
      const next = await fetchPlatformPublicSettings(force)
      setSettings(next)
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load public settings'))
      setSettings((prev) => prev ?? DEFAULT_SETTINGS)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load(false)
  }, [load])

  const value = useMemo<PlatformPublicSettingsContextValue>(
    () => ({
      settings,
      loading,
      error,
      refetch: () => load(true),
    }),
    [settings, loading, error, load],
  )

  return (
    <PlatformPublicSettingsContext.Provider value={value}>
      {children}
    </PlatformPublicSettingsContext.Provider>
  )
}

export function usePlatformPublicSettings(): PlatformPublicSettingsContextValue {
  const ctx = useContext(PlatformPublicSettingsContext)
  if (!ctx) {
    throw new Error('usePlatformPublicSettings must be used within PlatformPublicSettingsProvider')
  }
  return ctx
}

/** Safe defaults when a leaf still needs values during first paint. */
export function usePlatformPublicSettingsData(): PlatformPublicSettings {
  const { settings } = usePlatformPublicSettings()
  return settings ?? DEFAULT_SETTINGS
}
