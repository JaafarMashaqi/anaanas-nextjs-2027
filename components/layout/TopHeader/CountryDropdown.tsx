'use client'

import { useEffect, useMemo, useState } from 'react'
import { Dropdown, DropdownItem, DropdownMenu, DropdownToggle } from 'react-bootstrap'
import { BsGlobe2, BsChevronDown, BsCheck2 } from 'react-icons/bs'

import { useAppData } from '@/context/AppDataContext'
import { parseHost, buildCountryHost } from '@/lib/domain'
import type { Country } from '@/lib/api/countries'
import { persistPreferredCountryIso2 } from '@/lib/geo/persistPreferredCountry.client'
import { isPreviewCountryMode, previewCountrySwitchPath } from '@/lib/preview/countryMode'
import type { SupportedLocale } from '@/lib/localization'

type Props = {
  locale?: SupportedLocale
  /** Compact mode hides the country label — used on small screens. */
  compact?: boolean
}

/**
 * Country switcher:
 * - Resolves the active country from the current subdomain (iso2 / iso_code).
 * - Shows the active flag + name in the toggle (or just the flag in compact mode).
 * - Falls back to a globe icon + ISO chip when a flag image is missing.
 * - Navigates to the matching subdomain host on select, preserving the locale.
 * - Menu alignment is locale-aware so it never overflows the viewport in RTL.
 */
