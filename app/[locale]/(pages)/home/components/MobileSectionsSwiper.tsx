'use client'

import { useCallback, useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import Image from 'next/image'
import Link from 'next/link'
import { AnimatePresence, motion } from 'motion/react'
import { BsChevronLeft, BsChevronRight, BsX } from 'react-icons/bs'

import type { Section } from '@/lib/api/sections'
import { getApiUrl } from '@/lib/api/config'
import { resolveMediaUrl } from '@/lib/media/resolveMediaUrl'
import type { SupportedLocale } from '@/lib/localization'

import styles from './MobileSectionsSwiper.module.css'

type MobileSectionsSwiperProps = {
  sections: Section[]
  locale: SupportedLocale
}

function sectionIconUrl(icon?: string | null) {
  if (!icon) return null
  if (icon.startsWith('http://') || icon.startsWith('https://') || icon.startsWith('//')) {
    return resolveMediaUrl(icon)
  }
  const path = icon.startsWith('/') ? icon : `/${icon}`
  return resolveMediaUrl(getApiUrl(path))
}

/**
 * Stable per-section pastel tile colour. The palette intentionally favours
 * very soft / desaturated shades so the pineapple characters remain the
 * focal point (matches the reference design).
 *
 * Picking by `id` (not index) keeps the colour consistent across reloads
 * even if the API reorders sections.
 */
const TILE_PALETTE: string[] = [
  '#dff3e1', // mint
  '#fff1d7', // butter
  '#e8eef6', // soft blue-grey
  '#f3ead7', // sand
  '#fde9e9', // blush
  '#e7f0f9', // ice
  '#ffe6c9', // peach
  '#e9e5f7', // lavender
  '#efe7fb', // lavender
  '#f1f0ed', // bone
]

function pickTile(seed: number) {
  const i = ((seed % TILE_PALETTE.length) + TILE_PALETTE.length) % TILE_PALETTE.length
  return TILE_PALETTE[i]
}

/** Default visible count on the home screen. The full list lives in the modal. */
const DEFAULT_VISIBLE = 8

/* -------------------------------------------------------------------------- */
/*                             Section card                                    */
/* -------------------------------------------------------------------------- */

type SectionCardProps = {
  section: Section
  locale: SupportedLocale
  index: number
  onNavigate?: () => void
}

const SectionCard = ({ section, locale, index, onNavigate }: SectionCardProps) => {
  const iconSrc = sectionIconUrl(section.icon)
  const tileColor = pickTile(section.id)
  const initial = (section.name || '?').trim().charAt(0).toUpperCase()
  const isDark = tileColor === '#1f1f1f'

  return (
    <motion.div
      initial={{ opacity: 0, y: 16, scale: 0.92 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{
        delay: Math.min(index * 0.045, 0.6),
        type: 'spring',
        stiffness: 340,
        damping: 26,
      }}
      whileTap={{ scale: 0.95 }}
      className={styles.cell}
    >
      <Link
        href={`/${locale}/sections/${section.slug}`}
        className={styles.card}
        aria-label={section.name}
        onClick={onNavigate}
      >
        <div
          className={`${styles.tile} ${isDark ? styles.tileDark : ''}`}
          style={{ '--tile-bg': tileColor } as React.CSSProperties}
        >
          {iconSrc ? (
            <Image
              src={iconSrc}
              alt=""
              fill
              sizes="(max-width: 360px) 24vw, (max-width: 600px) 22vw, 110px"
              unoptimized
              className={styles.tileImg}
            />
          ) : (
            <span className={styles.tileFallback} aria-hidden>
              {initial}
            </span>
          )}
        </div>

        <span className={styles.label}>{section.name}</span>
      </Link>
    </motion.div>
  )
}

/* -------------------------------------------------------------------------- */
/*                             All-sections modal                              */
/* -------------------------------------------------------------------------- */

type AllSectionsModalProps = {
  open: boolean
  onClose: () => void
  sections: Section[]
  locale: SupportedLocale
}

const AllSectionsModal = ({ open, onClose, sections, locale }: AllSectionsModalProps) => {
  // ESC key closes the modal; we also lock body scroll while it's open so
  // background content doesn't peek through the touch interactions.
  useEffect(() => {
    if (!open) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    document.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener('keydown', onKey)
    }
  }, [open, onClose])

  if (typeof window === 'undefined') return null

  const isArabic = locale === 'ar'

  return createPortal(
    <AnimatePresence>
      {open ? (
        <motion.div
          className={styles.modalRoot}
          dir={isArabic ? 'rtl' : 'ltr'}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          role="dialog"
          aria-modal="true"
          aria-label={isArabic ? 'كل الأقسام' : 'All sections'}
        >
          <motion.button
            type="button"
            className={styles.modalBackdrop}
            onClick={onClose}
            aria-label={isArabic ? 'إغلاق' : 'Close'}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          <motion.div
            className={styles.modalSheet}
            initial={{ y: '100%', opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 0 }}
            transition={{ type: 'spring', stiffness: 320, damping: 32, mass: 0.9 }}
          >
            <div className={styles.modalHandle} aria-hidden />

            <header className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>
                {isArabic ? 'كل الأقسام' : 'All sections'}
                <span className={styles.modalCount}>{sections.length}</span>
              </h3>
              <button
                type="button"
                className={styles.modalClose}
                onClick={onClose}
                aria-label={isArabic ? 'إغلاق' : 'Close'}
              >
                <BsX />
              </button>
            </header>

            <div className={styles.modalBody}>
              <motion.div
                className={styles.modalGrid}
                /* Stagger children manually via per-card delays for a tighter
                   feel than `staggerChildren` (we want a quicker cascade). */
                initial="hidden"
                animate="visible"
              >
                {sections.map((section, index) => (
                  <SectionCard
                    key={section.id}
                    section={section}
                    locale={locale}
                    index={index}
                    onNavigate={onClose}
                  />
                ))}
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>,
    document.body
  )
}

/* -------------------------------------------------------------------------- */
/*                              Main component                                 */
/* -------------------------------------------------------------------------- */

const MobileSectionsSwiper = ({ sections, locale }: MobileSectionsSwiperProps) => {
  const [modalOpen, setModalOpen] = useState(false)
  const openModal = useCallback(() => setModalOpen(true), [])
  const closeModal = useCallback(() => setModalOpen(false), [])

  if (!sections.length) return null

  const isArabic = locale === 'ar'
  const hasMore = sections.length > DEFAULT_VISIBLE
  const visibleSections = sections.slice(0, DEFAULT_VISIBLE)

  const ChevronIcon = isArabic ? BsChevronLeft : BsChevronRight

  return (
    <section className={styles.wrapper} aria-label={isArabic ? 'تصفح الأقسام' : 'Browse sections'}>
      <header className={styles.header}>
        <h2 className={styles.title}>{isArabic ? 'تصفح الأقسام' : 'Browse sections'}</h2>
        {hasMore ? (
          <button
            type="button"
            className={styles.viewAll}
            onClick={openModal}
            aria-haspopup="dialog"
          >
            <span>{isArabic ? 'عرض الكل' : 'View all'}</span>
            <ChevronIcon className={styles.viewAllIcon} aria-hidden />
          </button>
        ) : null}
      </header>

      <div className={styles.grid}>
        {visibleSections.map((section, index) => (
          <SectionCard
            key={section.id}
            section={section}
            locale={locale}
            index={index}
          />
        ))}
      </div>

      <AllSectionsModal
        open={modalOpen}
        onClose={closeModal}
        sections={sections}
        locale={locale}
      />
    </section>
  )
}

export default MobileSectionsSwiper
