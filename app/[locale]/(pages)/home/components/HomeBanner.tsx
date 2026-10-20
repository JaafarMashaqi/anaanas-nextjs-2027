'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useMemo, useRef, useState } from 'react'
import type { Swiper as SwiperClass } from 'swiper'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Autoplay, Pagination, Keyboard, A11y } from 'swiper/modules'
import { BsChevronLeft, BsChevronRight } from 'react-icons/bs'

import { useAppData } from '@/context/AppDataContext'
import { API_BASE_URL } from '@/lib/api/config'
import styles from '../homeBanner.module.css'
import 'swiper/css'
import 'swiper/css/pagination'

type HomeBannerProps = {
  locale: string
}

type Slider = {
  id: number
  title: string | null
  url: string | null
  open_in_new_tab: boolean
  image_desktop_ar_url: string | null
  image_desktop_en_url: string | null
  image_mobile_ar_url: string | null
  image_mobile_en_url: string | null
  image_desktop?: string | null // populated by API when ?locale= passed
  image_mobile?: string | null
  sort_order: number
}

const isAbsolute = (u: string) => /^https?:\/\//i.test(u) || u.startsWith('//')

/**
 * Internal links (e.g. "/sections/cars") render with <Link> for SPA navigation;
 * absolute URLs go through a plain <a>. URLs already include the locale prefix
 * when pointing at the public site.
 */
function buildHref(url: string | null | undefined): string | null {
  if (!url) return null
  const trimmed = url.trim()
  if (!trimmed) return null
  return trimmed
}

