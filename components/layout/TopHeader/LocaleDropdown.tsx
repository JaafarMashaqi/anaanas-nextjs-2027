'use client'

import { useMemo, useState } from 'react'
import { useParams, usePathname, useSearchParams } from 'next/navigation'
import { Dropdown, DropdownItem, DropdownMenu, DropdownToggle } from 'react-bootstrap'
import { BsCheck2, BsChevronDown, BsTranslate } from 'react-icons/bs'

import {
  DEFAULT_LOCALE,
  LANGUAGE_MENU,
  isSupportedLocale,
  type SupportedLocale,
} from '@/lib/localization'

type Props = {
  /** Compact mode hides the language label — used on small screens. */
  compact?: boolean
}

const SHORT_CODES: Record<string, string> = {
  ar: 'AR',
  en: 'EN',
  tr: 'TR',
  es: 'ES',
  zh: '中',
  fr: 'FR',
}

/**
 * Language switcher:
 * - Picks up the active locale from the URL (`/[locale]/…`).
 * - Swaps the leading locale segment in `pathname` and preserves the current
 *   `searchParams` so the user stays on the same page (filters, query, etc.).
 * - Mirrors the `CountryDropdown` visual language so they read as a matching
 *   pair in the header (pill toggle + flag-like badge + label + chevron).
 * - Menu alignment is locale-aware so it never overflows the viewport in RTL.
 */