const CountryDropdown = ({ locale = 'ar', compact = false }: Props) => {
  const { countries, selectedCountry, loadingCountries } = useAppData()

  // SSR-safe: compute host info on the client only.
  const [hostCtx, setHostCtx] = useState<ReturnType<typeof parseHost> | null>(null)
  useEffect(() => {
    if (typeof window === 'undefined') return
    setHostCtx(parseHost(window.location.host))
  }, [])

  const isArabic = locale === 'ar'

  // Prefer the context's selectedCountry; otherwise derive from the current subdomain.
  const activeCountry: Country | null = useMemo(() => {
    if (selectedCountry) return selectedCountry
    const sub = hostCtx?.countrySubdomain
    if (!sub) return null
    return (
      countries.find(
        (c) => (c.iso2 || c.iso_code || '').toLowerCase() === sub.toLowerCase(),
      ) ?? null
    )
  }, [selectedCountry, hostCtx, countries])

  const previewMode = isPreviewCountryMode()

  const buildCountryUrl = (country: Country): string => {
    const iso = (country.iso2 || country.iso_code || '').toLowerCase()
    if (!iso) return '#'
    if (previewMode) return previewCountrySwitchPath(locale, iso)
    if (!hostCtx) return '#'
    const proto =
      typeof window !== 'undefined' ? window.location.protocol.replace(':', '') : 'https'
    const host = buildCountryHost(iso, hostCtx.baseDomain, hostCtx.port)
    return `${proto}://${host}/${locale}`
  }

  const labelAll = isArabic ? 'اختر دولة' : 'Select country'
  const loadingLabel = isArabic ? 'جاري التحميل...' : 'Loading...'

  const activeIso = (activeCountry?.iso2 || activeCountry?.iso_code || '').toUpperCase()
  const activeFlag = activeCountry?.flag_full_path || `/assets/flags/32x32/${activeIso.toLowerCase()}.png`

  const activeName = activeCountry?.name || labelAll

  const available = countries.filter((c) => c.iso2 || c.iso_code)

  // RTL-friendly menu alignment: pin to the end edge of the toggle so it
  // expands inward rather than off-screen.
  const menuAlign = isArabic ? { end: true } : { start: true }

  return (
    <Dropdown className="countryDropdown">
      <DropdownToggle
        as="button"
        type="button"
        className="countryDropdown__toggle"
        aria-label={labelAll}
        title={activeName}
      >
        {/* Flag (or fallback globe/ISO) */}
        <span className="countryDropdown__flag">
          {activeFlag ? (
            // Using a plain <img> so we don't need to allowlist each CDN in next.config
            // eslint-disable-next-line @next/next/no-img-element
            <img src={activeFlag} alt={activeName} />
          ) : activeIso ? (
            <span className="countryDropdown__iso">{activeIso}</span>
          ) : (
            <BsGlobe2 size={14} className="text-muted" />
          )}
        </span>

        {!compact && (
          <span className="countryDropdown__label">
            {loadingCountries && !activeCountry ? loadingLabel : activeName}
          </span>
        )}

        <BsChevronDown size={10} className="countryDropdown__chevron" />
      </DropdownToggle>

      <DropdownMenu
        align={menuAlign as never}
        className="countryDropdown__menu shadow-lg border-0 p-2"
      >
        <div className="countryDropdown__menuHeader">
          <BsGlobe2 size={14} />
          <span>{isArabic ? 'الدولة الحالية' : 'Browsing from'}</span>
          {activeCountry?.name && (
            <span className="ms-auto fw-semibold text-dark">{activeCountry.name}</span>
          )}
        </div>

        {available.length === 0 && (
          <div className="px-2 py-3 small text-muted">
            {loadingCountries
              ? isArabic
                ? 'جاري تحميل الدول...'
                : 'Loading countries...'
              : isArabic
                ? 'لا توجد دول متاحة'
                : 'No countries available'}
          </div>
        )}

        {available.map((country) => {
          const iso = (country.iso2 || country.iso_code || '').toUpperCase()
          const isActive = activeIso === iso
          const href = buildCountryUrl(country)
          const flag = country.flag_full_path   || `/assets/flags/32x32/${iso.toLowerCase()}.png`

          
          return (
            <DropdownItem
              key={country.id}
              href={href}
              active={isActive}
              className="countryDropdown__item"
              onMouseDown={() =>
                persistPreferredCountryIso2(country.iso2 || country.iso_code || '')
              }
            >
              <span className="countryDropdown__itemFlag">
                {flag ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={flag} alt={country.name} />
                ) : (
                  <span className="countryDropdown__itemIso">{iso}</span>
                )}
              </span>
              <span className="countryDropdown__itemName">{country.name}</span>
              {isActive ? (
                <BsCheck2 size={16} className="text-success" />
              ) : (
                <span className="countryDropdown__itemBadge">{iso}</span>
              )}
            </DropdownItem>
          )
        })}
      </DropdownMenu>

      <style jsx global>{`
        .countryDropdown {
          position: relative;
        }

        .countryDropdown__toggle {
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
        .countryDropdown__toggle:hover,
        .countryDropdown__toggle[aria-expanded='true'] {
          background: #eceef2;
        }
        .countryDropdown__toggle:focus-visible {
          outline: 2px solid rgba(255, 193, 7, 0.55);
          outline-offset: 2px;
        }

        .countryDropdown__flag {
          width: 22px;
          height: 22px;
          border-radius: 999px;
          overflow: hidden;
          background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%);
          display: inline-flex;
          align-items: center;
          justify-content: center;
          flex: 0 0 auto;
          box-shadow: inset 0 0 0 1px rgba(0, 0, 0, 0.06);
        }
        .countryDropdown__flag img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }

        .countryDropdown__iso {
          font-size: 9px;
          font-weight: 700;
          color: #4b5563;
          letter-spacing: 0.3px;
        }

        .countryDropdown__label {
          font-size: 0.82rem;
          font-weight: 600;
          color: #111827;
          max-width: 130px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .countryDropdown__chevron {
          color: #6b7280;
          flex: 0 0 auto;
        }

        /* --- Menu --- */
        .countryDropdown__menu {
          min-width: 260px;
          max-height: 380px;
          overflow-y: auto;
          border-radius: 14px !important;
        }

        .countryDropdown__menuHeader {
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
        .countryDropdown__item {
          display: flex !important;
          align-items: center;
          gap: 10px;
          padding: 8px 10px !important;
          border-radius: 10px !important;
          white-space: normal;
        }
        .countryDropdown__item:hover,
        .countryDropdown__item:focus {
          background: #f4f5f8;
        }
        .countryDropdown__item.active {
          background: rgba(255, 193, 7, 0.15) !important;
          color: #111827 !important;
        }

        .countryDropdown__itemFlag {
          width: 26px;
          height: 26px;
          border-radius: 999px;
          overflow: hidden;
          flex: 0 0 auto;
          background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%);
          display: inline-flex;
          align-items: center;
          justify-content: center;
          box-shadow: inset 0 0 0 1px rgba(0, 0, 0, 0.06);
        }
        .countryDropdown__itemFlag img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }
        .countryDropdown__itemIso {
          font-size: 10px;
          font-weight: 700;
          color: #4b5563;
        }

        .countryDropdown__itemName {
          flex: 1 1 auto;
          min-width: 0;
          font-size: 0.88rem;
          font-weight: 500;
          color: #111827;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .countryDropdown__itemBadge {
          flex: 0 0 auto;
          font-size: 0.68rem;
          font-weight: 600;
          letter-spacing: 0.3px;
          color: #6b7280;
          background: rgba(0, 0, 0, 0.04);
          border-radius: 6px;
          padding: 2px 6px;
        }

        /* --- Mobile compact --- */
        @media (max-width: 991.98px) {
          .countryDropdown__toggle {
            height: 34px;
            padding: 3px 8px;
          }
        }
      `}</style>
    </Dropdown>
  )
}

export default CountryDropdown
