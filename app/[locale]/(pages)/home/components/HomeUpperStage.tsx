'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useState } from 'react'

import type { TrendingPostItem } from '@/lib/api/homeInsights'
import type { Section } from '@/lib/api/sections'
import { getApiUrl } from '@/lib/api/config'
import { resolveMediaUrl } from '@/lib/media/resolveMediaUrl'
import type { SupportedLocale } from '@/lib/localization'
import { plainListingText } from '@/lib/text/plainListingText'
import MobileHeaderSearchBar from '@/components/layout/TopHeader/mobile/MobileHeaderSearchBar'
import mascot from '@/assets/uiux/mascot_sitting.png'

import styles from './HomeUpperStage.module.css'

type Props = {
  locale: SupportedLocale
  countryLabel: string
  sections: Section[]
  trending: TrendingPostItem[]
}

function sectionIcon(icon?: string | null) {
  if (!icon) return null
  if (icon.startsWith('http://') || icon.startsWith('https://') || icon.startsWith('//')) {
    return resolveMediaUrl(icon)
  }
  const path = icon.startsWith('/') ? icon : `/${icon}`
  return resolveMediaUrl(getApiUrl(path))
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

export default function HomeUpperStage({ locale, countryLabel, sections, trending }: Props) {
  const isArabic = locale === 'ar'
  const stable = isArabic ? `سوق أناناس في ${countryLabel}` : `ANANAS market in ${countryLabel}`
  const [greeting, setGreeting] = useState(stable)
  const [sky, setSky] = useState<'day' | 'night' | 'neutral'>('neutral')
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
    const hour = new Date().getHours()
    const day = hour >= 6 && hour < 18
    setSky(day ? 'day' : 'night')
    if (isArabic) {
      const part = hour < 12 ? 'صباح الخير' : hour < 17 ? 'نهارك سعيد' : 'مساء الخير'
      setGreeting(part)
      return
    }
    const part = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'
    setGreeting(part)
  }, [isArabic])

  const stories = sections.slice(0, 8)

  return (
    <div className={styles.stage} dir={isArabic ? 'rtl' : 'ltr'}>
      <div className={styles.greet}>
        <span className={`${styles.sky} ${sky === 'day' ? styles.sun : ''} ${sky === 'night' ? styles.moon : ''}`} aria-hidden>
          {sky === 'night' ? (
            <svg viewBox="0 0 24 24" width="18" height="18">
              <path fill="currentColor" d="M14.5 2.4a8.8 8.8 0 1 0 7.1 12.2A8 8 0 0 1 14.5 2.4z" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" width="18" height="18">
              <circle cx="12" cy="12" r="4" fill="currentColor" />
              <g stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
                <path d="M12 2.5v2.2M12 19.3v2.2M2.5 12h2.2M19.3 12h2.2M5 5l1.6 1.6M17.4 17.4 19 19M19 5l-1.6 1.6M6.6 17.4 5 19" />
              </g>
            </svg>
          )}
        </span>
        <div className={styles.greetCopy}>
          <p className={styles.greetTitle}>{greeting}</p>
          <p className={styles.greetHint}>
            {isArabic ? `سوق أناناس في ${countryLabel}` : `ANANAS market in ${countryLabel}`}
          </p>
        </div>
        <Image src={mascot} alt="" width={40} height={40} className={styles.mascot} />
      </div>

      <div className={styles.searchSlot}>
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

      <div className={styles.block}>
        <div className={styles.blockHead}>
          <h2>{isArabic ? 'القصص' : 'Stories'}</h2>
          <span>{isArabic ? 'أقسام حقيقية، وليست قصص حسابات' : 'Real sections, not account stories'}</span>
        </div>
        <div className={styles.stories}>
          <button
            type="button"
            className={styles.story}
            onClick={() => openComposer('sale')}
            aria-label={
              isArabic
                ? 'أضف قصتك يفتح منشئ الإعلان ولا ينشر قصة عامة'
                : 'Add your story opens the ad composer and does not publish a public story'
            }
          >
            <span className={`${styles.storyRing} ${styles.storyAdd}`}>
              <span className={styles.storyPlus}>+</span>
            </span>
            <span>{isArabic ? 'أضف قصتك' : 'Add your story'}</span>
          </button>
          {stories.length === 0 ? (
            <p className={styles.empty}>{isArabic ? 'لا توجد أقسام للعرض الآن.' : 'No sections to show right now.'}</p>
          ) : (
            stories.map((section) => {
              const icon = sectionIcon(section.icon)
              return (
                <Link key={section.id} href={`/${locale}/sections/${section.slug}`} className={styles.story}>
                  <span className={styles.storyRing}>
                    {icon ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={icon} alt="" />
                    ) : (
                      <Image src={mascot} alt="" width={44} height={44} />
                    )}
                  </span>
                  <span>{section.name}</span>
                </Link>
              )
            })
          )}
        </div>
      </div>

      <div className={styles.block} id="market-wire">
        <div className={styles.wireHead}>
          <span className={styles.liveDot} aria-hidden />
          <h2>{isArabic ? 'الفرص تتحرك الآن' : 'Opportunities are moving'}</h2>
          <span>
            {trending.length
              ? isArabic
                ? 'عناوين رائجة من الخادم'
                : 'Trending titles from the server'
              : isArabic
                ? 'لا توجد أرقام تجريبية'
                : 'No sample numbers'}
          </span>
        </div>
        {trending.length === 0 ? (
          <p className={styles.empty}>
            {isArabic
              ? 'لا توجد إعلانات رائجة مؤكدة من الخادم في هذه اللحظة.'
              : 'The server has no confirmed trending listings right now.'}
          </p>
        ) : (
          <div className={styles.wire}>
            {trending.map((item) => (
              <Link key={item.post_id} href={`/${locale}/post/${item.post_id}`} className={styles.wireItem}>
                {item.section_name ? <span>{plainListingText(item.section_name)}</span> : null}
                <strong>{plainListingText(item.title)}</strong>
              </Link>
            ))}
          </div>
        )}
      </div>

      <section className={styles.hero} data-hero="amman" aria-label={isArabic ? 'هوية أناناس' : 'ANANAS identity'}>
        {/* Restored platform still from the previous Next Generation project. Not a partner ad. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/brand/hero.jpg" alt="" className={styles.heroImage} />
        <div className={styles.heroShade} />
        <div className={styles.heroCopy}>
          <p className={styles.heroKicker} style={{ color: '#ffe58a' }}>
            {isArabic ? 'من عمّان · تعريف المنصة' : 'From Amman · platform identity'}
          </p>
          <h2 style={{ color: '#fff', textShadow: '0 1px 8px rgba(16,24,40,0.55)' }}>
            {isArabic ? 'السوق حي… والفرص تتحرك الآن' : 'The market is alive… opportunities are moving now'}
          </h2>
          <p style={{ color: '#fff', textShadow: '0 1px 8px rgba(16,24,40,0.45)' }}>
            {isArabic
              ? 'أعلن، اشتري، واستكشف. هذه هوية أناناس، وليست إعلان شريك.'
              : 'List, buy, and explore. This is ANANAS identity, not a partner ad.'}
          </p>
          <button type="button" onClick={() => openComposer('sale')}>
            {isArabic ? 'ابدأ الآن' : 'Start now'}
          </button>
        </div>
      </section>

      <Link href={`/${locale}/search`} className={styles.opp}>
        <span className={styles.oppMark} aria-hidden>
          <PinIcon />
        </span>
        <span className={styles.oppCopy}>
          <strong>{isArabic ? 'فرص ظاهرة في السوق' : 'Opportunities visible now'}</strong>
          <span>
            {isArabic
              ? 'لا يوجد عدّاد شخصي منذ آخر زيارة. افتح البحث الحقيقي.'
              : 'There is no personal counter since your last visit. Open real search.'}
          </span>
        </span>
      </Link>
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
