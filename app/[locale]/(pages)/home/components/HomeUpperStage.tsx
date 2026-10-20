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
  const [note, setNote] = useState<'map' | 'matches' | 'concept' | null>(null)

  useEffect(() => {
    const onQuickAction = (event: MouseEvent) => {
      const target = event.target instanceof Element ? event.target.closest('[data-composer-intent]') : null
      const intent = target?.getAttribute('data-composer-intent')
      if (intent === 'sale' || intent === 'wanted') openComposer(intent)
    }
    document.addEventListener('click', onQuickAction)
    return () => document.removeEventListener('click', onQuickAction)
  }, [])

  const stories = sections.slice(0, 8)

  return (
    <div className={styles.stage} dir={isArabic ? 'rtl' : 'ltr'}>
      <GreetingReel locale={locale} countryLabel={countryLabel} onSell={() => openComposer('sale')} onConcept={() => setNote('concept')} />

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
            : note === 'matches'
              ? isArabic
                ? 'المطابقات غير مربوطة بخدمة بعد. استخدم البحث للوصول إلى الإعلانات الحالية.'
                : 'Matches are not connected to a service yet. Use search for current listings.'
              : isArabic
                ? 'هذه لمحة بصرية فقط. لا طلب، ولا حجز، ولا شراكة تجارية.'
                : 'This is a visual concept only. No order, booking, or commercial partnership.'}
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
    </div>
  )
}

const REEL = ['greet', 'coffee', 'shark', 'flight', 'tip', 'insight'] as const
type ReelId = (typeof REEL)[number]

function GreetingReel({
  locale,
  countryLabel,
  onSell,
  onConcept,
}: {
  locale: SupportedLocale
  countryLabel: string
  onSell: () => void
  onConcept: () => void
}) {
  const isArabic = locale === 'ar'
  const [index, setIndex] = useState(0)
  const [paused, setPaused] = useState(false)
  const [hour, setHour] = useState(12)
  const id = REEL[index]
  const reelClass = {
    greet: styles.reel_greet,
    coffee: styles.reel_coffee,
    shark: styles.reel_shark,
    flight: styles.reel_flight,
    tip: styles.reel_tip,
    insight: styles.reel_insight,
  }[id]

  useEffect(() => {
    setHour(new Date().getHours())
  }, [])

  useEffect(() => {
    if (paused) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const dwell = id === 'greet' ? 9000 : 7500
    const timer = window.setTimeout(() => setIndex((value) => (value + 1) % REEL.length), dwell)
    return () => window.clearTimeout(timer)
  }, [id, paused])

  const step = (direction: 1 | -1) => {
    setIndex((value) => (value + direction + REEL.length) % REEL.length)
  }

  const hello = isArabic
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

  return (
    <section
      className={`${styles.reel} ${reelClass}`}
      data-reel={id}
      aria-roledescription={isArabic ? 'عرض متحرك' : 'rotating highlight'}
      aria-label={isArabic ? 'تحية أناناس والمفاهيم' : 'ANANAS greeting and concepts'}
      onPointerEnter={() => setPaused(true)}
      onPointerLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setPaused(false)
      }}
    >
      <div className={styles.reelControls}>
        <button type="button" aria-label={isArabic ? 'السابق' : 'Previous'} onClick={() => step(-1)}>
          ‹
        </button>
        <button type="button" aria-label={isArabic ? 'التالي' : 'Next'} onClick={() => step(1)}>
          ›
        </button>
      </div>
      <div key={id} className={styles.reelFrame}>
        <ReelArt id={id} night={hour >= 18 || hour < 6} />
        <div className={styles.reelCopy}>
          {id === 'greet' ? (
            <>
              <p className={styles.reelTitle}>{hello}</p>
              <p className={styles.reelBody}>
                {isArabic
                  ? `سوق أناناس في ${countryLabel}. تصفّح بهدوء، أو انشر حين يجهز العنوان.`
                  : `ANANAS market in ${countryLabel}. Browse calmly, or publish when the title is ready.`}
              </p>
            </>
          ) : (
            <ReelCopy id={id} isArabic={isArabic} onSell={onSell} onConcept={onConcept} locale={locale} />
          )}
        </div>
      </div>
    </section>
  )
}

