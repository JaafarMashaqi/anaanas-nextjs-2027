'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useCallback, useState } from 'react'
import { useSession } from 'next-auth/react'
import { BsChevronLeft, BsChevronRight, BsGeoAlt, BsHeart, BsHeartFill } from 'react-icons/bs'

import type { LatestListingItem } from '@/lib/server/fetchLatestListings'
import LoginRequiredDialog from '@/components/dialogs/LoginRequiredDialog'
import { resolveMediaUrl } from '@/lib/media/resolveMediaUrl'
import { t } from '@/lib/translations'
import type { SupportedLocale } from '@/lib/localization'

import styles from './MobileLatestAdsSection.module.css'

type PostReactionToggleResponse = {
  success?: boolean
  data?: {
    toggled_on?: boolean
  }
  message?: string
}

function formatPrice(value: number, locale: SupportedLocale): string {
  try {
    return new Intl.NumberFormat(locale === 'ar' ? 'ar-JO' : 'en-US', {
      maximumFractionDigits: value % 1 === 0 ? 0 : 2,
    }).format(value)
  } catch {
    return String(value)
  }
}

function ListingHeart({
  postId,
  initial,
  locale,
}: {
  postId: number
  initial: boolean
  locale: SupportedLocale
}) {
  const { status } = useSession()
  const [on, setOn] = useState(initial)
  const [loginOpen, setLoginOpen] = useState(false)
  const [busy, setBusy] = useState(false)

  const toggle = useCallback(
    async (e: React.MouseEvent) => {
      e.preventDefault()
      e.stopPropagation()
      if (busy) return
      if (status !== 'authenticated') {
        setLoginOpen(true)
        return
      }
      setBusy(true)
      const next = !on
      setOn(next)
      try {
        const res = await fetch(`/api/posts/${postId}/reactions`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify({ type: 'like' }),
        })
        const json = (await res.json().catch(() => ({}))) as PostReactionToggleResponse
        if (!res.ok || json?.success === false) {
          throw new Error(json?.message || 'toggle failed')
        }
        setOn(Boolean(json.data?.toggled_on))
      } catch {
        setOn(!next)
      } finally {
        setBusy(false)
      }
    },
    [busy, on, postId, status],
  )

  return (
    <>
      <button
        type="button"
        className={`${styles.heartBtn} ${on ? styles.heartOn : ''}`}
        onClick={toggle}
        disabled={busy}
        aria-pressed={on}
        aria-label={on ? t('post.unlike', locale) : t('post.like', locale)}
      >
        {on ? <BsHeartFill size={15} /> : <BsHeart size={15} />}
      </button>
      <LoginRequiredDialog show={loginOpen} onHide={() => setLoginOpen(false)} locale={locale} />
    </>
  )
}

export default function MobileLatestAdsSectionClient({
  items,
  locale,
}: {
  items: LatestListingItem[]
  locale: SupportedLocale
}) {
  const isArabic = locale === 'ar'
  const ChevronIcon = isArabic ? BsChevronLeft : BsChevronRight

  if (items.length === 0) {
    return <p className={styles.empty}>{t('home.latestAdsEmpty', locale)}</p>
  }

  return (
    <section id="home-latest" className={styles.wrapper} aria-label={t('home.latestAds', locale)}>
      <header className={styles.header}>
        <h2 className={styles.title}>{t('home.latestAds', locale)}</h2>
        <Link href={`/${locale}`} className={styles.viewAll}>
          <span>{t('post.viewAll', locale)}</span>
          <ChevronIcon className={styles.viewAllIcon} aria-hidden />
        </Link>
      </header>

      <div className={styles.scroller}>
        {items.map((item) => {
          const img = item.image_url ? resolveMediaUrl(item.image_url) : ''
          const priceLine =
            item.price != null && !Number.isNaN(item.price)
              ? `${formatPrice(item.price, locale)} ${item.currency}`
              : '—'

          return (
            <article key={item.id} className={styles.card} data-listing-id={item.id}>
              <div className={styles.mediaWrap}>
                {item.is_new ? <span className={styles.badgeNew}>{t('home.newBadge', locale)}</span> : null}
                <ListingHeart postId={item.id} initial={item.is_favorited} locale={locale} />
                <Link href={`/${locale}/post/${item.id}`} className={styles.mediaFill} aria-hidden tabIndex={-1}>
                  {img ? (
                    <Image
                      src={img}
                      alt=""
                      fill
                      className="object-contain"
                      sizes="184px"
                      unoptimized
                    />
                  ) : null}
                </Link>
              </div>

              <div className={styles.body}>
                <Link href={`/${locale}/post/${item.id}`} className={styles.cardLink}>
                  <h3 className={styles.postTitle}>{item.title}</h3>
                  <div className={styles.locRow}>
                    <BsGeoAlt className={styles.locIcon} size={12} aria-hidden />
                    <span>{item.location}</span>
                  </div>
                </Link>

                <div className={styles.bottomRow}>
                  <Link href={`/${locale}/post/${item.id}`} className={styles.contact} prefetch={false}>
                    {t('post.contact', locale)}
                  </Link>
                  <div className={styles.priceBlock}>
                    <div className={styles.priceMain}>{priceLine}</div>
                    {item.price_suffix ? (
                      <div className={styles.priceSuffix}>{item.price_suffix}</div>
                    ) : null}
                  </div>
                </div>
              </div>
            </article>
          )
        })}
      </div>
    </section>
  )
}
