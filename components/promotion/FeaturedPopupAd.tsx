'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useParams } from 'next/navigation'
import { Modal, Button } from 'react-bootstrap'
import { BsStars, BsX } from 'react-icons/bs'
import { fetchPromotionPopup, trackPromotionPopupClick } from '@/lib/api/promotion'
import { resolveMediaUrl } from '@/lib/media/resolveMediaUrl'
import { DEFAULT_LOCALE, isSupportedLocale } from '@/lib/localization'
import type { SupportedLocale } from '@/lib/localization'
import styles from './FeaturedPopupAd.module.css'

const STORAGE_KEY = 'ananas_promo_popup_client_id'
const COOLDOWN_KEY = 'ananas_promo_popup_last'

type Props = {
  locale?: SupportedLocale
  countryId?: number
}

function getClientId() {
  if (typeof window === 'undefined') return ''
  let id = localStorage.getItem(STORAGE_KEY)
  if (!id) {
    id = `c_${Math.random().toString(36).slice(2)}_${Date.now()}`
    localStorage.setItem(STORAGE_KEY, id)
  }
  return id
}

export default function FeaturedPopupAd({ locale: localeProp, countryId }: Props) {
  const params = useParams()
  const locale: SupportedLocale = useMemo(() => {
    if (localeProp) return localeProp
    const raw = params?.locale
    const segment = Array.isArray(raw) ? raw[0] : raw
    return segment && isSupportedLocale(segment) ? segment : DEFAULT_LOCALE
  }, [localeProp, params?.locale])
  const [open, setOpen] = useState(false)
  const [post, setPost] = useState<Record<string, unknown> | null>(null)
  const [promotionId, setPromotionId] = useState<number | undefined>()

  const isAr = locale === 'ar'
  const href = useMemo(() => {
    if (!post?.id) return '#'
    return `/${locale}/post/${post.id}`
  }, [post?.id, locale])

  useEffect(() => {
    const last = Number(sessionStorage.getItem(COOLDOWN_KEY) || 0)
    if (Date.now() - last < 30 * 60 * 1000) return

    const timer = window.setTimeout(() => {
      const clientId = getClientId()
      fetchPromotionPopup({ countryId, clientId, locale }).then((data) => {
        if (!data?.post) return
        setPost(data.post)
        setPromotionId(data.promotion_id)
        setOpen(true)
        sessionStorage.setItem(COOLDOWN_KEY, String(Date.now()))
      })
    }, 4000)

    return () => window.clearTimeout(timer)
  }, [countryId, locale])

  if (!post) return null

  const title = String(post.title ?? '')
  const image = resolveMediaUrl(
    (post.main_image as string) ||
      ((post.post_images as { image?: string }[] | undefined)?.[0]?.image ?? ''),
  )

  return (
    <Modal show={open} onHide={() => setOpen(false)} centered className={styles.modal}>
      <Modal.Body className={styles.body}>
        <button type="button" className={styles.close} onClick={() => setOpen(false)} aria-label="Close">
          <BsX size={22} />
        </button>
        <div className={styles.badge}>
          <BsStars aria-hidden />
          {isAr ? 'إعلان مميز' : 'Featured ad'}
        </div>
        {image ? (
          <Image src={image} alt="" width={360} height={220} className={styles.image} unoptimized />
        ) : null}
        <h3 className={styles.title}>{title}</h3>
        <div className={styles.actions}>
          <Link href={href} className="text-decoration-none" onClick={() => {
            if (post?.id) trackPromotionPopupClick(Number(post.id), promotionId)
            setOpen(false)
          }}>
            <Button variant="warning" as="span">
              {isAr ? 'عرض الإعلان' : 'View ad'}
            </Button>
          </Link>
          <Button variant="light" onClick={() => setOpen(false)}>
            {isAr ? 'لاحقاً' : 'Later'}
          </Button>
        </div>
      </Modal.Body>
    </Modal>
  )
}