export default function HomeBanner({ locale }: HomeBannerProps) {
  const { selectedCountry } = useAppData()
  const [slides, setSlides] = useState<Slider[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const isArabic = locale === 'ar'

  useEffect(() => {
    let cancelled = false
    const controller = new AbortController()

    async function load() {
      setLoading(true)
      setError(null)
      try {
        const params = new URLSearchParams()
        params.set('locale', isArabic ? 'ar' : 'en')
        if (selectedCountry?.id) params.set('country_id', String(selectedCountry.id))

        const res = await fetch(`${API_BASE_URL}/api/home/sliders?${params.toString()}`, {
          signal: controller.signal,
          cache: 'no-store',
        })
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const json = await res.json()
        if (cancelled) return
        const data = Array.isArray(json?.data) ? (json.data as Slider[]) : []
        setSlides(data)
      } catch (e) {
        if (!cancelled && (e as { name?: string })?.name !== 'AbortError') {
          setError((e as Error)?.message || 'failed')
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => {
      cancelled = true
      controller.abort()
    }
  }, [isArabic, selectedCountry?.id])

  // Pick the appropriate image variant (desktop vs mobile) based on viewport.
  // We resolve at render time on the client and let the Image component handle responsive sizing.
  const visibleSlides = useMemo(
    () =>
      slides.filter((s) =>
        Boolean(
          s.image_desktop_ar_url ||
            s.image_desktop_en_url ||
            s.image_mobile_ar_url ||
            s.image_mobile_en_url,
        ),
      ),
    [slides],
  )

  const swiperRef = useRef<SwiperClass | null>(null)
  const [hiddenIds, setHiddenIds] = useState<string[]>([])
  const [adminOff, setAdminOff] = useState(false)
  const [reduceMotion, setReduceMotion] = useState(false)
  const [storeNote, setStoreNote] = useState(false)

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem('ananas-campaign-hidden-ids')
      const parsed = raw ? JSON.parse(raw) : []
      if (Array.isArray(parsed)) setHiddenIds(parsed.filter((item) => typeof item === 'string'))
      if (window.localStorage.getItem('ananas-admin-campaign-slot') === 'hidden') setAdminOff(true)
    } catch {
      /* preferences stay for this view */
    }
    setReduceMotion(window.matchMedia('(prefers-reduced-motion: reduce)').matches)
  }, [])

  const hideId = (id: string) => {
    const next = [...hiddenIds, id]
    setHiddenIds(next)
    try {
      window.localStorage.setItem('ananas-campaign-hidden-ids', JSON.stringify(next))
    } catch {
      /* this view only */
    }
  }

  const hideAdmin = () => {
    setAdminOff(true)
    try {
      window.localStorage.setItem('ananas-admin-campaign-slot', 'hidden')
    } catch {
      /* this view only */
    }
  }

  const fixtures = [
    {
      id: 'fixture-coffee',
      kicker: isArabic ? 'قالب معاينة · ليست شراكة' : 'Preview template · not a partnership',
      title: isArabic ? 'صار بدها فنجان قهوة عميد' : 'Time for an Al Ameed coffee',
      line: isArabic ? 'قالب صباحي. لا توجد نقطة بيع مربوطة.' : 'A morning template. No store pin is connected.',
      action: isArabic ? 'أقرب نقطة' : 'Nearest store',
      tone: 'coffee' as const,
    },
    {
      id: 'fixture-car',
      kicker: isArabic ? 'قالب معاينة · ليست شراكة' : 'Preview template · not a partnership',
      title: 'BYD SHARK 6',
      line: isArabic ? 'قالب سيارات. البحث يفتح إعلانات حقيقية، وليس وكيلاً.' : 'A car template. Search opens real listings, not a dealer.',
      href: `/${locale}/search?q=${encodeURIComponent(isArabic ? 'سيارات' : 'cars')}`,
      action: isArabic ? 'ابحث عن سيارات' : 'Search cars',
      tone: 'car' as const,
    },
    {
      id: 'fixture-travel',
      kicker: isArabic ? 'قالب معاينة · ليست شراكة' : 'Preview template · not a partnership',
      title: isArabic ? 'الخطوط الجوية القطرية' : 'Qatar Airways',
      line: isArabic ? 'قالب سفر. لا حجز طيران مربوط.' : 'A travel template. No flight booking is connected.',
      href: `/${locale}/search?q=${encodeURIComponent(isArabic ? 'سفر' : 'travel')}`,
      action: isArabic ? 'ابحث عن سفر' : 'Search travel',
      tone: 'travel' as const,
    },
  ].filter((item) => !hiddenIds.includes(item.id))

  const adminSlides = adminOff ? [] : visibleSlides.filter((slide) => !hiddenIds.includes(`admin-${slide.id}`))
  const deckCount = 1 + adminSlides.length + fixtures.length

  return (
    <section className={styles.slot} data-hero="amman" aria-label={isArabic ? 'عرض أناناس' : 'ANANAS stage'}>
      <div className={`${styles.bannerWrap} ${styles.bannerSliderWrap} ${styles.stageFrame}`} data-banner-frame>
        <Swiper
          modules={reduceMotion ? [Pagination, Keyboard, A11y] : [Autoplay, Pagination, Keyboard, A11y]}
          onSwiper={(swiper) => {
            swiperRef.current = swiper
          }}
          slidesPerView={1}
          loop={deckCount > 1}
          keyboard={{ enabled: true }}
          autoplay={reduceMotion || deckCount < 2 ? false : { delay: 8000, disableOnInteraction: false, pauseOnMouseEnter: true }}
          pagination={{ clickable: true }}
          dir={isArabic ? 'rtl' : 'ltr'}
          className={styles.bannerSwiper}
        >
          <SwiperSlide>
            <div className={styles.identity}>
              <img src="/brand/hero.jpg" alt="" className={styles.identityImg} />
              <div className={styles.shade} />
              <span className={styles.badge}>{isArabic ? 'من عمّان · هوية المنصة' : 'From Amman · platform identity'}</span>
              <div className={styles.stageCopy}>
                <h2>{isArabic ? 'بيع أذكى، من أول سطر' : 'Sell smarter, from the first line'}</h2>
                <p>{isArabic ? 'اكتب ما عندك. أناناس يرتّب الإعلان.' : 'Write what you have. ANANAS arranges the listing.'}</p>
                <button type="button" onClick={() => openComposer()}>{isArabic ? 'ابدأ الآن' : 'Start now'}</button>
              </div>
            </div>
          </SwiperSlide>
          {adminSlides.map((slide, index) => (
            <SwiperSlide key={`admin-${slide.id}`}>
              <div className={styles.adminSlide}>
                <span className={styles.badge}>{isArabic ? 'حملة إدارية' : 'Admin campaign'}</span>
                <button type="button" className={styles.hide} onClick={() => hideId(`admin-${slide.id}`)}>
                  {isArabic ? 'إخفاء' : 'Hide'}
                </button>
                <SlideMedia slide={slide} isArabic={isArabic} priority={index === 0} />
              </div>
            </SwiperSlide>
          ))}
          {fixtures.map((fixture) => (
            <SwiperSlide key={fixture.id}>
              <div className={styles.fixture} data-tone={fixture.tone}>
                <span className={styles.badge}>{fixture.kicker}</span>
                <button type="button" className={styles.hide} onClick={() => hideId(fixture.id)}>
                  {isArabic ? 'إخفاء' : 'Hide'}
                </button>
                <div className={styles.stageCopy}>
                  <h2>{fixture.title}</h2>
                  <p>{fixture.line}</p>
                  {fixture.tone === 'coffee' ? (
                    <button type="button" onClick={() => setStoreNote((value) => !value)}>
                      {fixture.action}
                    </button>
                  ) : (
                    <Link href={fixture.href || `/${locale}/search`}>{fixture.action}</Link>
                  )}
                  {fixture.tone === 'coffee' && storeNote ? (
                    <p>{isArabic ? 'أقرب نقطة بيع غير متاحة. لا توجد إحداثيات متاجر.' : 'The nearest store is unavailable. No store coordinates are connected.'}</p>
                  ) : null}
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
        {deckCount > 1 ? (
          <>
            <button type="button" className={`${styles.bannerNav} ${styles.bannerNavPrev}`} onClick={() => swiperRef.current?.slidePrev()} aria-label={isArabic ? 'السابق' : 'Previous'}>
              {isArabic ? <BsChevronRight aria-hidden /> : <BsChevronLeft aria-hidden />}
            </button>
            <button type="button" className={`${styles.bannerNav} ${styles.bannerNavNext}`} onClick={() => swiperRef.current?.slideNext()} aria-label={isArabic ? 'التالي' : 'Next'}>
              {isArabic ? <BsChevronLeft aria-hidden /> : <BsChevronRight aria-hidden />}
            </button>
          </>
        ) : null}
      </div>
      {adminSlides.length > 0 ? (
        <button type="button" className={styles.adminOff} onClick={hideAdmin}>
          {isArabic ? 'إخفاء الحملات الإدارية' : 'Hide admin campaigns'}
        </button>
      ) : null}
      {loading ? <p className={styles.loadingNote}>{isArabic ? 'نجلب حملات الإدارة…' : 'Loading admin campaigns…'}</p> : null}
      {error ? <p className={styles.loadingNote}>{isArabic ? 'تعذر جلب حملات الإدارة. بطاقة عمّان تبقى.' : 'Admin campaigns could not be loaded. The Amman card stays.'}</p> : null}
    </section>
  )
}

function openComposer() {
  document.documentElement.dataset.composerIntent = 'sale'
  window.dispatchEvent(new CustomEvent('ananas:composer-intent', { detail: 'sale' }))
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  document.getElementById('ananas-composer')?.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'center' })
}

/* -------------------------------------------------------------------------- */

function pickImages(slide: Slider, isArabic: boolean) {
  // Prefer the locale-specific asset; fall back to the other locale if missing.
  const desktopPrimary = isArabic ? slide.image_desktop_ar_url : slide.image_desktop_en_url
  const desktopFallback = isArabic ? slide.image_desktop_en_url : slide.image_desktop_ar_url
  const mobilePrimary = isArabic ? slide.image_mobile_ar_url : slide.image_mobile_en_url
  const mobileFallback = isArabic ? slide.image_mobile_en_url : slide.image_mobile_ar_url

  const desktop = desktopPrimary || desktopFallback || mobilePrimary || mobileFallback
  // Mobile asset may be missing — fall back to desktop so we never render an empty box.
  const mobile = mobilePrimary || mobileFallback || desktop

  return { desktop, mobile }
}

function SlideMedia({
  slide,
  isArabic,
  priority,
}: {
  slide: Slider
  isArabic: boolean
  priority?: boolean
}) {
  const { desktop, mobile } = pickImages(slide, isArabic)
  const href = buildHref(slide.url)
  const altText = slide.title || (isArabic ? 'بانر إعلاني' : 'Promotional banner')
  const target = slide.open_in_new_tab ? '_blank' : undefined
  const rel = slide.open_in_new_tab ? 'noopener noreferrer' : undefined

  // Filtering in the parent guarantees at least one of these is present.
  const fallbackSrc = desktop || mobile
  if (!fallbackSrc) return null

  const media = (
    <picture className={styles.bannerPicture}>
      {mobile && <source media="(max-width: 767px)" srcSet={mobile} />}
      {desktop && <source media="(min-width: 768px)" srcSet={desktop} />}
      <Image
        src={fallbackSrc}
        alt={altText}
        fill
        priority={priority}
        sizes="(max-width: 767px) 100vw, min(1100px, 100vw)"
        unoptimized
        className={styles.bannerImg}
      />
    </picture>
  )

  if (!href) {
    return <div className={styles.bannerSlide}>{media}</div>
  }

  if (isAbsolute(href) || target === '_blank') {
    return (
      <a
        href={href}
        target={target}
        rel={rel}
        className={styles.bannerSlide}
        aria-label={altText}
      >
        {media}
      </a>
    )
  }

  return (
    <Link href={href} className={styles.bannerSlide} aria-label={altText}>
      {media}
    </Link>
  )
}
