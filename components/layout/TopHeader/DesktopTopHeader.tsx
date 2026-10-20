'use client'

import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { AnimatePresence, motion } from 'motion/react'
import { useCallback, useEffect, useRef, useState, type FormEvent } from 'react'
import { BsChatLeftTextFill, BsSearch, BsXLg } from 'react-icons/bs'

import LogoBox from '@/components/LogoBox'
import NotificationsBell from './NotificationsBell'
import ProfileDropdown from './ProfileDropdown'
import StyledHeader from './StyledHeader'
import MobileSectionsDrawer from './MobileSectionsDrawer'
import CountryDropdown from './CountryDropdown'
import LocaleDropdown from './LocaleDropdown'
import BetaBadge from './BetaBadge'
import { DEFAULT_LOCALE, isSupportedLocale } from '@/lib/localization'
import type { SupportedLocale } from '@/lib/localization'
import { rememberSearch, SmartSearchPanel, useSearchDismiss, useSearchFieldToggle, useSmartSearchAssist } from '@/components/search/SmartSearchPanel'

const TopHeader = () => {
  const { status } = useSession()
  const params = useParams<{ locale?: string }>()
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false)
  const mobileInputRef = useRef<HTMLInputElement | null>(null)
  const desktopSearchRef = useRef<HTMLFormElement | null>(null)
  const popupSearchRef = useRef<HTMLDivElement | null>(null)

  const locale: SupportedLocale = (() => {
    const localeFromParams = Array.isArray(params?.locale) ? params.locale[0] : params?.locale
    if (localeFromParams && isSupportedLocale(localeFromParams)) {
      return localeFromParams
    }
    return DEFAULT_LOCALE
  })()

  const desktopAssist = useSmartSearchAssist(locale, query)
  const popupAssist = useSmartSearchAssist(locale, query)
  const desktopToggle = useSearchFieldToggle(desktopAssist.open, desktopAssist.setOpen)
  const popupToggle = useSearchFieldToggle(popupAssist.open, popupAssist.setOpen)
  useSearchDismiss(desktopAssist.open, desktopAssist.setOpen, desktopSearchRef, 'ananas-desktop-smart-search', false)
  useSearchDismiss(popupAssist.open, popupAssist.setOpen, popupSearchRef, 'ananas-popup-smart-search', false)
  useSearchDismiss(mobileSearchOpen, setMobileSearchOpen, popupSearchRef, 'topHeaderMobileSearch', true)

  const isArabic = locale === 'ar'
  const isAuthed = status === 'authenticated'

  const closeMobileSearch = useCallback(() => setMobileSearchOpen(false), [])

  const handleSearch = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const selected = desktopAssist.open ? desktopAssist.suggestions[desktopAssist.active] : undefined
    if (selected && selected.group !== 'query') {
      desktopAssist.choose(selected, closeMobileSearch)
      return
    }
    const trimmed = query.trim()
    if (trimmed) rememberSearch(trimmed)
    closeMobileSearch()
    desktopAssist.setOpen(false)
    router.push(
      trimmed ? `/${locale}/search?q=${encodeURIComponent(trimmed)}` : `/${locale}/search`,
    )
  }

  const searchPlaceholder = isArabic ? 'ابحث في المنشورات...' : 'Search listings...'
  const openSearchAria = isArabic ? 'فتح البحث' : 'Open search'
  const closeSearchAria = isArabic ? 'إغلاق البحث' : 'Close search'

  // Auto-focus the popup input when it opens, and lock the page from scrolling
  // beneath the overlay backdrop.
  useEffect(() => {
    if (!mobileSearchOpen) return
    const t = window.setTimeout(() => mobileInputRef.current?.focus(), 80)
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      window.clearTimeout(t)
      document.body.style.overflow = prevOverflow
    }
  }, [mobileSearchOpen])

  // ESC closes the popup.
  useEffect(() => {
    if (!mobileSearchOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeMobileSearch()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [mobileSearchOpen, closeMobileSearch])

  return (
    <StyledHeader>
      <div className="container topHeaderGrid">
        {/* ==================== START CLUSTER (brand + mobile drawer) ==================== */}
        <div className="topHeader__start">
          <MobileSectionsDrawer locale={locale} />
          <LogoBox />
          {/* <BetaBadge locale={locale} className="d-none d-sm-inline-flex" /> */}
        </div>
 
        {/* ==================== DESKTOP SEARCH (center) ==================== */}
        <form
          ref={desktopSearchRef}
          className="topHeader__search d-none d-lg-flex"
          role="search"
          onSubmit={handleSearch}
        >
          <div className="topHeader__searchField">
            <BsSearch className="topHeader__searchIcon" aria-hidden />
            <input
              className="form-control"
              type="search"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value)
                desktopAssist.setOpen(true)
              }}
              onMouseDown={desktopToggle.onMouseDown}
              onFocus={desktopToggle.onFocus}
              onClick={desktopToggle.onClick}
              onKeyDown={(event) => desktopAssist.onKeyDown(event, closeMobileSearch)}
              placeholder={isArabic ? 'ابحث في الأقسام والإعلانات' : 'Search sections and listings'}
              aria-label={searchPlaceholder}
              aria-expanded={desktopAssist.open}
              aria-controls="ananas-desktop-smart-search"
              aria-autocomplete="list"
              autoComplete="off"
            />
          </div>
        </form>
        <SmartSearchPanel
          locale={locale}
          open={desktopAssist.open}
          suggestions={desktopAssist.suggestions}
          active={desktopAssist.active}
          anchorRef={desktopSearchRef}
          listId="ananas-desktop-smart-search"
          onHover={desktopAssist.setActive}
          onPick={(suggestion) => desktopAssist.choose(suggestion, closeMobileSearch)}
        />

        {/* ==================== END CLUSTER (actions) ==================== */}
        <div className="topHeader__end">
          {/* Mobile search trigger — opens the popup search overlay */}
          <button
            type="button"
            className="topHeader__iconBtn d-lg-none"
            aria-label={openSearchAria}
            title={openSearchAria}
            aria-expanded={mobileSearchOpen}
            aria-controls="topHeaderMobileSearch"
            data-search-toggle="1"
            onClick={() => setMobileSearchOpen((open) => !open)}
          >
            <BsSearch size={15} />
          </button>

          {/* Country picker — full on desktop, compact on mobile */}
          <div className="d-none d-lg-inline-flex">
            <CountryDropdown locale={locale} />
          </div>
          <div className="d-lg-none">
            <CountryDropdown locale={locale} compact />
          </div>

          {/* Language picker — full on desktop, compact on mobile */}
          <div className="d-none d-lg-inline-flex">
            <LocaleDropdown />
          </div>
          <div className="d-lg-none">
            <LocaleDropdown compact />
          </div>

          {/* Messaging (desktop only) — Settings is accessible from the
              ProfileDropdown menu, so we no longer need a standalone icon. */}
          {isAuthed && (
            <Link
              className="topHeader__iconBtn d-none d-lg-inline-flex"
              href={`/${locale}/messaging`}
              aria-label={isArabic ? 'المراسلة' : 'Messaging'}
              title={isArabic ? 'المراسلة' : 'Messaging'}
            >
              <BsChatLeftTextFill size={15} />
            </Link>
          )}

          {/* Notifications */}
          {isAuthed && <NotificationsBell locale={locale} />}

          {/* Profile */}
          <ProfileDropdown locale={locale} />
        </div>

 
      </div>

      {/* ==================== MOBILE SEARCH POPUP (≤991.98px) ==================== */}
      <AnimatePresence>
        {mobileSearchOpen && (
          <motion.div
            key="mobileSearchOverlay"
            className="topHeader__mobileSearchOverlay d-lg-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            onClick={closeMobileSearch}
            aria-hidden
          />
        )}
        {mobileSearchOpen && (
          <motion.div
            key="mobileSearchPanel"
            id="topHeaderMobileSearch"
            className="topHeader__mobileSearchPanel d-lg-none"
            role="dialog"
            aria-modal="true"
            aria-label={searchPlaceholder}
            dir={isArabic ? 'rtl' : 'ltr'}
            initial={{ y: -24, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -24, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 380, damping: 32 }}
          >
            <form
              className="topHeader__mobileSearchForm"
              role="search"
              onSubmit={(event) => {
                event.preventDefault()
                const selected = popupAssist.open ? popupAssist.suggestions[popupAssist.active] : undefined
                if (selected && selected.group !== 'query') {
                  popupAssist.choose(selected, closeMobileSearch)
                  return
                }
                handleSearch(event)
              }}
            >
              <div ref={popupSearchRef} className="topHeader__searchField topHeader__searchField--popup">
                <BsSearch className="topHeader__searchIcon" aria-hidden />
                <input
                  ref={mobileInputRef}
                  className="form-control"
                  type="search"
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value)
                    popupAssist.setOpen(true)
                  }}
                  onMouseDown={popupToggle.onMouseDown}
                  onFocus={popupToggle.onFocus}
                  onClick={popupToggle.onClick}
                  onKeyDown={(event) => popupAssist.onKeyDown(event, closeMobileSearch)}
                  placeholder={isArabic ? 'ابحث في الأقسام والإعلانات' : 'Search sections and listings'}
                  aria-label={searchPlaceholder}
                  aria-expanded={popupAssist.open}
                  aria-controls="ananas-popup-smart-search"
                  aria-autocomplete="list"
                  autoComplete="off"
                />
              </div>
              <button
                type="button"
                className="topHeader__mobileSearchClose"
                aria-label={closeSearchAria}
                title={closeSearchAria}
                onClick={closeMobileSearch}
              >
                <BsXLg size={14} />
              </button>
            </form>
            <SmartSearchPanel
              locale={locale}
              open={mobileSearchOpen && popupAssist.open}
              suggestions={popupAssist.suggestions}
              active={popupAssist.active}
              anchorRef={popupSearchRef}
              listId="ananas-popup-smart-search"
              onHover={popupAssist.setActive}
              onPick={(suggestion) => popupAssist.choose(suggestion, closeMobileSearch)}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <style jsx global>{`
        /* ----- Header wrapper polish ----- */
        .topNav {
          padding-top: 0.45rem;
          padding-bottom: 0.45rem;
        }

        .topNav .container.topHeaderGrid {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          flex-wrap: wrap;
          row-gap: 8px;
        }

        /* ----- Start cluster (brand + mobile drawer) ----- */
        .topHeader__start {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          flex: 0 0 auto;
          min-width: 0;
        }

        .topHeader__start .navbar-brand {
          margin: 0;
          padding: 0;
          display: inline-flex;
          align-items: center;
        }

        /* Logo sizing per breakpoint */
        .topNav .navbar-brand-item {
          object-fit: contain;
          width: auto;
          height: 45px;
        }

        /* ----- End cluster (actions) ----- */
        .topHeader__end {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          flex: 0 0 auto;
          margin-inline-start: auto; /* pushes to logical end in LTR & RTL */
        }

        /* ----- Search (desktop, centered between start and end) ----- */
        .topHeader__search {
          flex: 1 1 320px;
          min-width: 240px;
          max-width: 540px;
          margin-inline: auto;
        }

        .topHeader__searchField {
          position: relative;
          width: 100%;
        }

        .topHeader__searchField .form-control {
      background: #f4ece4; border: 1px solid #3737378a;
          border-radius: 999px;
          padding-inline: 44px 16px; /* start for icon, end for text */
          height: 40px;
          font-size: 0.9rem;
          transition: background-color 0.18s ease, border-color 0.18s ease,
            box-shadow 0.18s ease;
        }

        .topHeader__searchField .form-control:focus {
          background: #fff;
          border-color: rgba(255, 193, 7, 0.4);
          box-shadow: 0 0 0 4px rgba(255, 193, 7, 0.12);
          outline: none;
        }

        .topHeader__searchIcon {
          position: absolute;
          inset-inline-start: 16px;
          top: 50%;
          transform: translateY(-50%);
          color: #6b7280;
          font-size: 14px;
          pointer-events: none;
        }

        /* ----- Mobile search popup (overlay + panel) ----- */
        .topHeader__mobileSearchOverlay {
          position: fixed;
          inset: 0;
          background: rgba(15, 23, 42, 0.42);
          backdrop-filter: blur(6px);
          -webkit-backdrop-filter: blur(6px);
          z-index: 1040;
        }

        .topHeader__mobileSearchPanel {
          position: fixed;
          top: 0;
          inset-inline-start: 0;
          inset-inline-end: 0;
          z-index: 1050;
          background: linear-gradient(
            180deg,
            #ffffff 0%,
            #ffffff 88%,
            rgba(255, 255, 255, 0.92) 100%
          );
          padding: 14px 16px 18px;
          border-bottom: 1px solid rgba(15, 23, 42, 0.06);
          box-shadow: 0 18px 48px -22px rgba(15, 23, 42, 0.35);
          /* Soft accent bar at the bottom for a polished, modern feel */
        }
        .topHeader__mobileSearchPanel::after {
          content: '';
          position: absolute;
          left: 16px;
          right: 16px;
          bottom: 0;
          height: 2px;
          border-radius: 999px;
          background: linear-gradient(
            90deg,
            rgba(255, 193, 7, 0) 0%,
            rgba(255, 193, 7, 0.55) 30%,
            rgba(118, 75, 162, 0.5) 70%,
            rgba(118, 75, 162, 0) 100%
          );
        }

        .topHeader__mobileSearchForm {
          display: flex;
          align-items: center;
          gap: 8px;
          width: 100%;
        }

        /* Popup variant of the search field — slightly larger & more rounded
           so it feels distinct from the desktop pill input. */
        .topHeader__searchField--popup {
          flex: 1 1 auto;
          min-width: 0;
        }

        .topHeader__searchField--popup .form-control {
          background: #f4f5f8;
          border: 1px solid transparent;
          border-radius: 14px;
          height: 44px;
          font-size: 0.95rem;
          padding-inline: 44px 16px;
          transition: background-color 0.18s ease, border-color 0.18s ease,
            box-shadow 0.18s ease;
        }

        .topHeader__searchField--popup .form-control:focus {
          background: #ffffff;
          border-color: rgba(255, 193, 7, 0.45);
          box-shadow: 0 0 0 4px rgba(255, 193, 7, 0.14);
          outline: none;
        }

        .topHeader__searchField--popup .topHeader__searchIcon {
          inset-inline-start: 16px;
          font-size: 15px;
        }

        .topHeader__mobileSearchClose {
          flex: 0 0 auto;
          width: 40px;
          height: 40px;
          border-radius: 12px;
          border: 0;
          background: rgba(15, 23, 42, 0.06);
          color: #475569;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: background-color 0.18s ease, color 0.18s ease,
            transform 0.18s ease;
        }
        .topHeader__mobileSearchClose:hover {
          background: rgba(15, 23, 42, 0.1);
          color: #0f172a;
          transform: rotate(90deg);
        }
        .topHeader__mobileSearchClose:focus-visible {
          outline: 2px solid rgba(255, 193, 7, 0.55);
          outline-offset: 2px;
        }

        /* ----- Generic icon button (used for chat/settings/etc) ----- */
        .topHeader__iconBtn {
          width: 38px;
          height: 38px;
          border-radius: 999px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          background: #f4f5f8;
          color: #374151;
          text-decoration: none;
          border: 0;
          transition: background-color 0.18s ease, color 0.18s ease,
            transform 0.18s ease;
        }
        .topHeader__iconBtn:hover {
          background: #eceef2;
          color: #111827;
          transform: translateY(-1px);
        }
        .topHeader__iconBtn:focus-visible {
          outline: 2px solid rgba(255, 193, 7, 0.55);
          outline-offset: 2px;
        }

        /* Bell + Profile dropdown toggles should share the same size as iconBtn */
        .topHeader__end .nav-link.icon-md,
        .topHeader__end .dropdown-toggle.icon-md {
          width: 38px;
          height: 38px;
          border-radius: 999px;
          background: #f4f5f8;
        }

        /* Neutralise legacy Bootstrap margin utilities inside the end cluster
           so the flex gap controls spacing consistently in LTR & RTL. */
        .topHeader__end .nav-item,
        .topHeader__end > * {
          margin: 0 !important;
        }

        /* Country dropdown: remove default chevron arrow */
        .countryDropdown .dropdown-toggle::after {
          display: none;
        }

        /* Dropdown menus — ensure they float (not inline) and don't overflow viewport */
        .topHeader__end .dropdown-menu,
        .countryDropdown .dropdown-menu {
          border-radius: 14px;
          border: 1px solid rgba(0, 0, 0, 0.06);
          box-shadow: 0 12px 40px rgba(0, 0, 0, 0.1);
          margin-top: 6px;
        }

        /* ----- Mobile ≤ 991px: shrink brand, hide beta text becomes visible from ≥576px ----- */
        @media (max-width: 991.98px) {
          .topNav {
            padding-top: 0.35rem;
            padding-bottom: 0.35rem;
          }
          .topNav .navbar-brand-item {
          }
          .topHeader__end {
            gap: 0.3rem;
          }
          .topHeader__iconBtn,
          .topHeader__end .nav-link.icon-md,
          .topHeader__end .dropdown-toggle.icon-md {
            width: 36px;
            height: 36px;
          }
        }

        /* ----- Extra-small phones ----- */
        @media (max-width: 420px) {
          .topNav .container.topHeaderGrid {
            gap: 0.4rem;
          }
          .topNav .navbar-brand-item {
          }
        }
      `}</style>
    </StyledHeader>
  )
}

export default TopHeader
