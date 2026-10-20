'use client'

import { usePathname } from 'next/navigation'
import { useEffect } from 'react'
import { DEFAULT_LOCALE, isSupportedLocale } from '@/lib/localization'
import type { SupportedLocale } from '@/lib/localization'

const LOCALE_STYLESHEET_MAP: Record<SupportedLocale, string> = {
  ar: '/styles/lang-ar.css?v=neo1',
  en: '/styles/lang-en.css?v=neo1',
}

function getLocaleFromPathname(pathname: string): SupportedLocale {
  const segments = pathname.split('/').filter(Boolean)
  const first = segments[0]
  return first && isSupportedLocale(first) ? first : DEFAULT_LOCALE
}

function syncDirection(locale: SupportedLocale) {
  const direction = locale === 'ar' ? 'rtl' : 'ltr'
  const localeClass = direction === 'rtl' ? 'is-rtl' : 'is-ltr'

  const html = document.documentElement
  const body = document.body

  html.setAttribute('dir', direction)
  html.setAttribute('lang', locale)
  html.setAttribute('data-locale', locale)

  body.setAttribute('data-locale', locale)
  body.setAttribute('data-dir', direction)
  body.classList.remove('is-rtl', 'is-ltr')
  body.classList.add(localeClass)

  const stylesheetHref = LOCALE_STYLESHEET_MAP[locale]
  const link = document.querySelector<HTMLLinkElement>('link[href*="lang-"]')
  const expectedFile = `lang-${locale}.css`
  if (link && !link.getAttribute('href')?.includes(expectedFile)) {
    link.href = stylesheetHref
  }
}

/**
 * Syncs document direction (RTL/LTR), lang, and locale stylesheet
 * when the route changes during client-side navigation.
 * Fixes direction not updating until refresh when switching locale.
 */
const DirectionSync = () => {
  const pathname = usePathname()

  useEffect(() => {
    const locale = getLocaleFromPathname(pathname ?? '')
    syncDirection(locale)
  }, [pathname])

  return null
}

export default DirectionSync
