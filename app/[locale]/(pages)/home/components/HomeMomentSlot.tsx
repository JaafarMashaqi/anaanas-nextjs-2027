'use client'

import Link from 'next/link'
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
  onOpenComposer,
}: {
  locale: SupportedLocale
  countryLabel: string
  onOpenComposer: () => void
}) {
  const ar = locale === 'ar'
  const { data: session } = useSession()
  const [hour, setHour] = useState<number | null>(null)
  const [index, setIndex] = useState(0)
  const [dismissed, setDismissed] = useState<string[]>([])
  const [paused, setPaused] = useState(false)
  const [storeNote, setStoreNote] = useState(false)

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
      action: ar ? 'أبيع' : 'Sell',
      composer: true,
      ms: 12000,
    }
    const coffee: Slide = {
      id: 'coffee',
      kind: 'coffee',
      title: ar ? 'قهوة ساخنة وفرص جديدة' : 'Hot coffee, then new chances',
      line: ar
        ? 'وبعدها نقتنص الفرص. لحظة من الواجهة، وليست شراكة ولا نقطة بيع.'
        : 'Then we go after the opportunities. An interface moment, not a partnership or a store pin.',
      action: ar ? 'أقرب نقطة' : 'Nearest cup',
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
      action: ar ? 'أبيع' : 'Sell',
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
      setStoreNote(false)
    }, slide.ms)
    return () => window.clearTimeout(timer)
  }, [paused, slide, visible.length])

  if (!slide) return null

  const dismiss = () => {
    if (slide.id === 'greet') return
    const next = [...dismissed, slide.id]
    setDismissed(next)
    setStoreNote(false)
    try {
      window.localStorage.setItem(DISMISS_KEY, JSON.stringify(next))
    } catch {
      /* preference stays for this view only */
    }
  }

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
        {storeNote ? (
          <p className={styles.note}>
            {ar
              ? 'أقرب نقطة بيع غير متاحة. لا توجد إحداثيات متاجر.'
              : 'The nearest store is unavailable. No store coordinates are connected.'}
          </p>
        ) : null}
      </div>
      <div className={styles.actions}>
        {slide.composer ? (
          <button type="button" className={styles.go} onClick={onOpenComposer}>
            {slide.action}
          </button>
        ) : (
          <Link className={styles.go} href={slide.href || `/${locale}/search`}>
            {slide.action}
          </Link>
        )}
        {slide.store ? (
          <button type="button" className={styles.quiet} onClick={() => setStoreNote((value) => !value)}>
            {ar ? 'أقرب نقطة' : 'Nearest store'}
          </button>
        ) : null}
        {slide.id !== 'greet' ? (
          <button type="button" className={styles.quiet} onClick={dismiss}>
            {ar ? 'إخفاء' : 'Hide'}
          </button>
        ) : null}
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
              onClick={() => {
                setIndex(itemIndex)
                setStoreNote(false)
              }}
            />
          ))}
        </div>
      ) : null}
    </section>
  )
}
