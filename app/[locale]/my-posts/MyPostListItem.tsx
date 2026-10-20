'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'
import { motion, type Variants } from 'motion/react'
import {
  BsBarChartFill,
  BsChatFill,
  BsEyeFill,
  BsHandThumbsUpFill,
  BsPencilFill,
  BsStars,
  BsThreeDotsVertical,
  BsTrashFill,
} from 'react-icons/bs'
import type { PostRecord } from '@/lib/api/posts'
import { resolveMediaUrl } from '@/lib/media/resolveMediaUrl'
import { isPubliclyPublishedStatus } from '@/lib/postStatus'
import { useAppData } from '@/context/AppDataContext'
import { resolveListingCurrency } from '@/lib/seo/countryCurrency'
import type { SupportedLocale } from '@/lib/localization'
import { timeSince } from '@/utils/date'
import styles from './myPosts.module.css'

type Props = {
  post: PostRecord
  locale: SupportedLocale
  index: number
  reducedMotion: boolean
  onFeature: (postId: number) => void
  onDelete: (postId: number) => void
}

function formatPrice(price: unknown, currency: string | null, locale: SupportedLocale): string | null {
  if (price == null || price === '') return null
  const n = typeof price === 'number' ? price : Number(String(price).replace(/,/g, ''))
  if (!Number.isFinite(n) || n <= 0) return null
  const formatted = new Intl.NumberFormat(locale === 'ar' ? 'ar-JO' : 'en-US', {
    maximumFractionDigits: 0,
  }).format(n)
  if (currency === 'JOD') return locale === 'ar' ? `${formatted} د.أ` : `${formatted} JOD`
  if (currency) return `${formatted} ${currency}`
  return formatted
}

function getStatusMeta(status: string, featured: boolean, isAr: boolean) {
  if (featured) return { label: isAr ? 'مميز' : 'Featured', tone: 'featured' as const }
  switch (status) {
    case 'active':
      return { label: isAr ? 'نشط' : 'Active', tone: 'active' as const }
    case 'pending_review':
    case 'pending':
      return { label: isAr ? 'قيد المراجعة' : 'Pending', tone: 'pending' as const }
    case 'rejected':
      return { label: isAr ? 'مرفوض' : 'Rejected', tone: 'rejected' as const }
    default:
      return { label: status || (isAr ? 'مسودة' : 'Draft'), tone: 'muted' as const }
  }
}

