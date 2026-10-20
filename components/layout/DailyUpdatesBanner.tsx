'use client'

import { useParams } from 'next/navigation'
import { BsMegaphoneFill, BsStars } from 'react-icons/bs'

import { DEFAULT_LOCALE, isSupportedLocale } from '@/lib/localization'
import type { SupportedLocale } from '@/lib/localization'

type Props = {
  /** Override the locale (defaults to reading it from the URL segment). */
  locale?: SupportedLocale
  className?: string
}

const COPY: Record<SupportedLocale, { eyebrow: string; message: string }> = {
  ar: {
    eyebrow: 'ترقبوا',
    message: 'تغييرات يومية على منصة أناناس الجديدة',
  },
  en: {
    eyebrow: 'Stay tuned',
    message: 'Daily updates are landing on the new ANANAS platform',
  },
}

/**
 * Thin animated banner shown beneath the top header to announce the rolling
 * daily updates. Uses a warm gradient with a moving highlight ("shine") and a
 * subtle marquee for the message so it reads as lively without being noisy.
 *
 * Renders the message in Arabic or English based on the URL locale.
 */
const DailyUpdatesBanner = ({ locale: localeOverride, className = '' }: Props) => {
  const params = useParams<{ locale?: string }>()
  const locale: SupportedLocale = (() => {
    if (localeOverride) return localeOverride
    const fromParams = Array.isArray(params?.locale) ? params.locale[0] : params?.locale
    return fromParams && isSupportedLocale(fromParams) ? fromParams : DEFAULT_LOCALE
  })()
  const t = COPY[locale]

  return (
    <>
      <div
        className={`dailyBanner ${className}`.trim()}
        role="status"
        aria-live="polite"
      >
        <div className="dailyBanner__shine" aria-hidden />

        <div className="dailyBanner__content">
          <span className="dailyBanner__icon" aria-hidden>
            <BsMegaphoneFill size={14} />
          </span>

          <span className="dailyBanner__eyebrow">
            <BsStars size={12} />
            <span>{t.eyebrow}</span>
          </span>

          <span className="dailyBanner__divider" aria-hidden />

          <span className="dailyBanner__message">{t.message}</span>
        </div>
      </div>

      <style jsx global>{`
        .dailyBanner {
          /* The top header is fixed-position, so offset the banner by its height. */
          --dailyBanner-header-offset: 50px;
          position: relative;
          overflow: hidden;
          width: 100%;
          padding: 9px 14px;
          margin-top:55px;
          margin-bottom:8px;
          text-align: center;
          color: #101828;
          /* calm market strip */
          background: #fffefb;
          border-bottom: 1px solid #e7e9ee;
          animation: none;
          box-shadow: none;
          font-size: 0.84rem;
          line-height: 1.2;
        }

        .dailyBanner__content {
          position: relative;
          z-index: 2;
          display: inline-flex;
          align-items: center;
          gap: 10px;
          max-width: 100%;
          flex-wrap: wrap;
          justify-content: center;
          font-weight: 600;
        }

        .dailyBanner__icon {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 26px;
          height: 26px;
          border-radius: 999px;
          background: #ffc928;
          color: #101828;
          box-shadow: none;
          flex: 0 0 auto;
          animation: none;
        }

        .dailyBanner__eyebrow {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 3px 10px;
          border-radius: 999px;
          font-size: 0.72rem;
          font-weight: 800;
          letter-spacing: 0.4px;
          color: #101828;
          background: #ffc928;
          border: 0;
          text-transform: none;
        }

        .dailyBanner__divider {
          display: inline-block;
          width: 4px;
          height: 4px;
          border-radius: 999px;
          background: rgba(0, 0, 0, 0.35);
        }

        .dailyBanner__message {
          color: #111;
          font-weight: 700;
          letter-spacing: 0.1px;
        }

        /* Moving "shine" highlight that sweeps across the banner */
        .dailyBanner__shine {
          display: none;
        }

        /* LTR sweeps left→right; RTL sweeps right→left so the motion matches reading direction */
        [dir='rtl'] .dailyBanner__shine {
          animation-name: dailyBannerShineRtl;
        }

        @keyframes dailyBannerSlide {
          0% {
            background-position: 0% 50%;
          }
          100% {
            background-position: 200% 50%;
          }
        }

        @keyframes dailyBannerShine {
          0% {
            transform: translateX(-110%);
          }
          60%,
          100% {
            transform: translateX(110%);
          }
        }

        @keyframes dailyBannerShineRtl {
          0% {
            transform: translateX(110%);
          }
          60%,
          100% {
            transform: translateX(-110%);
          }
        }

        @keyframes dailyBannerBell {
          0%,
          60%,
          100% {
            transform: rotate(0);
          }
          70% {
            transform: rotate(14deg);
          }
          80% {
            transform: rotate(-10deg);
          }
          90% {
            transform: rotate(6deg);
          }
        }

        /* Tablets/phones: the header wraps to two rows (top cluster + search),
           so the offset needs to grow. */
        @media (max-width: 991.98px) {
          .dailyBanner {
            --dailyBanner-header-offset: 98px;
          }
        }

        /* Compact on small screens so it doesn't break into awkward lines */
        @media (max-width: 480px) {
          .dailyBanner {
            --dailyBanner-header-offset: 92px;
            padding: 7px 10px;
            font-size: 0.82rem;
          }
          .dailyBanner__content {
            gap: 6px;
          }
          .dailyBanner__icon {
            width: 22px;
            height: 22px;
          }
          .dailyBanner__eyebrow {
            padding: 2px 8px;
            font-size: 0.66rem;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .dailyBanner,
          .dailyBanner__shine,
          .dailyBanner__icon {
            animation: none !important;
          }
        }
      `}</style>
    </>
  )
}

export default DailyUpdatesBanner
