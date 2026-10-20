'use client'

import { useEffect, useState, type ReactNode } from 'react'

import Link from 'next/link'

import type { TrendingPostItem } from '@/lib/api/homeInsights'
import type { LatestListingItem } from '@/lib/server/fetchLatestListings'
import type { SupportedLocale } from '@/lib/localization'
import MobileHeaderSearchBar from '@/components/layout/TopHeader/mobile/MobileHeaderSearchBar'
import HomeMomentSlot from './HomeMomentSlot'
import HomeOpportunitySlot from './HomeOpportunitySlot'
import HomeBanner from './HomeBanner'
import MarketplaceStories from './MarketplaceStories'

import styles from './HomeUpperStage.module.css'

type Props = {
  locale: SupportedLocale
  countryLabel: string
  trending: TrendingPostItem[]
  latest?: LatestListingItem[]
  children?: ReactNode
}

function focusComposerTitle() {
  const input = document.getElementById('create-post-title')
  if (!(input instanceof HTMLInputElement) || input.readOnly || input.disabled) return false
  input.dataset.allowFocus = '1'
  input.focus({ preventScroll: true })
  return document.activeElement === input
}

function openComposer(intent: 'sale' | 'wanted') {
  document.documentElement.dataset.composerIntent = intent
  window.dispatchEvent(new CustomEvent('ananas:composer-intent', { detail: intent }))
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const composer = document.getElementById('ananas-composer')
  composer?.setAttribute('data-expanded', '1')
  composer?.scrollIntoView({
    behavior: reduced ? 'auto' : 'smooth',
    block: 'center',
  })
  if (focusComposerTitle()) return
  let tries = 0
  const retry = () => {
    document.getElementById('ananas-composer')?.scrollIntoView({ behavior: 'auto', block: 'center' })
    if (focusComposerTitle()) return
    if (tries < 40) {
      tries += 1
      window.setTimeout(retry, 100)
    }
  }
  window.setTimeout(retry, 60)
}

export default function HomeUpperStage({ locale, countryLabel, trending = [], latest = [], children }: Props) {
  const isArabic = locale === 'ar'
  const [note, setNote] = useState<'map' | 'matches' | null>(null)

  useEffect(() => {
    const onQuickAction = (event: MouseEvent) => {
      const target = event.target instanceof Element ? event.target.closest('[data-composer-intent]') : null
      const intent = target?.getAttribute('data-composer-intent')
      if (intent === 'sale' || intent === 'wanted') openComposer(intent)
    }
    document.addEventListener('click', onQuickAction)
    return () => document.removeEventListener('click', onQuickAction)
  }, [])

  return (
    <div className={styles.stage} dir={isArabic ? 'rtl' : 'ltr'}>
      <HomeMomentSlot locale={locale} countryLabel={countryLabel} onOpenComposer={() => openComposer('sale')} />

      <div className={styles.searchField}>
        <MobileHeaderSearchBar locale={locale} />
      </div>

      <div className={styles.actions} role="group" aria-label={isArabic ? 'إجراءات سريعة' : 'Quick actions'}>
        <button type="button" data-composer-intent="sale" className={styles.action} onClick={() => openComposer('sale')}>
          <SellIcon />
          {isArabic ? 'أبيع' : 'Sell'}
        </button>
        <button type="button" data-composer-intent="wanted" className={styles.actionWanted} onClick={() => openComposer('wanted')}>
          <WantedIcon />
          {isArabic ? 'مطلوب الآن' : 'Wanted now'}
        </button>
        <button type="button" className={styles.actionQuiet} onClick={() => setNote(note === 'map' ? null : 'map')}>
          <PinIcon />
          {isArabic ? 'الخريطة' : 'Map'}
        </button>
        <button type="button" className={styles.actionQuiet} onClick={() => setNote(note === 'matches' ? null : 'matches')}>
          <MatchIcon />
          {isArabic ? 'المطابقات' : 'Matches'}
        </button>
      </div>

      {note ? (
        <p className={styles.note} role="status">
          {note === 'map'
            ? isArabic
              ? 'الخريطة غير مربوطة في هذا التطبيق. البلد الحالي يبقى من اختيار الدولة.'
              : 'A map is not connected in this app. The country still comes from the country selector.'
            : isArabic
              ? 'المطابقات غير مربوطة بخدمة بعد. استخدم البحث للوصول إلى الإعلانات الحالية.'
              : 'Matches are not connected to a service yet. Use search for current listings.'}
        </p>
      ) : null}

      <MarketplaceStories locale={locale} />

      <section className={styles.wireBlock} aria-label={isArabic ? 'سلك السوق' : 'Market wire'}>
        <div className={styles.wireHead}>
          <span className={styles.liveDot} aria-hidden />
          <h2>{isArabic ? 'سلك السوق' : 'Market wire'}</h2>
          <span>
            {latest.length > 0
              ? isArabic
                ? `${latest.length} في آخر قائمة · ليست مبيعات`
                : `${latest.length} in the latest list · not sales`
              : isArabic
                ? 'لا عناوين في آخر استجابة'
                : 'The latest response had no titles'}
          </span>
        </div>
        {latest.length > 0 ? (
          <div className={styles.wire}>
            {latest.slice(0, 6).map((item) => (
              <Link key={item.id} href={`/${locale}/post/${item.id}`} className={styles.wireItem}>
                <strong>{item.title}</strong>
                {item.price != null ? <span>{item.price}</span> : null}
              </Link>
            ))}
            <Link href="#home-latest" className={styles.wireItem}>
              <strong>{isArabic ? 'آخر القائمة' : 'Latest list'}</strong>
            </Link>
          </div>
        ) : null}
      </section>

      <HomeBanner locale={locale} />

      {children}

      <HomeOpportunitySlot locale={locale} trending={trending} />
    </div>
  )
}

function SellIcon() {
  return (
    <svg viewBox="0 0 24 24" width="15" height="15" aria-hidden>
      <path fill="currentColor" d="M12 4.2 13.6 8l4.2.4-3.2 2.8.9 4.1L12 13.4 8.5 15.3l.9-4.1L6.2 8.4 10.4 8 12 4.2z" />
    </svg>
  )
}

function WantedIcon() {
  return (
    <svg viewBox="0 0 24 24" width="15" height="15" aria-hidden fill="none" stroke="currentColor" strokeWidth="1.8">
      <circle cx="11" cy="11" r="5.2" />
      <path strokeLinecap="round" d="M15.2 15.2 19 19" />
    </svg>
  )
}

function PinIcon() {
  return (
    <svg viewBox="0 0 24 24" width="15" height="15" aria-hidden fill="none" stroke="currentColor" strokeWidth="1.8">
      <path strokeLinecap="round" d="M12 20s6-5.2 6-10a6 6 0 1 0-12 0c0 4.8 6 10 6 10z" />
      <circle cx="12" cy="10" r="1.8" />
    </svg>
  )
}

function MatchIcon() {
  return (
    <svg viewBox="0 0 24 24" width="15" height="15" aria-hidden fill="none" stroke="currentColor" strokeWidth="1.8">
      <circle cx="8" cy="9" r="2.2" />
      <circle cx="16" cy="10" r="1.8" />
      <path strokeLinecap="round" d="M3.8 17.2c.8-2.2 2.4-3.3 4.2-3.3s3.4 1.1 4.2 3.3M13 17.4c.6-1.5 1.8-2.3 3.2-2.3 1.2 0 2.2.6 2.9 1.6" />
    </svg>
  )
}
