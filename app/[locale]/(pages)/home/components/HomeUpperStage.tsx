'use client'

import { useEffect, useState, type ReactNode } from 'react'

import Link from 'next/link'

import type { TrendingPostItem } from '@/lib/api/homeInsights'
import { demoMarketEvents } from '@/lib/experience/demoMarketEvents'
import type { SupportedLocale } from '@/lib/localization'
import type { LatestListingItem } from '@/lib/server/fetchLatestListings'
import MobileHeaderSearchBar from '@/components/layout/TopHeader/mobile/MobileHeaderSearchBar'
import HomeMomentSlot from './HomeMomentSlot'
import HomeOpportunitySlot from './HomeOpportunitySlot'
import HomeBanner from './HomeBanner'
import HomeDiscoveryRail from './HomeDiscoveryRail'
import HomeGoldenMoment from './HomeGoldenMoment'
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
  const [hiddenEvents, setHiddenEvents] = useState<string[]>([])
  const events = demoMarketEvents(locale).filter((item) => !hiddenEvents.includes(item.id))
  const [savedEvents, setSavedEvents] = useState<string[]>([])
  const [wireOn, setWireOn] = useState(false)
  const [wireStep, setWireStep] = useState(0)
  const hideEvent = (id: string) => setHiddenEvents((current) => [...current, id])
  const saveEvent = (id: string) =>
    setSavedEvents((current) => (current.includes(id) ? current.filter((item) => item !== id) : [...current, id]))
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

  useEffect(() => {
    let showTimer = 0
    let hideTimer = 0
    let cancelled = false
    const arm = (delay: number) => {
      showTimer = window.setTimeout(() => {
        if (cancelled) return
        const active = document.activeElement
        if (
          active instanceof HTMLInputElement ||
          active instanceof HTMLTextAreaElement ||
          active instanceof HTMLSelectElement
        ) {
          arm(4000)
          return
        }
        setWireOn(true)
        hideTimer = window.setTimeout(() => {
          setWireOn(false)
          setWireStep((value) => value + 1)
          arm(90000)
        }, 10000)
      }, delay)
    }
    arm(8000)
    return () => {
      cancelled = true
      window.clearTimeout(showTimer)
      window.clearTimeout(hideTimer)
    }
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

      <div className={styles.place}>
        <span aria-hidden>📍</span>
        <strong>
          {/أردن|jordan/i.test(countryLabel) ? (isArabic ? 'عمّان، ' : 'Amman, ') : ''}
          {countryLabel}
        </strong>
        <span>{isArabic ? 'الحي غير مربوط' : 'Neighborhood is not connected'}</span>
      </div>

      <HomeBanner locale={locale} />

      {children}

      {wireOn && events.length > 0 ? (
        <section className={styles.opportunity} role="status" aria-label={isArabic ? 'فرصة' : 'Opportunity'}>
          <p>{isArabic ? 'فرصة تجريبية · ليست طلباً حقيقياً' : 'Demo opportunity · not a real buyer'}</p>
          <Link href={events[wireStep % events.length].href}>
            {isArabic ? events[wireStep % events.length].textAr : events[wireStep % events.length].textEn}
          </Link>
          <button type="button" onClick={() => saveEvent(events[wireStep % events.length].id)}>
            {savedEvents.includes(events[wireStep % events.length].id) ? (isArabic ? 'محفوظ' : 'Saved') : isArabic ? 'احفظ' : 'Save'}
          </button>
          <button
            type="button"
            onClick={() => {
              hideEvent(events[wireStep % events.length].id)
              setWireOn(false)
            }}
          >
            {isArabic ? 'إخفاء' : 'Hide'}
          </button>
        </section>
      ) : null}

      <HomeGoldenMoment locale={locale} onSell={() => openComposer('sale')} />
      <HomeDiscoveryRail locale={locale} />

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
