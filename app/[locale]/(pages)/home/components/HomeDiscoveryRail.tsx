'use client'

import Link from 'next/link'
import { useState } from 'react'

import type { SupportedLocale } from '@/lib/localization'

import styles from './HomeDiscoveryRail.module.css'

type Lane = {
  id: string
  ar: string
  en: string
  source: 'live' | 'demo'
  href?: string
  noteAr: string
  noteEn: string
}

const LANES: Lane[] = [
  { id: 'auctions', ar: 'المزادات', en: 'Auctions', source: 'live', href: '/pages/auction', noteAr: 'صفحة المزادات الحالية.', noteEn: 'The current auctions page.' },
  { id: 'stores', ar: 'المتاجر', en: 'Stores', source: 'live', href: '/stores', noteAr: 'دليل المتاجر الحالي.', noteEn: 'The current store directory.' },
  { id: 'search', ar: 'البحث', en: 'Search', source: 'live', href: '/search', noteAr: 'بحث الإعلانات الحقيقي.', noteEn: 'Real listing search.' },
  { id: 'video', ar: 'اكتشف بالفيديو', en: 'Video', source: 'demo', noteAr: 'لا مسار فيديو بعد. هذه بطاقة مختبر.', noteEn: 'No video route yet. This is a lab card.' },
  { id: 'live', ar: 'مباشر الآن', en: 'Live now', source: 'demo', noteAr: 'لا جلسات بيع مباشرة. الرقم ليس مشاهدين.', noteEn: 'No live selling sessions. This is not a viewer count.' },
  { id: 'hot', ar: 'عروض نار', en: 'Hot deals', source: 'demo', noteAr: 'لا درجة حرارة للعروض. ليست إعلانات حقيقية إضافية.', noteEn: 'No deal-heat score. These are not extra real listings.' },
  { id: 'near', ar: 'بالقرب منك', en: 'Nearby', source: 'demo', noteAr: 'لا إحداثيات إعلانات. القرب غير محسوب.', noteEn: 'Listings have no coordinates. Nearness is not calculated.' },
  { id: 'matches', ar: 'فرص لك', en: 'For you', source: 'demo', noteAr: 'لا مطابقة لحسابك. العينة ليست توصية.', noteEn: 'Nothing is matched to your account. The sample is not a recommendation.' },
  { id: 'following', ar: 'متابعاتك', en: 'Following', source: 'demo', noteAr: 'المتابعة غير مربوطة. لا قائمة بائعين.', noteEn: 'Follow is not connected. There is no seller list.' },
  { id: 'wanted', ar: 'مطلوب الآن', en: 'Wanted', source: 'demo', noteAr: 'نوع مطلوب غير موجود على الخادم.', noteEn: 'The server has no wanted listing type.' },
]

export default function HomeDiscoveryRail({ locale }: { locale: SupportedLocale }) {
  const ar = locale === 'ar'
  const [open, setOpen] = useState<string | null>(null)
  const active = LANES.find((lane) => lane.id === open) || null

  return (
    <section className={styles.rail} aria-label={ar ? 'اكتشف' : 'Discover'}>
      <div className={styles.head}>
        <h2 className={styles.headTitle}>{ar ? 'اكتشف' : 'Discover'}</h2>
        <span className={styles.headNote}>{ar ? 'الحي يفتح صفحة. التجريبي يشرح النقص.' : 'Live opens a page. Demo explains the gap.'}</span>
      </div>
      <div className={styles.row}>
        {LANES.map((lane) =>
          lane.href ? (
            <Link key={lane.id} href={`/${locale}${lane.href}`} className={styles.chip} data-source="live">
              {ar ? lane.ar : lane.en}
            </Link>
          ) : (
            <button
              key={lane.id}
              type="button"
              className={styles.chip}
              data-source="demo"
              aria-pressed={open === lane.id}
              onClick={() => setOpen((current) => (current === lane.id ? null : lane.id))}
            >
              {ar ? lane.ar : lane.en}
              <small>{ar ? 'تجريبي' : 'Demo'}</small>
            </button>
          ),
        )}
      </div>
      {active ? <p className={styles.note}>{ar ? active.noteAr : active.noteEn}</p> : null}
    </section>
  )
}
