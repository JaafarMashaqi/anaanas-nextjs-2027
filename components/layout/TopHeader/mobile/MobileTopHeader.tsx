'use client'

import { useEffect, useRef, useState } from 'react'
import { useParams } from 'next/navigation'
import { useSession } from 'next-auth/react'
import clsx from 'clsx'

import LogoBox from '@/components/LogoBox'
import { DEFAULT_LOCALE, isSupportedLocale } from '@/lib/localization'
import type { SupportedLocale } from '@/lib/localization'

import CountryDropdown from '../CountryDropdown'
import LocaleDropdown from '../LocaleDropdown'
import MobileSectionsDrawer from '../MobileSectionsDrawer'
import StyledHeader from '../StyledHeader'

import MobileNotificationsButton from './MobileNotificationsButton'
import MobileMessagesButton from './MobileMessagesButton'
import MobileProfileButton from './MobileProfileButton'
import MobileHeaderSearchBar from './MobileHeaderSearchBar'
import MobileLoginButton from './MobileLoginButton'

import styles from './MobileTopHeader.module.css'
import BetaBadge from '../BetaBadge'

/**
 * Mobile counterpart of `../DesktopTopHeader.tsx`.
 *
 * Reuses the same wrapper (`StyledHeader`) so the fixed-top behaviour and
 * route-aware transparent/solid background logic are identical. Internally it
 * composes mobile-specific affordances:
 *
 *  - Logical-start: hamburger (MobileSectionsDrawer) plus auth-aware actions
 *    (notifications and messages when signed-in, login when not).
 *  - Centre: brand logo via LogoBox.
 *  - Logical-end: CountryDropdown replacing the static location pill.
 *  - Below: the search bar.
 *
 * The desktop tree (`../DesktopTopHeader.tsx`) is unchanged; this component
 * is used from ResponsiveTopHeader only when the viewport is below the lg breakpoint.
 *
 * Search row: after scrolling down past ~100px, the row collapses with a smooth
 * animation; cumulative scroll-up of ~40px reveals it again (same slot in the header).
 */
const SCROLL_Y_HIDE_AFTER = 100
const SCROLL_UP_REVEAL_ACCUM_PX = 40

const MobileTopHeader = () => {
  const { status } = useSession()
  const params = useParams<{ locale?: string }>()
  const [searchCollapsed, setSearchCollapsed] = useState(false)
  const lastScrollY = useRef(0)
  const scrollUpAccum = useRef(0)

  useEffect(() => {
    lastScrollY.current = window.scrollY
    if (window.scrollY > SCROLL_Y_HIDE_AFTER) {
      setSearchCollapsed(true)
    }

    const onScroll = () => {
      const y = window.scrollY
      const dy = y - lastScrollY.current
      lastScrollY.current = y

      if (y <= SCROLL_Y_HIDE_AFTER) {
        scrollUpAccum.current = 0
        setSearchCollapsed(false)
        return
      }

      if (dy > 2) {
        scrollUpAccum.current = 0
        setSearchCollapsed(true)
      } else if (dy < -2) {
        scrollUpAccum.current += -dy
        if (scrollUpAccum.current >= SCROLL_UP_REVEAL_ACCUM_PX) {
          setSearchCollapsed(false)
          scrollUpAccum.current = 0
        }
      }
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const locale: SupportedLocale = (() => {
    const fromParams = Array.isArray(params?.locale) ? params.locale[0] : params?.locale
    if (fromParams && isSupportedLocale(fromParams)) return fromParams
    return DEFAULT_LOCALE
  })()

  const isAuthed = status === 'authenticated'
  // We render the login button by default (when unauthenticated OR while the
  // session is still resolving) so the visitor never sees an empty action
  // cluster on first paint. If the session later flips to `authenticated`,
  // we swap to the bell/chat trio. The brief swap is preferred over a
  // missing button for the very common signed-out case.

  return (
    <StyledHeader>
      <div
        className={clsx('container-fluid', styles.shell, searchCollapsed && styles.shellSearchCollapsed)}
      >
        <div className={styles.row}>
          {/* logical-start cluster — hamburger + auth-aware actions */}
          <div className={styles.start}>
            <div className={styles.hamburgerSlot}>
              <MobileSectionsDrawer locale={locale} />

            </div>
            {isAuthed ? (
              <>
                <MobileNotificationsButton locale={locale} />
                <MobileMessagesButton locale={locale} />
                <MobileProfileButton locale={locale} />
              </>
            ) : (
              <MobileLoginButton locale={locale} />
            )}
          </div>

          {/* centre brand */}
          <div className={styles.brand}>
            <LogoBox />
          </div>

          {/* logical-end cluster — language switcher + country picker */}
          <div className={styles.end}>
            <LocaleDropdown compact />
            <CountryDropdown locale={locale} compact />
          </div>
        </div>
        {/* <BetaBadge locale={locale} className=" d-inline-flex m-auto" /> */}

        <div
          className={clsx(styles.searchRow, searchCollapsed && styles.searchRowCollapsed)}
          aria-hidden={searchCollapsed}
        >
          <div className={styles.searchRowInner}>
            <MobileHeaderSearchBar locale={locale} />
          </div>
        </div>
      </div>
    </StyledHeader>
  )
}

export default MobileTopHeader