const LocaleDropdown = ({ compact = false }: Props) => {
  const params = useParams<{ locale?: string }>()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const activeLocale: SupportedLocale = useMemo(() => {
    const raw = Array.isArray(params?.locale) ? params.locale[0] : params?.locale
    if (raw && isSupportedLocale(raw)) return raw
    return DEFAULT_LOCALE
  }, [params])

  const activeName = LANGUAGE_MENU.find((item) => item.code === activeLocale)?.native || SHORT_CODES[activeLocale]
  const [pendingNote, setPendingNote] = useState<string | null>(null)
  const isArabic = activeLocale === 'ar'

  /** Build a path that replaces (or prepends) the locale segment, preserving the query string. */
  const buildLocaleUrl = (target: SupportedLocale): string => {
    const path = pathname || `/${target}`
    const segments = path.split('/').filter(Boolean)

    if (segments.length === 0) {
      // root → "/<target>"
      return appendSearch(`/${target}`)
    }

    if (isSupportedLocale(segments[0])) {
      segments[0] = target
    } else {
      segments.unshift(target)
    }

    return appendSearch(`/${segments.join('/')}`)
  }

  const appendSearch = (base: string): string => {
    const qs = searchParams?.toString()
    return qs ? `${base}?${qs}` : base
  }

  const labelMenu = isArabic ? 'اختر اللغة' : 'Select language'
  const toggleAria = isArabic ? 'تغيير اللغة' : 'Change language'

  // RTL-friendly menu alignment — pin to the end edge of the toggle so it
  // expands inward rather than off-screen.
  const menuAlign = isArabic ? { end: true } : { start: true }

  return (
    <Dropdown className="localeDropdown">
      <DropdownToggle
        as="button"
        type="button"
        className="localeDropdown__toggle"
        aria-label={toggleAria}
        title={activeName}
      >
        <span className="localeDropdown__badge" aria-hidden>
          <span className="localeDropdown__badgeIcon">
            <BsTranslate />
          </span>
          <span className="localeDropdown__badgeCode">{SHORT_CODES[activeLocale]}</span>
        </span>

        {!compact && (
          <span className="localeDropdown__label">{activeName}</span>
        )}

        <BsChevronDown size={10} className="localeDropdown__chevron" />
      </DropdownToggle>

      <DropdownMenu
        align={menuAlign as never}
        className="localeDropdown__menu shadow-lg border-0 p-2"
      >
        <div className="localeDropdown__menuHeader">
          <BsTranslate size={14} />
          <span>{labelMenu}</span>
          <span className="ms-auto fw-semibold text-dark">
            {SHORT_CODES[activeLocale]}
          </span>
        </div>

        {LANGUAGE_MENU.map((item) => {
          const isActive = item.code === activeLocale
          if (!item.ready || !isSupportedLocale(item.code)) {
            return (
              <DropdownItem
                key={item.code}
                as="button"
                type="button"
                className="localeDropdown__item"
                onClick={() => {
                  try {
                    window.localStorage.setItem('ananas.languageChoice', item.code)
                  } catch {
                    /* the note still explains the limit */
                  }
                  setPendingNote(
                    isArabic
                      ? `${item.native}: القاموس غير جاهز، والصفحة تبقى كما هي.`
                      : `${item.native}: the dictionary is not ready, so this page stays as it is.`,
                  )
                }}
              >
                <span className="localeDropdown__itemBadge" aria-hidden>
                  {SHORT_CODES[item.code]}
                </span>
                <span className="localeDropdown__itemName">{item.native}</span>
                <span className="localeDropdown__itemHint">{isArabic ? 'لاحقاً' : 'Later'}</span>
              </DropdownItem>
            )
          }
          const href = buildLocaleUrl(item.code)
          return (
            <DropdownItem
              key={item.code}
              href={href}
              active={isActive}
              className="localeDropdown__item"
              onClick={() => {
                try {
                  window.localStorage.setItem('ananas.languageChoice', item.code)
                  window.localStorage.setItem('ananas.languageExplicit', '1')
                } catch {
                  /* navigation still changes the locale */
                }
              }}
            >
              <span className="localeDropdown__itemBadge" aria-hidden>
                {SHORT_CODES[item.code]}
              </span>
              <span className="localeDropdown__itemName">{item.native}</span>
              {isActive ? (
                <BsCheck2 size={16} className="text-success" />
              ) : (
                <span className="localeDropdown__itemHint">{SHORT_CODES[item.code]}</span>
              )}
            </DropdownItem>
          )
        })}
        {pendingNote ? <p className="localeDropdown__itemHint px-2 mb-0">{pendingNote}</p> : null}
      </DropdownMenu>

      <style jsx global>{`
        .localeDropdown {
          position: relative;
        }

        /* --- Toggle pill --- */
        .localeDropdown__toggle {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 4px 10px;
          height: 36px;
          border-radius: 999px;
          border: 1px solid rgba(0, 0, 0, 0.05);
          background: #f4f5f8;
          color: #111827;
          transition: background-color 0.18s ease, transform 0.18s ease;
        }
        .localeDropdown__toggle:hover,
        .localeDropdown__toggle[aria-expanded='true'] {
          background: #eceef2;
        }
        .localeDropdown__toggle:focus-visible {
          outline: 2px solid rgba(255, 193, 7, 0.55);
          outline-offset: 2px;
        }
        .localeDropdown__toggle::after {
          display: none !important;
        }

        /* --- Badge (icon + active code) --- */
        .localeDropdown__badge {
          width: 22px;
          height: 22px;
          border-radius: 999px;
          background: linear-gradient(135deg, #ffe259 0%, #ffa751 100%);
          color: #fff;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          flex: 0 0 auto;
          box-shadow:
            0 4px 10px -4px rgba(255, 167, 81, 0.55),
            inset 0 0 0 1px rgba(255, 255, 255, 0.45);
          position: relative;
        }

        .localeDropdown__badgeIcon {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          font-size: 11px;
          line-height: 1;
        }

        /* The 2-letter code overlays the bottom-end corner of the badge for a
           clean, dual-cue affordance (icon + locale code). Hidden visually
           when there isn't enough room (handled with @media further down). */
        .localeDropdown__badgeCode {
          position: absolute;
          bottom: -3px;
          inset-inline-end: -4px;
          font-size: 8px;
          font-weight: 800;
          letter-spacing: 0.04em;
          line-height: 1;
          padding: 2px 4px;
          border-radius: 999px;
          background: #ffffff;
          color: #b45309;
          box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.06);
        }

        .localeDropdown__label {
          font-size: 0.82rem;
          font-weight: 600;
          color: #111827;
          max-width: 110px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .localeDropdown__chevron {
          color: #6b7280;
          flex: 0 0 auto;
        }

        /* --- Menu --- */
        .localeDropdown__menu {
          min-width: 220px;
          border-radius: 14px !important;
        }

        .localeDropdown__menuHeader {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 6px 10px 10px;
          border-bottom: 1px solid rgba(0, 0, 0, 0.05);
          margin-bottom: 6px;
          font-size: 0.78rem;
          color: #6b7280;
        }

        /* --- Items --- */
        .localeDropdown__item {
          display: flex !important;
          align-items: center;
          gap: 10px;
          padding: 8px 10px !important;
          border-radius: 10px !important;
          white-space: normal;
        }
        .localeDropdown__item:hover,
        .localeDropdown__item:focus {
          background: #f4f5f8;
        }
        .localeDropdown__item.active {
          background: rgba(255, 193, 7, 0.15) !important;
          color: #111827 !important;
        }

        .localeDropdown__itemBadge {
          width: 28px;
          height: 28px;
          border-radius: 999px;
          background: linear-gradient(135deg, #ffe259 0%, #ffa751 100%);
          color: #fff;
          font-size: 0.72rem;
          font-weight: 800;
          letter-spacing: 0.04em;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          flex: 0 0 auto;
          box-shadow:
            0 4px 10px -4px rgba(255, 167, 81, 0.55),
            inset 0 0 0 1px rgba(255, 255, 255, 0.45);
        }

        .localeDropdown__itemName {
          flex: 1 1 auto;
          min-width: 0;
          font-size: 0.88rem;
          font-weight: 500;
          color: #111827;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .localeDropdown__itemHint {
          flex: 0 0 auto;
          font-size: 0.68rem;
          font-weight: 700;
          letter-spacing: 0.04em;
          color: #6b7280;
          background: rgba(0, 0, 0, 0.04);
          border-radius: 6px;
          padding: 2px 6px;
        }

        /* --- Mobile compact --- */
        @media (max-width: 991.98px) {
          .localeDropdown__toggle {
            height: 34px;
            padding: 3px 8px;
          }
        }
      `}</style>
    </Dropdown>
  )
}

export default LocaleDropdown
