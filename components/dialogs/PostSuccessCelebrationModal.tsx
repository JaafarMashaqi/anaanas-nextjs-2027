'use client'

import { useEffect, useMemo } from 'react'
import { createPortal } from 'react-dom'
import Link from 'next/link'
import { motion, AnimatePresence } from 'motion/react'
import { BsCheckLg, BsClockHistory, BsX } from 'react-icons/bs'
import { t, type SupportedLocale } from '@/lib/translations'
import { playPostSuccessSound } from '@/lib/playPostSuccessSound'
import styles from './PostSuccessCelebrationModal.module.css'

const CONFETTI_COLORS = ['#ef4444', '#3b82f6', '#eab308', '#a855f7', '#22c55e', '#f97316', '#ec4899']

type Props = {
  show: boolean
  onHide: () => void
  locale: string
  postId?: number | string
  postTitle?: string
  /** published = live immediately; pending_review = awaiting admin approval */
  variant?: 'published' | 'pending_review'
}

export default function PostSuccessCelebrationModal({
  show,
  onHide,
  locale,
  postId,
  postTitle,
  variant = 'published',
}: Props) {
  const loc = (locale === 'en' ? 'en' : 'ar') as SupportedLocale
  const isPending = variant === 'pending_review'

  const confetti = useMemo(() => {
    return Array.from({ length: 22 }, (_, i) => ({
      key: i,
      left: `${(i * 37) % 100}%`,
      delay: `${(i % 8) * 0.12}s`,
      duration: `${2.2 + (i % 5) * 0.15}s`,
      color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
    }))
  }, [])

  useEffect(() => {
    if (!show || isPending) return
    playPostSuccessSound()
  }, [show, isPending])

  const locSegment = locale || 'ar'
  const postHref =
    postId != null && postId !== '' ? `/${locSegment}/post/${postId}` : null
  const myAdsHref = `/${locSegment}/my-posts`

  if (typeof document === 'undefined') return null

  return createPortal(
    <AnimatePresence>
      {show && (
        <motion.div
          className={styles.overlay}
          role="dialog"
          aria-modal="true"
          aria-labelledby="post-success-title"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={(e) => {
            if (e.target === e.currentTarget) onHide()
          }}
        >
          <motion.div
            className={styles.panel}
            initial={{ opacity: 0, scale: 0.92, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: 'spring', stiffness: 380, damping: 28 }}
            onClick={(e) => e.stopPropagation()}
          >
            <button type="button" className={styles.closeX} onClick={onHide} aria-label={t('createPost.success.close', loc)}>
              <BsX size={22} aria-hidden />
            </button>

            {!isPending ? (
              <div className={styles.celebrateTop}>
                <div className={styles.confettiLayer} aria-hidden>
                  {confetti.map((c) => (
                    <span
                      key={c.key}
                      className={styles.confetti}
                      style={{
                        left: c.left,
                        background: c.color,
                        animationDelay: c.delay,
                        animationDuration: c.duration,
                      }}
                    />
                  ))}
                </div>
                <div className={`${styles.balloon} ${styles.b1}`} aria-hidden />
                <div className={`${styles.balloon} ${styles.b2}`} aria-hidden />
                <div className={`${styles.balloon} ${styles.b3}`} aria-hidden />
                <div className={`${styles.balloon} ${styles.b4}`} aria-hidden />
                <div className={`${styles.balloon} ${styles.b5}`} aria-hidden />
              </div>
            ) : null}

            <div className={styles.body}>
              <div className={styles.iconWrap} aria-hidden>
                {isPending ? (
                  <BsClockHistory size={30} className="text-dark" />
                ) : (
                  <BsCheckLg size={30} className="text-dark" />
                )}
              </div>
              <h2 id="post-success-title" className={styles.title}>
                {t(isPending ? 'createPost.success.pendingTitle' : 'createPost.success.celebrationTitle', loc)}
              </h2>
              <p className={styles.subtitle}>
                {t(isPending ? 'createPost.success.pendingSubtitle' : 'createPost.success.celebrationSubtitle', loc)}
                {postTitle ? (
                  <>
                    <br />
                    <span className={styles.postTitle}>{postTitle}</span>
                  </>
                ) : null}
              </p>
              <div className={styles.actions}>
                {postHref ? (
                  <Link href={postHref} className={styles.btnPrimary} onClick={onHide}>
                    {t('createPost.success.viewPost', loc)}
                  </Link>
                ) : null}
                {isPending ? (
                  <Link href={myAdsHref} className={styles.btnGhost} onClick={onHide}>
                    {t('createPost.success.viewMyAds', loc)}
                  </Link>
                ) : (
                  <Link href={`/${locSegment}#home-feed-posts`} className={styles.btnGhost} onClick={onHide}>
                    {t('createPost.success.viewHomeFeed', loc)}
                  </Link>
                )}
                <button type="button" className={styles.btnGhost} onClick={onHide}>
                  {t('createPost.success.close', loc)}
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  )
}
