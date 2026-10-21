'use client'

import { useEffect, useMemo, useState } from 'react'
import { useSession } from 'next-auth/react'

import type { SupportedLocale } from '@/lib/localization'

import styles from './HomeMomentSlot.module.css'

type Slide = {
  id: 'greet' | 'coffee' | 'insight'
  kind: 'greeting' | 'coffee' | 'insight'
  title: string
  line: string
  action: string
  href?: string
  composer?: boolean
  store?: boolean
  ms: number
}

const DISMISS_KEY = 'ananas-moment-dismissed'

function readDismissed(): string[] {
  try {
    const raw = window.localStorage.getItem(DISMISS_KEY)
    const parsed = raw ? JSON.parse(raw) : []
    return Array.isArray(parsed) ? parsed.filter((item) => typeof item === 'string') : []
  } catch {
    return []
  }
}

export default function HomeMomentSlot({
  locale,
  countryLabel,
}: {
  locale: SupportedLocale
  countryLabel: string
  onOpenComposer?: () => void
}) {
  const ar = locale === 'ar'
  const { data: session } = useSession()
  const [hour, setHour] = useState<number | null>(null)
  const [index, setIndex] = useState(0)
  const [dismissed, setDismissed] = useState<string[]>([])
  const [paused, setPaused] = useState(false)

  useEffect(() => {
    const parts = new Intl.DateTimeFormat('en-GB', {
      timeZone: 'Asia/Amman',
      hour: 'numeric',
      hourCycle: 'h23',
    }).formatToParts(new Date())
    const marketHour = Number(parts.find((part) => part.type === 'hour')?.value)
    setHour(Number.isFinite(marketHour) ? marketHour : new Date().getHours())
    setDismissed(readDismissed())
  }, [])

  const name = session?.user?.name?.trim()
  const displayName = name && !name.includes('@') ? name : null
  const morning = hour != null && hour >= 5 && hour < 12
  const night = hour != null && (hour >= 17 || hour < 5)
  const hello =
    hour == null
      ? ar
        ? 'أهلاً'
        : 'Hello'
      : ar
        ? hour >= 5 && hour < 12
          ? 'صباح الخير'
          : hour >= 12 && hour < 17
            ? 'نهارك سعيد'
            : 'مساء الخير'
        : hour >= 5 && hour < 12
          ? 'Good morning'
          : hour >= 12 && hour < 17
            ? 'Good afternoon'
            : 'Good evening'

  const slides = useMemo<Slide[]>(() => {
    const greeting: Slide = {
      id: 'greet',
      kind: 'greeting',
      title: displayName ? `${hello}، ${displayName}` : hello,
      line: ar
        ? 'نتمنى أن تجد ما تبحث عنه أسرع مما تتوقع.'
        : 'We hope you find it sooner than you expect.',
      action: '',
      composer: true,
      ms: 12000,
    }
    const coffee: Slide = {
      id: 'coffee',
      kind: 'coffee',
      title: ar ? 'قهوة ساخنة وفرص جديدة' : 'Hot coffee, then new chances',
      line: ar
        ? 'صار بدها فنجان قهوة. لحظة من الواجهة، وليست شراكة مع العميد.'
        : 'Time for a cup. An interface moment, not a partnership.',
      action: '',
      store: true,
      ms: 8000,
    }
    const insight: Slide = {
      id: 'insight',
      kind: 'insight',
      title: ar ? 'السوق أمامك' : 'The market is here',
      line: ar
        ? `${countryLabel}. الأرقام الحية في النبض، والأرقام التجريبية موسومة.`
        : `${countryLabel}. Live figures are in the pulse. Demo figures are marked.`,
      action: '',
      composer: true,
      ms: 10000,
    }
    return [greeting, coffee, insight].filter((slide) => slide.id === 'greet' || !dismissed.includes(slide.id))
  }, [ar, countryLabel, dismissed, displayName, hello])

  const visible = slides
  const safeIndex = visible.length ? index % visible.length : 0
  const slide = visible[safeIndex]

  useEffect(() => {
    if (!slide || paused || visible.length < 2) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const timer = window.setTimeout(() => {
      const active = document.activeElement
      if (active instanceof HTMLInputElement || active instanceof HTMLTextAreaElement) return
      setIndex((value) => value + 1)
    }, slide.ms)
    return () => window.clearTimeout(timer)
  }, [paused, slide, visible.length])

  if (!slide) return null

  const kicker =
    slide.kind === 'greeting'
      ? ar
        ? 'تحية'
        : 'Greeting'
      : slide.kind === 'coffee'
        ? ar
          ? 'مختبر التجربة · ليست شراكة'
          : 'Experience lab · not a partnership'
        : ar
          ? 'بعد القهوة'
          : 'After coffee'

  return (
    <section
      className={styles.card}
      data-kind={slide.kind}
      aria-label={ar ? `تحية · ${countryLabel}` : `Greeting · ${countryLabel}`}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      {slide.kind === 'greeting' && (morning || night) ? (
      <span className={styles.sky} data-sky={night ? 'night' : 'day'} aria-hidden>
        {night ? (
          <svg viewBox="0 0 24 24" width="32" height="32">
            <path fill="currentColor" d="M14.5 2.4a8.8 8.8 0 1 0 7.1 12.2A8 8 0 0 1 14.5 2.4z" />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" width="32" height="32">
            <circle cx="12" cy="12" r="4" fill="currentColor" />
          </svg>
        )}
      </span>
      ) : null}
      {slide.kind === 'coffee' ? (
        <span className={styles.cup} aria-hidden>
          <span className={styles.steam} />
          <span className={styles.steam} />
          <span className={styles.cupBody} />
        </span>
      ) : null}
      <div className={styles.copy}>
        <p className={styles.kicker}>{kicker}</p>
        <h2>{slide.title}</h2>
        <p>{slide.line}</p>
      </div>
      {visible.length > 1 ? (
        <div className={styles.dots} role="tablist" aria-label={ar ? 'الشرائح' : 'Slides'}>
          {visible.map((item, itemIndex) => (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={itemIndex === safeIndex}
              className={itemIndex === safeIndex ? styles.dotOn : styles.dot}
              onClick={() => setIndex(itemIndex)}
            />
          ))}
        </div>
      ) : null}
    </section>
  )
}
