'use client'

import { useEffect, useRef, useState } from 'react'
import { useParams } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { BsBag, BsHeart, BsMegaphone } from 'react-icons/bs'

import { DEFAULT_LOCALE, isSupportedLocale } from '@/lib/localization'
import type { SupportedLocale } from '@/lib/localization'

import styles from './MobileDailyUpdatesBanner.module.css'

/**
 * The quick-action row below the banner is currently a preview that should
 * only be visible to the same internal account we use for the mobile AI
 * dashboard (`MOBILE_AI_PREVIEW_USER_ID` in `app/[locale]/(pages)/page.tsx`).
 * Keep the two IDs in sync.
 */
const MOBILE_AI_PREVIEW_USER_ID = '28775'

/**
 * Inline colorful dartboard-with-arrow used inside the "opportunities" pill.
 * Crafted as a hand-built SVG (rather than `react-icons`) so we can mix the
 * exact warm palette from the design: red rim → cream → gold core, pierced by
 * a blue arrow. Kept tiny (22×22) so it sits neatly inside the pill.
 */
const TargetArrowIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    width="22"
    height="22"
    aria-hidden
    focusable="false"
  >
    {/* Concentric rings */}
    <circle cx="11" cy="13" r="9" fill="#e63946" />
    <circle cx="11" cy="13" r="7" fill="#fff" />
    <circle cx="11" cy="13" r="5" fill="#e63946" />
    <circle cx="11" cy="13" r="3.2" fill="#fff" />
    <circle cx="11" cy="13" r="1.5" fill="#f1b302" />
    {/* Arrow shaft */}
    <line
      x1="4.5"
      y1="20"
      x2="14.5"
      y2="9.5"
      stroke="#1f6feb"
      strokeWidth="2"
      strokeLinecap="round"
    />
    {/* Arrow head */}
    <path
      d="M14 7.5 L17.5 7 L17 10.5 Z"
      fill="#1f6feb"
    />
    {/* Arrow fletching */}
    <path
      d="M3.6 21 L2 19.5 L4 19 Z"
      fill="#1f6feb"
    />
  </svg>
)

type Props = {
  locale?: SupportedLocale
  className?: string
}

const COPY: Record<
  SupportedLocale,
  { badge: string; message: string; aria: string; actions: { orders: string; favorites: string; opportunities: string } }
> = {
  ar: {
    badge: 'جديد',
    message: 'أدوات جديدة على أناناس — جرّب الإعلان الذكي الآن ✨',
    aria: 'تحديثات يومية',
    actions: {
      orders: 'طلباتي',
      favorites: 'المفضلة',
      opportunities: 'فرص مخصصة لك',
    },
  },
  en: {
    badge: 'New',
    message: 'New tools on ANANAS — try the smart ad now ✨',
    aria: 'Daily updates',
    actions: {
      orders: 'My orders',
      favorites: 'Favorites',
      opportunities: 'Opportunities for you',
    },
  },
}

/**
 * Mobile-only daily updates banner.
 *
 * Visually distinct from the desktop variant: a soft cream rounded pill that
 * lives just under the mobile header (which is two rows tall, so we account
 * for it via the `--mobile-header-offset` token consumed in CSS).
 *
 * The motion suite is intentionally lively but composable:
 *  1. `slideIn` — entrance from above with a spring-like overshoot.
 *  2. `shine`   — diagonal highlight sweeping across the card.
 *  3. `wiggle`  — the megaphone tilts every cycle.
 *  4. `sparkle` — floating dots & rings drift over the surface.
 *  5. `pulse`   — the "New" pill breathes with a soft glow.
 *  6. `shift`   — the background gradient slowly cycles.
 */
