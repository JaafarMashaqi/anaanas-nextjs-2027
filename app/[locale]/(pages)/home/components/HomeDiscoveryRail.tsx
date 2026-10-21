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
  { id: 'live', ar: 'مباشر الآن', en: 'Live now', kind: 'route', href: '/live', icon: BsBroadcast, noteAr: 'غرفة عرض، بلا بث.', noteEn: 'A demo room, with no stream.' },
  { id: 'photos', ar: 'Trending', en: 'Trending', kind: 'feed', icon: BsFire, noteAr: 'يبقي الإعلانات التي لها صور.', noteEn: 'Keeps listings that have photos.' },
  { id: 'auctions', ar: 'المزادات', en: 'Auctions', kind: 'route', href: '/pages/auction', icon: BsHammer, noteAr: 'يفتح المزادات الحالية.', noteEn: 'Opens the current auctions.' },
  { id: 'hot', ar: 'عروض نار', en: 'Hot deals', kind: 'route', href: '/business', icon: BsFire, noteAr: 'محاكاة حملة بلا سعر.', noteEn: 'A campaign simulation with no price.' },
  { id: 'nearby', ar: 'بالقرب منك', en: 'Nearby', kind: 'route', href: '/intelligence', icon: BsGeoAlt, noteAr: 'لا مسافة محسوبة.', noteEn: 'Distance is not calculated.' },
  { id: 'foryou', ar: 'فرص لك', en: 'For you', kind: 'route', href: '/intelligence', icon: BsStars, noteAr: 'أمثلة عرض، لا مطابقة حساب.', noteEn: 'Demo examples, not account matching.' },
  { id: 'wanted', ar: 'مطلوب الآن', en: 'Wanted', kind: 'route', href: '/matching', icon: BsSearch, noteAr: 'نية محفوظة على الجهاز.', noteEn: 'An intent saved on this device.' },
  { id: 'following', ar: 'المتابعات', en: 'Following', kind: 'route', href: '/seller', icon: BsPeople, noteAr: 'مركز البائع. المتابعة غير مربوطة.', noteEn: 'Seller center. Following is not connected.' },
  { id: 'saved', ar: 'المفضلة', en: 'Saved', kind: 'route', href: '/saved', icon: BsHeart, noteAr: 'صفحة المحفوظات.', noteEn: 'The saved page.' },
  { id: 'video', ar: 'الفيديو', en: 'Video', kind: 'route', href: '/reels', icon: BsCameraVideo, noteAr: 'إطار فيديو للعرض.', noteEn: 'A demo video frame.' },
  { id: 'stores', ar: 'المتاجر', en: 'Stores', kind: 'route', href: '/stores', icon: BsShop, noteAr: 'يفتح دليل المتاجر.', noteEn: 'Opens the store directory.' },
  { id: 'assistant', ar: 'المساعد', en: 'Assistant', kind: 'route', href: '/assistant', icon: BsStars, noteAr: 'تلميح كلمات، وليس نموذجاً.', noteEn: 'A keyword hint, not a model.' },
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
