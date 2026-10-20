'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import type { SupportedLocale } from '@/lib/localization'
import styles from './HomeFeedTabs.module.css'

const LIVE_TABS = [
  { id: 'latest', ar: 'الأحدث', en: 'Latest' },
  { id: 'photos', ar: 'بصور', en: 'With photos' },
  { id: 'price', ar: 'حسب السعر', en: 'By price' },
] as const

const READY_TABS = [
  {
    id: 'wanted',
    ar: 'مطلوب',
    en: 'Wanted',
    arNote: 'لا يوجد نوع «مطلوب» في الخادم، لذلك هذه الخانة لا تصفّي الإعلانات.',
    enNote: 'The server has no wanted type, so this tab does not filter listings.',
  },
  {
    id: 'nearby',
    ar: 'بالقرب',
    en: 'Nearby',
    arNote: 'لا يوجد فلتر «بالقرب مني». البلد ما زال يأتي من اختيار الدولة.',
    enNote: 'There is no nearby filter. Country still comes from the country selector.',
  },
  {
    id: 'following',
    ar: 'المتابَعون',
    en: 'Following',
    arNote: 'متابعة الأشخاص غير مربوطة. المتابعة الحالية للأقسام والفئات فقط.',
    enNote: 'Following people is not connected. Current follows are sections and categories only.',
  },
] as const

export default function HomeFeedTabs({ locale }: { locale: SupportedLocale }) {
  const router = useRouter()
  const params = useSearchParams()
  const current = params.get('view') || 'latest'
  const isArabic = locale === 'ar'
  const ready = READY_TABS.find((tab) => tab.id === current)

  const select = (id: string) => {
    const next = new URLSearchParams(params.toString())
    next.delete('page')
    if (id === 'latest') next.delete('view')
    else next.set('view', id)
    const query = next.toString()
    router.push(query ? `/${locale}?${query}` : `/${locale}`, { scroll: false })
  }

  return (
    <div dir={isArabic ? 'rtl' : 'ltr'}>
      <div className={styles.tabs} role="tablist" aria-label={isArabic ? 'اكتشاف السوق' : 'Market discovery'}>
        {LIVE_TABS.map((tab) => {
          const active = current === tab.id || (tab.id === 'latest' && !params.get('view'))
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={active}
              className={active ? styles.tabActive : styles.tab}
              onClick={() => select(tab.id)}
            >
              {isArabic ? tab.ar : tab.en}
            </button>
          )
        })}
        {READY_TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={current === tab.id}
            className={current === tab.id ? styles.tabActive : styles.tab}
            onClick={() => select(tab.id)}
          >
            {isArabic ? tab.ar : tab.en}
          </button>
        ))}
        <a className={styles.tab} href="#home-featured">
          {isArabic ? 'الصفقات' : 'Deals'}
        </a>
      </div>
      {ready ? (
        <p className={styles.note} role="status">
          {isArabic ? ready.arNote : ready.enNote}{' '}
          {isArabic ? 'القائمة بالأسفل ما زالت أحدث الإعلانات.' : 'The list below is still the latest listings.'}
        </p>
      ) : null}
    </div>
  )
}