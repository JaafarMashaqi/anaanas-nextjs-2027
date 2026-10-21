'use client'

import Link from 'next/link'
import { useCallback, useEffect, useRef, useState } from 'react'
import { motion } from 'motion/react'
import { BsBell } from 'react-icons/bs'

import type { SupportedLocale } from '@/lib/localization'
import { t } from '@/lib/translations'

import styles from './MobileNotificationsButton.module.css'

type Props = {
  locale: SupportedLocale
}

/**
 * Mobile-styled notifications trigger.
 *
 * Reuses the exact data-flow used by the desktop {@link ./NotificationsBell}
 * (polling `/api/notifications`, tracking the unread count) but renders just a
 * flat outline icon + numeric badge as in the mobile mock. Tapping it routes
 * to the full notifications page — a more natural fit for small screens than
 * the desktop's floating dropdown.
 */
const POLL_MS = 15_000
const PER_PAGE = 1

const MobileNotificationsButton = ({ locale }: Props) => {
  const [unread, setUnread] = useState(0)
  const previousUnreadRef = useRef(0)
  const [shake, setShake] = useState(false)

  const load = useCallback(async () => {
    try {
      const res = await fetch(`/api/notifications?per_page=${PER_PAGE}&land=${locale}`, {
        method: 'GET',
        headers: { Accept: 'application/json' },
        cache: 'no-store',
      })
      const json = await res.json().catch(() => ({}))
      if (json?.success) {
        const nextUnread = Number(json.unread_count ?? 0)
        if (nextUnread > previousUnreadRef.current) {
          setShake(true)
          window.setTimeout(() => setShake(false), 900)
        }
        previousUnreadRef.current = nextUnread
        setUnread(nextUnread)
      }
    } catch {
      /* polling will retry */
    }
  }, [locale])

  useEffect(() => {
    void load()
    const id = window.setInterval(() => void load(), POLL_MS)
    return () => window.clearInterval(id)
  }, [load])

  const ariaOpen = t('notifications.openBell', locale)

  return (
    <Link
      href={`/${locale}/notifications`}
      className={unread > 0 ? `${styles.btn} ${styles.btnLive}` : styles.btn}
      aria-label={ariaOpen}
      title={ariaOpen}
    >
      <motion.span
        className={styles.iconWrap}
        animate={shake ? { rotate: [0, -16, 14, -10, 8, -4, 0] } : { rotate: 0 }}
        transition={{ duration: 0.85, ease: 'easeInOut' }}
      >
        <BsBell aria-hidden />
      </motion.span>

      {unread > 0 && (
        <span className={styles.badge} aria-label={`${unread}`}>
          {unread > 99 ? '99+' : unread}
        </span>
      )}
    </Link>
  )
}

export default MobileNotificationsButton
