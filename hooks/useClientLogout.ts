'use client'

import { useRouter } from 'next/navigation'
import { signOut } from 'next-auth/react'
import { useCallback, useState } from 'react'

import type { SupportedLocale } from '@/lib/localization'

/**
 * Shared client logout flow used by ProfileDropdown and mobile drawer/header.
 */
export function useClientLogout(locale: SupportedLocale) {
  const router = useRouter()
  const [loggingOut, setLoggingOut] = useState(false)

  const logout = useCallback(async () => {
    if (loggingOut) return
    setLoggingOut(true)
    try {
      try {
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        })
      } catch (err) {
        // eslint-disable-next-line no-console
        console.warn('Backend logout failed (continuing):', err)
      }

      await signOut({ redirect: false })
      router.replace(`/${locale}/auth/sign-in`)
      router.refresh()
    } finally {
      setLoggingOut(false)
    }
  }, [locale, loggingOut, router])

  return { logout, loggingOut }
}