export default function MyPostListItem({
  post,
  locale,
  index,
  reducedMotion,
  onFeature,
  onDelete,
}: Props) {
  const { countries } = useAppData()
  const isAr = locale === 'ar'
  const postId = Number(post.id)
  const status = String(post.status ?? '')
  const featured = Boolean(post.is_featured_active || post.promotion?.is_active)
  const statusMeta = getStatusMeta(status, featured, isAr)

  const postImages = Array.isArray((post as any)?.post_images) ? ((post as any).post_images as any[]) : []
  const thumb = resolveMediaUrl(postImages[0]?.image_full_url ?? post?.image)
  const title = String(post.title ?? (isAr ? `إعلان #${postId}` : `Listing #${postId}`))
  const cityName = String((post as any)?.city?.name ?? (post as any)?.city_name ?? '')
  const createdAtRaw = (post as any)?.publish_date || post?.created_at || post?.createdAt
  const createdAtDate = createdAtRaw ? new Date(String(createdAtRaw)) : null
  const priceLabel = formatPrice(
    (post as any)?.price,
    resolveListingCurrency({
      iso2: (post as any)?.country?.iso2 || (post as any)?.country?.iso_code,
      countryId: (post as any)?.country_id ?? (post as any)?.country?.id,
      countries,
    }),
    locale,
  )

  const views = Number((post as any)?.views_count ?? (post as any)?.views ?? 0) || 0
  const likes = Number((post as any)?.likes_count ?? (post as any)?.reactions_count ?? 0) || 0
  const comments = Number((post as any)?.comments_count ?? 0) || 0

  const canFeature =
    isPubliclyPublishedStatus(status) && !featured

  const detailsHref = `/${locale}/post/${postId}`
  const editHref = `/${locale}/post/${postId}/edit`
  const statsHref = `/${locale}/post/${postId}/statistics`

  const [menuOpen, setMenuOpen] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)

  const itemVariants: Variants = reducedMotion
    ? { hidden: { opacity: 1 }, visible: { opacity: 1 } }
    : {
        hidden: { opacity: 0, y: 14, scale: 0.98 },
        visible: {
          opacity: 1,
          y: 0,
          scale: 1,
          transition: { duration: 0.32, delay: Math.min(index * 0.05, 0.35), ease: [0.22, 1, 0.36, 1] },
        },
      }

  return (
    <motion.li
      className={styles.postRow}
      variants={itemVariants}
      initial="hidden"
      animate="visible"
      layout={!reducedMotion}
      whileHover={reducedMotion ? undefined : { y: -2 }}
      transition={{ type: 'spring', stiffness: 420, damping: 28 }}
    >
      <Link href={detailsHref} className={styles.postThumbLink} aria-label={title}>
        <div className={styles.postThumb}>
          {thumb ? (
            <Image unoptimized fill className={styles.postThumbImg} src={thumb} alt="" sizes="96px" />
          ) : (
            <span className={styles.postThumbFallback} aria-hidden>
              {title.slice(0, 1).toUpperCase()}
            </span>
          )}
          {featured && (
            <span className={styles.postThumbFeatured}>
              <BsStars size={10} aria-hidden />
            </span>
          )}
        </div>
      </Link>

      <div className={styles.postBody}>
        <div className={styles.postTopLine}>
          <Link href={detailsHref} className={styles.postTitle}>
            {title}
          </Link>
          <span className={`${styles.statusBadge} ${styles[`status_${statusMeta.tone}`]}`}>
            {statusMeta.label}
          </span>
        </div>

        <div className={styles.postMeta}>
          {cityName && <span>{cityName}</span>}
          {cityName && createdAtDate && <span className={styles.metaDot} aria-hidden>•</span>}
          {createdAtDate && <span>{timeSince(createdAtDate, locale)}</span>}
          {priceLabel && (
            <>
              <span className={styles.metaDot} aria-hidden>•</span>
              <span className={styles.postPrice}>{priceLabel}</span>
            </>
          )}
        </div>

        <div className={styles.postStats}>
          <span className={styles.miniStat}>
            <BsEyeFill size={12} aria-hidden />
            {views}
          </span>
          <span className={styles.miniStat}>
            <BsHandThumbsUpFill size={12} aria-hidden />
            {likes}
          </span>
          <span className={styles.miniStat}>
            <BsChatFill size={12} aria-hidden />
            {comments}
          </span>
        </div>
      </div>

      <div className={styles.postActions}>
        <Link href={editHref} className={`${styles.actionBtn} ${styles.actionPrimary}`} title={isAr ? 'تعديل' : 'Edit'}>
          <BsPencilFill size={14} aria-hidden />
          <span>{isAr ? 'تعديل' : 'Edit'}</span>
        </Link>
        <Link href={statsHref} className={styles.actionBtn} title={isAr ? 'إحصائيات' : 'Stats'}>
          <BsBarChartFill size={14} aria-hidden />
          <span>{isAr ? 'إحصائيات' : 'Stats'}</span>
        </Link>
        {canFeature && (
          <button
            type="button"
            className={`${styles.actionBtn} ${styles.actionFeature}`}
            onClick={() => onFeature(postId)}
          >
            <BsStars size={14} aria-hidden />
            <span>{isAr ? 'تمييز' : 'Feature'}</span>
          </button>
        )}

        <div className={styles.menuWrap}>
          <button
            type="button"
            className={styles.menuTrigger}
            aria-expanded={menuOpen}
            aria-haspopup="menu"
            onClick={() => setMenuOpen((v) => !v)}
          >
            <BsThreeDotsVertical size={16} aria-hidden />
          </button>
          {menuOpen && (
            <>
              <button
                type="button"
                className={styles.menuBackdrop}
                aria-label={isAr ? 'إغلاق' : 'Close'}
                onClick={() => {
                  setMenuOpen(false)
                  setConfirmDelete(false)
                }}
              />
              <motion.div
                className={styles.menuPanel}
                role="menu"
                initial={reducedMotion ? false : { opacity: 0, scale: 0.96, y: -4 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.18 }}
              >
                <Link href={detailsHref} className={styles.menuItem} role="menuitem" onClick={() => setMenuOpen(false)}>
                  {isAr ? 'عرض الإعلان' : 'View listing'}
                </Link>
                {!confirmDelete ? (
                  <button
                    type="button"
                    className={`${styles.menuItem} ${styles.menuItemDanger}`}
                    role="menuitem"
                    onClick={() => setConfirmDelete(true)}
                  >
                    <BsTrashFill size={13} aria-hidden />
                    {isAr ? 'حذف' : 'Delete'}
                  </button>
                ) : (
                  <div className={styles.confirmDelete}>
                    <p>{isAr ? 'حذف هذا الإعلان؟' : 'Delete this listing?'}</p>
                    <div className={styles.confirmDeleteActions}>
                      <button type="button" className={styles.confirmCancel} onClick={() => setConfirmDelete(false)}>
                        {isAr ? 'إلغاء' : 'Cancel'}
                      </button>
                      <button
                        type="button"
                        className={styles.confirmOk}
                        onClick={() => {
                          setMenuOpen(false)
                          setConfirmDelete(false)
                          onDelete(postId)
                        }}
                      >
                        {isAr ? 'حذف' : 'Delete'}
                      </button>
                    </div>
                  </div>
                )}
              </motion.div>
            </>
          )}
        </div>
      </div>
    </motion.li>
  )
}
