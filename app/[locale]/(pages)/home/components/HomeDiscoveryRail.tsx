'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useState } from 'react'

import type { SupportedLocale } from '@/lib/localization'

import styles from './HomeDiscoveryRail.module.css'

type Lane = {
  id: string
  ar: string
  en: string
  kind: 'feed' | 'route' | 'demo'
  href?: string
  noteAr: string
  noteEn: string
}

const LANES: Lane[] = [
  { id: 'latest', ar: 'الأحدث', en: 'Latest', kind: 'feed', noteAr: 'يعرض أحدث الإعلانات الحقيقية.', noteEn: 'Shows the real latest listings.' },
  { id: 'photos', ar: 'ترند بالصور', en: 'Trending photos', kind: 'feed', noteAr: 'يبقي الإعلانات التي لها صور.', noteEn: 'Keeps listings that have photos.' },
  { id: 'price', ar: 'السعر', en: 'Price', kind: 'feed', noteAr: 'يرتّب الإعلانات الحقيقية حسب السعر.', noteEn: 'Sorts real listings by price.' },
  { id: 'auctions', ar: 'المزادات', en: 'Auctions', kind: 'route', href: '/pages/auction', noteAr: 'يفتح المزادات الحالية.', noteEn: 'Opens the current auctions.' },
  { id: 'stores', ar: 'المتاجر', en: 'Stores', kind: 'route', href: '/stores', noteAr: 'يفتح دليل المتاجر.', noteEn: 'Opens the store directory.' },
  { id: 'live', ar: 'مباشر', en: 'Live', kind: 'demo', noteAr: 'لا جلسات بيع. لا يوجد بث لعرضه.', noteEn: 'No selling sessions. There is no broadcast to show.' },
  { id: 'hot', ar: 'عروض نار', en: 'Hot deals', kind: 'demo', noteAr: 'لا درجة للعروض. لن نختلق إعلانات.', noteEn: 'No deal score. Listings are not invented.' },
  { id: 'nearby', ar: 'بالقرب', en: 'Nearby', kind: 'demo', noteAr: 'لا إحداثيات. القرب غير محسوب.', noteEn: 'No coordinates. Nearness is not calculated.' },
  { id: 'foryou', ar: 'لك', en: 'For you', kind: 'demo', noteAr: 'لا مطابقة لحسابك.', noteEn: 'Nothing is matched to your account.' },
  { id: 'following', ar: 'متابعات', en: 'Following', kind: 'demo', noteAr: 'متابعة الأشخاص غير مربوطة.', noteEn: 'Following people is not connected.' },
  { id: 'video', ar: 'فيديو', en: 'Video', kind: 'demo', noteAr: 'لا مسار فيديو بعد.', noteEn: 'No video route yet.' },
]

export default function HomeDiscoveryRail({ locale }: { locale: SupportedLocale }) {
  const ar = locale === 'ar'
  const router = useRouter()
  const params = useSearchParams()
  const view = params.get('view') || 'latest'
  const [demo, setDemo] = useState<string | null>(null)
  const active = LANES.find((lane) => lane.id === demo) || null

  const choose = (lane: Lane) => {
    if (lane.kind === 'route' && lane.href) {
      router.push(`/${locale}${lane.href}`)
      return
    }
    if (lane.kind === 'feed') {
      setDemo(null)
      const next = new URLSearchParams(params.toString())
      next.delete('page')
      if (lane.id === 'latest') next.delete('view')
      else next.set('view', lane.id)
      const query = next.toString()
      router.push(query ? `/${locale}?${query}` : `/${locale}`, { scroll: false })
      return
    }
    setDemo((current) => (current === lane.id ? null : lane.id))
  }

  return (
    <section className={styles.rail} aria-label={ar ? 'اكتشف' : 'Discover'}>
      <div className={styles.head}>
        <h2 className={styles.headTitle}>{ar ? 'اكتشف' : 'Discover'}</h2>
        <span className={styles.headNote}>{ar ? 'الأحدث والصور والسعر يغيّران القائمة' : 'Latest, photos, and price change the list'}</span>
      </div>
      <div className={styles.row} role="tablist">
        {LANES.map((lane) => {
          const pressed = lane.kind === 'feed' ? view === lane.id || (lane.id === 'latest' && view === 'latest') : demo === lane.id
          return (
            <button
              key={lane.id}
              type="button"
              role="tab"
              aria-selected={pressed}
              className={pressed ? styles.chipOn : styles.chip}
              data-source={lane.kind}
              onClick={() => choose(lane)}
            >
              {ar ? lane.ar : lane.en}
            </button>
          )
        })}
      </div>
      {active ? <p className={styles.note}>{ar ? active.noteAr : active.noteEn}</p> : null}
    </section>
  )
}