function ReelArt({ id, night }: { id: ReelId; night: boolean }) {
  if (id === 'coffee') {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src="/brand/coffee-founder.png" alt="" className={styles.reelArt} />
    )
  }
  if (id === 'shark') {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src="/brand/shark-6.jpg" alt="" className={styles.reelArt} />
    )
  }
  if (id === 'flight') {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src="/brand/flight-concept.jpg" alt="" className={styles.reelArt} />
    )
  }
  return (
    <span className={styles.reelMascot}>
      <Image src={mascot} alt="" width={64} height={64} />
      <span className={styles.reelSky} aria-hidden>
        {night ? (
          <svg viewBox="0 0 24 24" width="12" height="12">
            <path fill="currentColor" d="M14.5 2.4a8.8 8.8 0 1 0 7.1 12.2A8 8 0 0 1 14.5 2.4z" />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" width="12" height="12">
            <circle cx="12" cy="12" r="4" fill="currentColor" />
          </svg>
        )}
      </span>
    </span>
  )
}

function ReelCopy({
  id,
  isArabic,
  locale,
  onSell,
  onConcept,
}: {
  id: Exclude<ReelId, 'greet'>
  isArabic: boolean
  locale: SupportedLocale
  onSell: () => void
  onConcept: () => void
}) {
  const copy = isArabic
    ? {
        coffee: ['مفهوم فقط · ليست شراكة', 'فنجان بن العميد', 'شخصية أناناس قبل الزحمة. لا يوجد طلب قهوة.', 'المفهوم فقط'],
        shark: ['مفهوم فقط · ليست رعاية', 'BYD SHARK في السيارات', 'لمحة لمن يبحث عن بيك أب. ليست رعاية من المصنّع.', 'سوق السيارات'],
        flight: ['مفهوم فقط · ليست شراكة طيران', 'فكرة سفر من عمّان', 'اعرض رحلتك حين تجهّزها. لا حجز تذاكر من هنا.', 'اكتب إعلانًا'],
        tip: ['من أناناس', 'أول سطر يبيع', 'عنوان واضح يختصر أسئلة المشتري قبل أن يسأل.', 'اكتب العنوان'],
        insight: ['من السوق المنشور', 'لا عدّاد لزيارتك', 'لا رقم شخصي منذ آخر زيارة. افتح ما هو منشور فعلًا.', 'افتح البحث'],
      }
    : {
        coffee: ['Concept only · not a partnership', 'A Ben Al Ameed moment', 'An ANANAS character, not a coffee order.', 'Concept only'],
        shark: ['Concept only · not a sponsorship', 'BYD SHARK in cars', 'A creative pickup idea. Not a manufacturer sponsorship.', 'Browse cars'],
        flight: ['Concept only · not an airline', 'A travel idea from Amman', 'List a trip when it is ready. This does not book a ticket.', 'Draft a listing'],
        tip: ['From ANANAS', 'The first line sells', 'A clear title answers the buyer before they ask.', 'Write the title'],
        insight: ['From published listings', 'No visit counter', 'There is no personal number since your last visit.', 'Open search'],
      }
  const [kicker, title, body, cta] = copy[id]
  return (
    <>
      <p className={styles.reelKicker}>{kicker}</p>
      <p className={styles.reelTitle}>{title}</p>
      <p className={styles.reelBody}>{body}</p>
      {id === 'shark' ? (
        <Link className={styles.reelCta} href={`/${locale}/search?q=${encodeURIComponent(isArabic ? 'سيارات' : 'cars')}`}>
          {cta}
        </Link>
      ) : id === 'insight' ? (
        <Link className={styles.reelCta} href={`/${locale}/search`}>
          {cta}
        </Link>
      ) : id === 'coffee' ? (
        <button type="button" className={styles.reelCta} onClick={onConcept}>
          {cta}
        </button>
      ) : (
        <button type="button" className={styles.reelCta} onClick={onSell}>
          {cta}
        </button>
      )}
    </>
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
