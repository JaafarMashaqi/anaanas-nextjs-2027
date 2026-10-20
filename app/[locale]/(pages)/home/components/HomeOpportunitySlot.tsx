'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'

import type { TrendingPostItem } from '@/lib/api/homeInsights'
import type { SupportedLocale } from '@/lib/localization'
import { plainListingText } from '@/lib/text/plainListingText'

import styles from './HomeOpportunitySlot.module.css'

const FEEDBACK_KEY = 'ananas-opportunity-feedback'

type Feedback = 'in' | 'out'

function readFeedback(): Record<string, Feedback> {
  try {
    const raw = window.localStorage.getItem(FEEDBACK_KEY)
    const parsed = raw ? JSON.parse(raw) : {}
    return parsed && typeof parsed === 'object' ? parsed : {}
  } catch {
    return {}
  }
}

export default function HomeOpportunitySlot({
  locale,
  trending,
}: {
  locale: SupportedLocale
  trending: TrendingPostItem[]
}) {
  const ar = locale === 'ar'
  const [index, setIndex] = useState(0)
  const [feedback, setFeedback] = useState<Record<string, Feedback>>({})
  const [why, setWhy] = useState(false)
  const [notice, setNotice] = useState<string | null>(null)
  const events = trending.filter((item) => item.post_id && item.title)
  const hidden = events.filter((item) => feedback[`trend-${item.post_id}`] === 'out')
  const visible = events.filter((item) => feedback[`trend-${item.post_id}`] !== 'out')
  const item = visible.length ? visible[index % visible.length] : null

  useEffect(() => {
    setFeedback(readFeedback())
  }, [])

  useEffect(() => {
    if (!item || visible.length < 2) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const timer = window.setInterval(() => {
      const active = document.activeElement
      if (active instanceof HTMLInputElement || active instanceof HTMLTextAreaElement) return
      setIndex((value) => value + 1)
      setWhy(false)
      setNotice(null)
    }, 9000)
    return () => window.clearInterval(timer)
  }, [item, visible.length])

  const save = (id: string, value: Feedback) => {
    const next = { ...feedback, [id]: value }
    setFeedback(next)
    try {
      window.localStorage.setItem(FEEDBACK_KEY, JSON.stringify(next))
    } catch {
      /* this view only */
    }
  }

  return (
    <section className={styles.card} aria-label={ar ? 'عنوان رائج' : 'Trending title'}>
      <div className={styles.head}>
        <span className={styles.dot} aria-hidden />
        <h2>{ar ? 'عنوان رائج' : 'Trending title'}</h2>
        <span>{ar ? 'من الخادم · ليس تقديراً' : 'From the server · not an estimate'}</span>
      </div>
      {!item ? (
        <p className={styles.empty}>
          {events.length === 0
            ? ar
              ? 'لا توجد فرصة مؤكدة من الخادم الآن.'
              : 'The server has no confirmed opportunity right now.'
            : ar
              ? 'أخفيت الفرص الظاهرة على هذا الجهاز. لا يوجد نموذج يتعلم من ذلك.'
              : 'You hid the visible opportunities on this device. No model learns from that.'}
        </p>
      ) : (
        <>
          <p className={styles.kicker}>{ar ? 'مقاس · عنوان رائج' : 'Measured · trending title'}</p>
          <Link href={`/${locale}/post/${item.post_id}`} className={styles.title}>
            {plainListingText(item.title)}
          </Link>
          <p className={styles.meta}>{item.section_name ? plainListingText(item.section_name) : ar ? 'من قائمة الرائج' : 'From the trending list'}</p>
          {why ? (
            <p className={styles.why}>
              {ar
                ? 'ظهر لأن الخادم أعاد هذا العنوان ضمن الإعلانات الرائجة. ليس بحثك السابق، وليس توقعاً.'
                : 'It appeared because the server returned this title in the trending list. It is not your past search, and it is not a forecast.'}
            </p>
          ) : null}
          {notice ? <p className={styles.why}>{notice}</p> : null}
          <div className={styles.actions}>
            <Link href={`/${locale}/post/${item.post_id}`}>{ar ? 'شاهد الإعلان' : 'View listing'}</Link>
            <button
              type="button"
              onClick={() => {
                save(`trend-${item.post_id}`, 'in')
                setNotice(
                  ar
                    ? 'حُفظ «يهمني» على هذا الجهاز فقط. لم يُدرَّب نموذج.'
                    : '“Interested” is saved on this device only. No model was trained.',
                )
              }}
            >
              {ar ? 'يهمني' : 'Interested'}
            </button>
            <button
              type="button"
              onClick={() => {
                save(`trend-${item.post_id}`, 'out')
                setWhy(false)
                setNotice(null)
                setIndex(0)
              }}
            >
              {ar ? 'لا يهمني' : 'Not interested'}
            </button>
            <button
              type="button"
              onClick={() =>
                setNotice(
                  ar
                    ? 'لا يوجد اشتراك تنبيه في الخادم.'
                    : 'The server has no alert subscription.',
                )
              }
            >
              {ar ? 'نبهني' : 'Alert me'}
            </button>
            <button type="button" onClick={() => setWhy((value) => !value)}>
              {ar ? 'لماذا ظهر لي؟' : 'Why this?'}
            </button>
          </div>
        </>
      )}
      {hidden.length && events.length ? (
        <button
          type="button"
          className={styles.reset}
          onClick={() => {
            setFeedback({})
            setIndex(0)
            try {
              window.localStorage.removeItem(FEEDBACK_KEY)
            } catch {
              /* ignore */
            }
          }}
        >
          {ar ? 'إظهار ما أخفيته' : 'Show what you hid'}
        </button>
      ) : null}
    </section>
  )
}
