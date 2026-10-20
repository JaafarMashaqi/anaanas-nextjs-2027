'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { useSession } from 'next-auth/react'

import mascot from '@/assets/uiux/mascot_sitting.png'
import type { SupportedLocale } from '@/lib/localization'

import styles from './HomeMomentSlot.module.css'

type Slide = {
  id: string
  kind: 'greeting' | 'product' | 'concept'
  title: string
  line: string
  action: string
  href?: string
  composer?: boolean
  store?: boolean
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
    setHour(new Date().getHours())
    setDismissed(readDismissed())
  }, [])

  const name = session?.user?.name?.trim()
  const displayName = name && !name.includes('@') ? name : null
  const night = hour != null && (hour >= 18 || hour < 6)
  const hello =
    hour == null
      ? ar
        ? 'أهلاً'
        : 'Hello'
      : ar
        ? hour < 12
          ? 'صباح الخير'
          : hour < 17
            ? 'نهارك سعيد'
            : 'مساء الخير'
        : hour < 12
          ? 'Good morning'
          : hour < 17
            ? 'Good afternoon'
            : 'Good evening'

  const slides = useMemo<Slide[]>(() => {
    const greeting: Slide = {
      id: 'greet',
      kind: 'greeting',
      title: displayName ? `${hello}، ${displayName}` : hello,
      line: ar
        ? `أهلاً بك في أناناس · ${countryLabel}`
        : `Welcome back to ANANAS · ${countryLabel}`,
      action: ar ? 'أبيع' : 'Sell',
      composer: true,
    }
    const product: Slide = {
      id: 'tools',
      kind: 'product',
      title: ar ? 'أدوات جديدة على أناناس' : 'New tools on ANANAS',
      line: ar ? 'الإعلان الذكي موجود في هذه الصفحة. ليست حملة مدفوعة.' : 'The smart ad is on this page. This is not a paid campaign.',
      action: ar ? 'جرّبه' : 'Try it',
      composer: true,
    }
    const coffee: Slide = {
      id: 'coffee',
      kind: 'concept',
      title: ar ? 'بن العميد' : 'Al Ameed coffee',
      line: ar ? 'مفهوم صباحي. ليس شراكة، ولا نقطة بيع مربوطة.' : 'A morning concept. Not a partnership, and no store pin is connected.',
      action: ar ? 'ابحث عن قهوة' : 'Search coffee',
      href: `/${locale}/search?q=${encodeURIComponent(ar ? 'قهوة' : 'coffee')}`,
      store: true,
    }
    const car: Slide = {
      id: 'car',
      kind: 'concept',
      title: 'BYD SHARK',
      line: ar ? 'مفهوم سيارات. البحث يفتح إعلانات حقيقية، وليس وكيلاً.' : 'A car concept. Search opens real listings, not a dealer.',
      action: ar ? 'ابحث عن سيارات' : 'Search cars',
      href: `/${locale}/search?q=${encodeURIComponent(ar ? 'سيارات' : 'cars')}`,
    }
    const travel: Slide = {
      id: 'travel',
      kind: 'concept',
      title: ar ? 'الخطوط الجوية القطرية' : 'Qatar Airways',
      line: ar ? 'مفهوم سفر. لا حجز طيران مربوط.' : 'A travel concept. No flight booking is connected.',
      action: ar ? 'ابحث عن سفر' : 'Search travel',
      href: `/${locale}/search?q=${encodeURIComponent(ar ? 'سفر' : 'travel')}`,
    }
    return [greeting, product, coffee, car, travel]
  }, [ar, countryLabel, displayName, hello, locale])

  const visible = slides.filter((slide) => slide.id === 'greet' || !dismissed.includes(slide.id))
  const safeIndex = visible.length ? index % visible.length : 0
  const slide = visible[safeIndex]

  useEffect(() => {
    if (!slide || paused || visible.length < 2) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const timer = window.setInterval(() => {
      const active = document.activeElement
      if (active instanceof HTMLInputElement || active instanceof HTMLTextAreaElement) return
      setIndex((value) => value + 1)
      setStoreNote(false)
    }, 8000)
    return () => window.clearInterval(timer)
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
      : slide.kind === 'product'
        ? ar
          ? 'من المنتج'
          : 'Product'
        : ar
          ? 'مفهوم · ليست شراكة'
          : 'Concept · not a partnership'

  return (
    <section
      className={styles.card}
      aria-label={ar ? 'تحية وحملات' : 'Greeting and campaigns'}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <span className={styles.sky} data-sky={night ? 'night' : 'day'} aria-hidden>
        {night ? (
          <svg viewBox="0 0 24 24" width="22" height="22">
            <path fill="currentColor" d="M14.5 2.4a8.8 8.8 0 1 0 7.1 12.2A8 8 0 0 1 14.5 2.4z" />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" width="22" height="22">
            <circle cx="12" cy="12" r="4" fill="currentColor" />
          </svg>
        )}
      </span>
      <Image src={mascot} alt="" width={46} height={46} className={styles.mascot} />
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
