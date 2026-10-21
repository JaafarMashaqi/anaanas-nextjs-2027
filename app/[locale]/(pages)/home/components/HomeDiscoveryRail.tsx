'use client'

import { BsBag, BsBroadcast, BsCameraVideo, BsFire, BsGeoAlt, BsHammer, BsHeart, BsPeople, BsSearch, BsShop, BsStars, BsTag } from 'react-icons/bs'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useState, type ComponentType } from 'react'

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
  icon: ComponentType<{ 'aria-hidden'?: boolean }>
}

const LANES: Lane[] = [
  { id: 'all', ar: 'الكل', en: 'All', kind: 'feed', icon: BsTag, noteAr: 'يعرض كل الإعلانات الحالية.', noteEn: 'Shows the current listings.' },
  { id: 'latest', ar: 'الأحدث', en: 'Latest', kind: 'feed', icon: BsStars, noteAr: 'يعرض أحدث الإعلانات الحقيقية.', noteEn: 'Shows the real latest listings.' },
  { id: 'live', ar: 'مباشر الآن', en: 'Live now', kind: 'demo', icon: BsBroadcast, noteAr: 'لا بث متصل. هذه علامة واجهة فقط.', noteEn: 'No broadcast is connected. This is an interface mark only.' },
  { id: 'photos', ar: 'Trending', en: 'Trending', kind: 'feed', icon: BsFire, noteAr: 'يبقي الإعلانات التي لها صور.', noteEn: 'Keeps listings that have photos.' },
  { id: 'auctions', ar: 'المزادات', en: 'Auctions', kind: 'route', href: '/pages/auction', icon: BsHammer, noteAr: 'يفتح المزادات الحالية.', noteEn: 'Opens the current auctions.' },
  { id: 'hot', ar: 'عروض نار', en: 'Hot deals', kind: 'demo', icon: BsFire, noteAr: 'لا درجة للعروض. لن نختلق إعلانات.', noteEn: 'No deal score. Listings are not invented.' },
  { id: 'nearby', ar: 'بالقرب منك', en: 'Nearby', kind: 'demo', icon: BsGeoAlt, noteAr: 'لا إحداثيات. القرب غير محسوب.', noteEn: 'No coordinates. Nearness is not calculated.' },
  { id: 'foryou', ar: 'فرص لك', en: 'For you', kind: 'demo', icon: BsStars, noteAr: 'لا مطابقة لحسابك.', noteEn: 'Nothing is matched to your account.' },
  { id: 'wanted', ar: 'مطلوب الآن', en: 'Wanted', kind: 'demo', icon: BsSearch, noteAr: 'طلبات الشراء لا تُنشر من هذا التبويب.', noteEn: 'Buyer requests are not published from this tab.' },
  { id: 'following', ar: 'المتابعات', en: 'Following', kind: 'demo', icon: BsPeople, noteAr: 'متابعة الأشخاص غير مربوطة.', noteEn: 'Following people is not connected.' },
  { id: 'saved', ar: 'المفضلة', en: 'Saved', kind: 'demo', icon: BsHeart, noteAr: 'لا قائمة مفضلة على الخادم.', noteEn: 'There is no saved list on the server.' },
  { id: 'video', ar: 'الفيديو', en: 'Video', kind: 'demo', icon: BsCameraVideo, noteAr: 'لا مسار فيديو بعد.', noteEn: 'No video route yet.' },
  { id: 'stores', ar: 'المتاجر', en: 'Stores', kind: 'route', href: '/stores', icon: BsShop, noteAr: 'يفتح دليل المتاجر.', noteEn: 'Opens the store directory.' },
]

export default function HomeDiscoveryRail({ locale }: { locale: SupportedLocale }) {
  const ar = locale === 'ar'
  const router = useRouter()
  const params = useSearchParams()
  const viewParam = params.get('view')
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
      if (lane.id === 'all') next.delete('view')
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
          const pressed =
            lane.id === 'all'
              ? !viewParam
              : lane.kind === 'feed'
                ? viewParam === lane.id
                : demo === lane.id
          const Icon = lane.icon
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
              <Icon aria-hidden />
              {ar ? lane.ar : lane.en}
            </button>
          )
        })}
      </div>
      {active ? (
        <div className={styles.note}>
          <p>{ar ? active.noteAr : active.noteEn}</p>
          {active.id === 'auctions' || active.id === 'stores' ? null : (
            <p>{ar ? 'لا طبقة إضافية فوق الإعلانات الحقيقية.' : 'There is no extra layer on top of the real listings.'}</p>
          )}
          <Link href={active.id === 'nearby' ? '#home-latest' : `/${locale}${active.href || ''}`}>
            {active.kind === 'route'
              ? ar
                ? 'افتح الصفحة'
                : 'Open the page'
              : ar
                ? 'ارجع إلى الإعلانات الحقيقية'
                : 'Back to the real listings'}
          </Link>
        </div>
      ) : null}
    </section>
  )
}
