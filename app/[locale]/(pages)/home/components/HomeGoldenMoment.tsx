'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

import type { SupportedLocale } from '@/lib/localization'

import styles from './HomeGoldenMoment.module.css'

const KEY = 'ananas-golden-until'

export default function HomeGoldenMoment({
  locale,
  onSell,
}: {
  locale: SupportedLocale
  onSell: () => void
}) {
  const ar = locale === 'ar'
  void onSell
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    try {
      const until = Number(window.localStorage.getItem(KEY) || 0)
      setVisible(!Number.isFinite(until) || until < Date.now())
    } catch {
      setVisible(true)
    }
  }, [])

  if (!visible) return null

  const hide = () => {
    setVisible(false)
    try {
      window.localStorage.setItem(KEY, String(Date.now() + 24 * 60 * 60 * 1000))
    } catch {
      /* hidden for this view */
    }
  }

  return (
    <section className={styles.card} aria-label={ar ? 'فرصة السوق' : 'Market opportunity'}>
      <span className={styles.mark} aria-hidden />
      <div>
        <p className={styles.kicker}>{ar ? 'مثال' : 'Example'}</p>
        <h2 className={styles.title}>{ar ? 'طلب متزايد على سيارات تويوتا في عمّان' : 'Rising interest in Toyota cars in Amman'}</h2>
        <p className={styles.line}>{ar ? 'اكتشف الإعلانات المرتبطة، أو احفظ تنبيهاً على هذا الجهاز.' : 'Explore the related listings, or save an alert on this device.'}</p>
      </div>
      <div className={styles.actions}>
        <Link className={styles.go} href={`/${locale}/search?q=${encodeURIComponent('تويوتا')}`}>
          {ar ? 'استكشف' : 'Explore'}
        </Link>
        <button
          type="button"
          className={styles.quiet}
          onClick={() => {
            try {
              window.localStorage.setItem('ananas-alert-toyota', '1')
            } catch {
              /* this view only */
            }
            hide()
          }}
        >
          {ar ? 'نبهني' : 'Alert me'}
        </button>
        <button type="button" className={styles.quiet} onClick={hide}>
          {ar ? 'إخفاء' : 'Hide'}
        </button>
      </div>
    </section>
  )
}