const MobileDailyUpdatesBanner = ({ locale: localeOverride, className = '' }: Props) => {
  const params = useParams<{ locale?: string }>()
  const { data: session } = useSession()
  const locale: SupportedLocale = (() => {
    if (localeOverride) return localeOverride
    const fromParams = Array.isArray(params?.locale) ? params.locale[0] : params?.locale
    return fromParams && isSupportedLocale(fromParams) ? fromParams : DEFAULT_LOCALE
  })()
  const t = COPY[locale]
  const messageRef = useRef<HTMLSpanElement>(null)
  const trackRef = useRef<HTMLSpanElement>(null)
  const [shouldScrollMessage, setShouldScrollMessage] = useState(false)

  useEffect(() => {
    const messageEl = messageRef.current
    const trackEl = trackRef.current
    if (!messageEl || !trackEl) return

    const syncTicker = () => {
      const primary = trackEl.querySelector('[data-ticker-copy="primary"]') as HTMLElement | null
      if (!primary) return

      const overflow = primary.scrollWidth > messageEl.clientWidth + 1
      setShouldScrollMessage(overflow)

      if (overflow) {
        const seconds = Math.max(10, Math.min(28, primary.scrollWidth / 28))
        trackEl.style.setProperty('--ticker-duration', `${seconds}s`)
      } else {
        trackEl.style.removeProperty('--ticker-duration')
      }
    }

    syncTicker()

    const resizeObserver = new ResizeObserver(syncTicker)
    resizeObserver.observe(messageEl)

    const fontsReady = typeof document !== 'undefined' ? document.fonts?.ready : undefined
    fontsReady?.then(syncTicker).catch(() => undefined)

    return () => resizeObserver.disconnect()
  }, [t.message])

  // Preview gate: actions row appears only for the internal preview user, same
  // as the mobile AI dashboard on the home page. Everyone else sees the banner
  // only.
  const showActions = session?.user?.id === MOBILE_AI_PREVIEW_USER_ID

  // Order is fixed in source (orders → favorites → opportunities); CSS handles
  // visual mirroring via flex direction so we honour the page direction
  // automatically in both AR (RTL) and EN (LTR).
  const orders = (
    <span className={`${styles.actionPill} ${styles.actionPill_a}`} role="button" aria-disabled="true" tabIndex={-1}>
      <BsBag className={styles.actionIcon} aria-hidden />
      <span className={styles.actionLabel}>{t.actions.orders}</span>
    </span>
  )

  const favorites = (
    <span className={`${styles.actionPill} ${styles.actionPill_b}`} role="button" aria-disabled="true" tabIndex={-1}>
      <BsHeart className={styles.actionIcon} aria-hidden />
      <span className={styles.actionLabel}>{t.actions.favorites}</span>
    </span>
  )

  const opportunities = (
    <span className={`${styles.actionPill} ${styles.actionPill_c}`} role="button" aria-disabled="true" tabIndex={-1}>
      <TargetArrowIcon className={`${styles.actionIcon} ${styles.actionIconTarget}`} />
      <span className={styles.actionLabel}>{t.actions.opportunities}</span>
    </span>
  )

  return (
    <section className={`${styles.root} ${className}`.trim()} aria-label={t.aria}>
      <div className={styles.banner} role="status" aria-live="polite">
        {/* Layered effects — pointer-events:none, decorative only */}
        <span className={styles.shine} aria-hidden />
        <span className={`${styles.spark} ${styles.sparkA}`} aria-hidden />
        <span className={`${styles.spark} ${styles.sparkB}`} aria-hidden />
        <span className={`${styles.spark} ${styles.sparkC}`} aria-hidden />
        <span className={`${styles.orbit} ${styles.orbitA}`} aria-hidden />
        <span className={`${styles.orbit} ${styles.orbitB}`} aria-hidden />

        <div className={styles.content}>
          <span className={styles.iconWrap} aria-hidden>
            <BsMegaphone className={styles.icon} />
            <span className={styles.iconHalo} aria-hidden />
          </span>

          <span
            ref={messageRef}
            className={`${styles.message} ${shouldScrollMessage ? styles.messageScroll : ''}`.trim()}
          >
            <span ref={trackRef} className={styles.messageTrack}>
              <span className={styles.messageInner} data-ticker-copy="primary">
                {t.message}
              </span>
              {shouldScrollMessage ? (
                <span className={styles.messageInner} aria-hidden data-ticker-copy="duplicate">
                  {t.message}
                </span>
              ) : null}
            </span>
          </span>

          <span className={styles.badge} aria-hidden>
            <span className={styles.badgeDot} />
            {t.badge}
          </span>
        </div>
      </div>

      {showActions ? (
        <div
          className={styles.actionsRow}
          role="group"
          aria-label={locale === 'ar' ? 'اختصارات سريعة' : 'Quick links'}
        >
          {orders}
          {favorites}
          {opportunities}
        </div>
      ) : null}
    </section>
  )
}

export default MobileDailyUpdatesBanner
