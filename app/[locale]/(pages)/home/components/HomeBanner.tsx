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
  const [slotHidden, setSlotHidden] = useState(false)

  useEffect(() => {
    try {
      if (window.localStorage.getItem('ananas-admin-campaign-slot') === 'hidden') setSlotHidden(true)
    } catch {
      /* the slot stays visible */
    }
  }, [])

  const hideSlot = () => {
    setSlotHidden(true)
    try {
      window.localStorage.setItem('ananas-admin-campaign-slot', 'hidden')
    } catch {
      /* this view only */
    }
  }

  const slotLabel = isArabic ? 'حملة من الإدارة · ليست بطاقة عمّان' : 'Admin campaign · not the Amman card'

  if (slotHidden) return null

  // While the very first request is in flight render a sized skeleton so the
  // page doesn't jump. After that, if there's nothing to show we render
  // nothing — no default placeholder.
  if (loading && slides.length === 0) {
    return (
      <div className={`${styles.bannerWrap} ${styles.bannerSkeleton}`} aria-busy="true">
        <span className={styles.bannerSkeletonShine} aria-hidden />
      </div>
    )
  }

  // No data and no error-recovery: don't render anything. Caller can collapse the slot.
  if (error || visibleSlides.length === 0) {
    return null
  }

  // Single-slide path — skip Swiper entirely for slightly faster paint.
  if (visibleSlides.length === 1) {
    return (
      <section className={styles.slot} aria-label={slotLabel}>
        <div className={styles.slotHead}>
          <span>{slotLabel}</span>
          <button type="button" onClick={hideSlot}>{isArabic ? 'إخفاء' : 'Hide'}</button>
        </div>
        <div className={styles.bannerWrap} data-banner-frame>
          <SlideMedia slide={visibleSlides[0]} isArabic={isArabic} priority />
        </div>
      </section>
    )
  }

  // RTL note: in RTL Swiper inverts visual direction, so the "previous" slide is
  // actually to the right. We stick to logical prev/next on the underlying
  // Swiper instance — CSS positions the chevrons relative to the inline edges.
  const goPrev = () => swiperRef.current?.slidePrev()
  const goNext = () => swiperRef.current?.slideNext()

  return (
    <section className={styles.slot} aria-label={slotLabel}>
      <div className={styles.slotHead}>
        <span>{slotLabel}</span>
        <button type="button" onClick={hideSlot}>{isArabic ? 'إخفاء' : 'Hide'}</button>
      </div>
      <div className={`${styles.bannerWrap} ${styles.bannerSliderWrap}`} data-banner-frame>
      <Swiper
        modules={[Autoplay, Pagination, Keyboard, A11y]}
        onSwiper={(s) => {
          swiperRef.current = s
        }}
        slidesPerView={1}
        loop
        keyboard={{ enabled: true }}
        autoplay={{ delay: 5500, disableOnInteraction: false, pauseOnMouseEnter: true }}
        pagination={{ clickable: true }}
        dir={isArabic ? 'rtl' : 'ltr'}
        className={styles.bannerSwiper}
      >
        {visibleSlides.map((slide, idx) => (
          <SwiperSlide key={slide.id}>
            <SlideMedia slide={slide} isArabic={isArabic} priority={idx === 0} />
          </SwiperSlide>
        ))}
      </Swiper>

      {/* Custom navigation buttons — fully theme-able, RTL-aware via CSS */}
      <button
        type="button"
        className={`${styles.bannerNav} ${styles.bannerNavPrev}`}
        onClick={goPrev}
        aria-label={isArabic ? 'الشريحة السابقة' : 'Previous slide'}
      >
        {isArabic ? <BsChevronRight aria-hidden /> : <BsChevronLeft aria-hidden />}
      </button>
      <button
        type="button"
        className={`${styles.bannerNav} ${styles.bannerNavNext}`}
        onClick={goNext}
        aria-label={isArabic ? 'الشريحة التالية' : 'Next slide'}
      >
        {isArabic ? <BsChevronLeft aria-hidden /> : <BsChevronRight aria-hidden />}
      </button>
      </div>
    </section>
  )
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
        onLoad={(event) => {
          const img = event.currentTarget
          const frame = img.closest('[data-banner-frame]')
          if (!(frame instanceof HTMLElement) || !img.naturalWidth || !img.naturalHeight) return
          frame.style.aspectRatio = `${img.naturalWidth} / ${img.naturalHeight}`
        }}
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
