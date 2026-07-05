'use client'

import { useEffect, useMemo, useState } from 'react'
import { Button, Modal, Spinner } from 'react-bootstrap'
import { BsStars } from 'react-icons/bs'
import {
  checkoutPromotion,
  fetchPromotionPackages,
  quotePromotion,
  type PromotionPackage,
} from '@/lib/api/promotion'
import type { SupportedLocale } from '@/lib/localization'
import styles from './FeaturePostModal.module.css'

type Props = {
  show: boolean
  onHide: () => void
  postId: number
  locale: SupportedLocale
  accessToken: string
  origin: string
}

const DAY_OPTIONS = Array.from({ length: 30 }, (_, i) => i + 1)

export default function FeaturePostModal({ show, onHide, postId, locale, accessToken, origin }: Props) {
  const [packages, setPackages] = useState<PromotionPackage[]>([])
  const [selectedPackageId, setSelectedPackageId] = useState<number | null>(null)
  const [days, setDays] = useState(7)
  const [loading, setLoading] = useState(false)
  const [quoteLoading, setQuoteLoading] = useState(false)
  const [totalUsd, setTotalUsd] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)

  const isAr = locale === 'ar'
  const selectedPackage = useMemo(
    () => packages.find((p) => p.id === selectedPackageId) ?? null,
    [packages, selectedPackageId],
  )

  useEffect(() => {
    if (!show) return
    setError(null)
    fetchPromotionPackages(locale).then((rows) => {
      setPackages(rows)
      if (rows[0]) setSelectedPackageId(rows[0].id)
    })
  }, [show, locale])

  useEffect(() => {
    if (!show || !selectedPackageId) return
    setQuoteLoading(true)
    quotePromotion(accessToken, { post_id: postId, package_id: selectedPackageId, days })
      .then((q) => setTotalUsd(q?.total_usd ?? null))
      .finally(() => setQuoteLoading(false))
  }, [show, selectedPackageId, days, postId, accessToken])

  const handlePay = async () => {
    if (!selectedPackageId) return
    setLoading(true)
    setError(null)
    const returnUrl = `${origin}/${locale}/promotion/paypal/return`
    const cancelUrl = `${origin}/${locale}/promotion/paypal/cancel`
    const result = await checkoutPromotion(accessToken, {
      post_id: postId,
      package_id: selectedPackageId,
      days,
      return_url: returnUrl,
      cancel_url: cancelUrl,
      locale,
    })
    setLoading(false)
    if (!result?.approval_url) {
      setError(isAr ? 'تعذر بدء الدفع. حاول مرة أخرى.' : 'Could not start checkout.')
      return
    }
    window.location.href = result.approval_url
  }

  return (
    <Modal show={show} onHide={onHide} centered size="lg" className={styles.modal}>
      <Modal.Header closeButton>
        <Modal.Title className="d-flex align-items-center gap-2">
          <BsStars className="text-warning" />
          {isAr ? 'تمييز الإعلان' : 'Feature your ad'}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p className="text-secondary mb-3">
          {isAr
            ? 'اختر الباقة ومدة التمييز. ستظهر مميزات الباقة فور تغيير اختيارك.'
            : 'Choose a package and duration. Features update as you select.'}
        </p>

        <div className={styles.packageGrid}>
          {packages.map((pkg) => (
            <button
              key={pkg.id}
              type="button"
              className={`${styles.packageCard} ${selectedPackageId === pkg.id ? styles.packageCardActive : ''}`}
              onClick={() => setSelectedPackageId(pkg.id)}
            >
              <div className={styles.packageName}>{pkg.name}</div>
              <div className={styles.packagePrice}>
                ${pkg.price_per_day_usd.toFixed(2)}
                <span>/{isAr ? 'يوم' : 'day'}</span>
              </div>
              <div className={styles.packageWeight}>x{pkg.appearance_weight}</div>
            </button>
          ))}
        </div>

        {selectedPackage && (
          <ul className={styles.featureList}>
            {selectedPackage.feature_labels.map((label) => (
              <li key={label}>{label}</li>
            ))}
          </ul>
        )}

        <div className={styles.daysWrap}>
          <div className={styles.daysLabel}>{isAr ? 'مدة التمييز' : 'Duration'}</div>
          <div className={styles.daysGrid}>
            {DAY_OPTIONS.map((d) => (
              <button
                key={d}
                type="button"
                className={`${styles.dayBtn} ${days === d ? styles.dayBtnActive : ''}`}
                onClick={() => setDays(d)}
              >
                {d}
              </button>
            ))}
          </div>
        </div>

        <div className={styles.totalRow}>
          <span>{isAr ? 'الإجمالي' : 'Total'}</span>
          <strong>
            {quoteLoading ? <Spinner size="sm" animation="border" /> : totalUsd != null ? `$${totalUsd.toFixed(2)} USD` : '—'}
          </strong>
        </div>

        {error && <div className="alert alert-danger py-2 mt-2 mb-0">{error}</div>}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="light" onClick={onHide}>
          {isAr ? 'إلغاء' : 'Cancel'}
        </Button>
        <Button variant="warning" onClick={handlePay} disabled={loading || !selectedPackageId}>
          {loading ? (
            <>
              <Spinner size="sm" animation="border" className="me-2" />
              {isAr ? 'جاري التحويل...' : 'Redirecting...'}
            </>
          ) : (
            (isAr ? 'الدفع عبر PayPal' : 'Pay with PayPal')
          )}
        </Button>
      </Modal.Footer>
    </Modal>
  )
}
