'use client'

import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'

import type { SupportedLocale } from '@/lib/localization'
import { t } from '@/lib/translations'

import styles from './PostReportDialog.module.css'

export type PostReportCategory = 'spam' | 'harassment' | 'scam' | 'inappropriate' | 'other'

type Props = {
  open: boolean
  locale: SupportedLocale
  busy?: boolean
  onClose: () => void
  onSubmit: (payload: {
    category: PostReportCategory
    reason: string
    description?: string
  }) => Promise<void> | void
}

const CATEGORIES: PostReportCategory[] = ['spam', 'harassment', 'scam', 'inappropriate', 'other']

export default function PostReportDialog({ open, locale, busy = false, onClose, onSubmit }: Props) {
  const [category, setCategory] = useState<PostReportCategory>('spam')
  const [reason, setReason] = useState('')
  const [description, setDescription] = useState('')

  useEffect(() => {
    if (!open) return
    setCategory('spam')
    setReason('')
    setDescription('')
  }, [open])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    if (busy) return
    if (!reason.trim()) return
    void onSubmit({
      category,
      reason: reason.trim(),
      description: description.trim() || undefined,
    })
  }

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className={styles.backdrop}
          onClick={onClose}
          role="dialog"
          aria-modal="true"
          aria-label={t('post.report.title', locale)}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.form
            className={styles.modal}
            onClick={(e) => e.stopPropagation()}
            onSubmit={submit}
            initial={{ scale: 0.94, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.94, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 320, damping: 26 }}
          >
            <h3 className={styles.title}>{t('post.report.title', locale)}</h3>
            <p className={styles.subtitle}>{t('post.report.subtitle', locale)}</p>

            <div className={styles.field}>
              <label className={styles.label} htmlFor="post-report-category">
                {t('post.report.categoryLabel', locale)}
              </label>
              <select
                id="post-report-category"
                className={styles.select}
                value={category}
                onChange={(e) => setCategory(e.target.value as PostReportCategory)}
                disabled={busy}
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {t(`post.report.category.${c}` as any, locale)}
                  </option>
                ))}
              </select>
            </div>

            <div className={styles.field}>
              <label className={styles.label} htmlFor="post-report-reason">
                {t('post.report.reasonLabel', locale)}
              </label>
              <input
                id="post-report-reason"
                className={styles.input}
                type="text"
                placeholder={t('post.report.reasonPlaceholder', locale)}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                disabled={busy}
                maxLength={200}
                required
              />
            </div>

            <div className={styles.field}>
              <label className={styles.label} htmlFor="post-report-desc">
                {t('post.report.descriptionLabel', locale)}
              </label>
              <textarea
                id="post-report-desc"
                className={styles.textarea}
                placeholder={t('post.report.descriptionPlaceholder', locale)}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={busy}
                maxLength={1000}
                rows={3}
              />
            </div>

            <div className={styles.actions}>
              <button type="button" className={styles.btnGhost} onClick={onClose} disabled={busy}>
                {t('post.report.cancel', locale)}
              </button>
              <button
                type="submit"
                className={styles.btnDanger}
                disabled={busy || !reason.trim()}
              >
                {busy ? t('post.report.submitting', locale) : t('post.report.submit', locale)}
              </button>
            </div>
          </motion.form>
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}
