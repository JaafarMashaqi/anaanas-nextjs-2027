'use client'

import { useEffect, useState } from 'react'

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
    <section className={styles.card} aria-label={ar ? 'لحظة فرصة' : 'Opportunity moment'}>
      <span className={styles.coin} aria-hidden />
      <div>
        <p className={styles.kicker}>{ar ? 'مختبر التجربة · ليس طلباً حقيقياً' : 'Experience lab · not real demand'}</p>
        <h2 className={styles.title}>{ar ? 'فرصة بيع حارة' : 'A hot selling moment'}</h2>
        <p className={styles.line}>{ar ? '١٩ مشترياً في العينة يبحثون عن منتج مشابه. لا يوجد تطابق مع إعلانك.' : '19 sample buyers want something similar. Nothing is matched to your listing.'}</p>
      </div>
      <div className={styles.actions}>
        <button type="button" className={styles.go} onClick={onSell}>
          {ar ? 'أبيع' : 'Sell'}
        </button>
        <button type="button" className={styles.quiet} onClick={hide}>
          {ar ? 'ليس الآن' : 'Not now'}
        </button>
      </div>
    </section>
  )
}
