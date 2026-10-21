'use client'

import { useMemo } from 'react'
import { useParams } from 'next/navigation'

import { DEFAULT_LOCALE, isSupportedLocale, type SupportedLocale } from '@/lib/localization'

import CountryDropdown from './CountryDropdown'
import LocaleDropdown from './LocaleDropdown'
import styles from './PlaceLanguageBar.module.css'

export default function PlaceLanguageBar() {
  const params = useParams<{ locale?: string }>()
  const locale: SupportedLocale = useMemo(() => {
    const raw = Array.isArray(params?.locale) ? params.locale[0] : params?.locale
    return raw && isSupportedLocale(raw) ? raw : DEFAULT_LOCALE
  }, [params])

  return (
    <div className={styles.bar} dir={locale === 'ar' ? 'rtl' : 'ltr'}>
      <div className={styles.place}>
        <span className={styles.pin} aria-hidden>
          <svg viewBox="0 0 24 24" width="14" height="14">
            <path
              fill="currentColor"
              d="M12 2.5a6.5 6.5 0 0 0-6.5 6.5c0 4.7 6.5 12.5 6.5 12.5s6.5-7.8 6.5-12.5A6.5 6.5 0 0 0 12 2.5zm0 8.8a2.3 2.3 0 1 1 0-4.6 2.3 2.3 0 0 1 0 4.6z"
            />
          </svg>
        </span>
        <CountryDropdown locale={locale} compact />
      </div>
      <LocaleDropdown compact />
    </div>
  )
}
