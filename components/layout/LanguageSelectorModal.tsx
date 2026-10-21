'use client'

import clsx from 'clsx'
import { Modal, Spinner } from 'react-bootstrap'
import { BsStars } from 'react-icons/bs'

import { PLANNED_LOCALES, SUPPORTED_LOCALES } from '@/lib/localization'
import type { SupportedLocale } from '@/lib/localization'

import styles from './LanguageSelectorModal.module.css'

const PLANNED_NAMES: Record<(typeof PLANNED_LOCALES)[number], { ar: string; en: string }> = {
  tr: { ar: 'Türkçe', en: 'Türkçe' },
  es: { ar: 'Español', en: 'Español' },
  zh: { ar: '中文', en: '中文' },
  fr: { ar: 'Français', en: 'Français' },
}

type LocaleCopy = {
  modalTitle: string
  modalSubtitle: string
  actionHint: string
  confirmation: string
  currentLabel: string
  inactiveHint: string
}

type LocaleCardConfig = {
  title: string
  subtitle: string
  badge: string
}

type Props = {
  show: boolean
  onHide: () => void
  copy: LocaleCopy
  currentLocale: SupportedLocale
  isPending: boolean
  targetLocale: SupportedLocale | null
  localeCards: Record<SupportedLocale, LocaleCardConfig>
  onSwitchLocale: (locale: SupportedLocale) => void
}

export default function LanguageSelectorModal({
  show,
  onHide,
  copy,
  currentLocale,
  isPending,
  targetLocale,
  localeCards,
  onSwitchLocale,
}: Props) {
  return (
    <Modal
      show={show}
      onHide={onHide}
      centered
      animation
      dialogClassName={styles.dialog}
      contentClassName={styles.content}
      aria-labelledby="language-selector-title"
    >
      <Modal.Header closeButton className={styles.header}>
        <div className={clsx('w-100', styles.titleWrap)}>
          <div className={styles.icon}>
            <BsStars />
          </div>
          <Modal.Title id="language-selector-title" className={styles.title}>
            {copy.modalTitle}
          </Modal.Title>
        </div>
      </Modal.Header>

      <Modal.Body className={styles.body}>
        <p className={styles.subtitle}>{copy.modalSubtitle}</p>
        <p className={styles.hint}>{copy.actionHint}</p>

        <div className={styles.grid}>
          {SUPPORTED_LOCALES.map((locale) => {
            const card = localeCards[locale]
            const isActive = locale === currentLocale
            const showSpinner = isPending && targetLocale === locale
            return (
              <button
                key={locale}
                type="button"
                className={clsx(styles.card, { [styles.cardActive]: isActive })}
                onClick={() => onSwitchLocale(locale)}
                disabled={isActive || showSpinner}
              >
                <span className={styles.badge}>{card.badge}</span>
                <div>
                  <span className={styles.cardTitle}>{card.title}</span>
                  <span className={styles.cardSubtitle}>{card.subtitle}</span>
                </div>
                <div className={styles.status}>
                  {showSpinner ? (
                    <Spinner animation="border" size="sm" />
                  ) : isActive ? (
                    <span>{copy.currentLabel}</span>
                  ) : (
                    <span>{copy.inactiveHint}</span>
                  )}
                </div>
              </button>
            )
          })}
        </div>
        <p className={styles.hint}>
          {currentLocale === 'ar'
            ? `${PLANNED_LOCALES.map((code) => PLANNED_NAMES[code].ar).join('، ')} ظاهرة بالاسم، والقاموس غير جاهز.`
            : `${PLANNED_LOCALES.map((code) => PLANNED_NAMES[code].en).join(', ')} are listed by name. Their dictionaries are not ready.`}
        </p>
      </Modal.Body>

      {isPending && targetLocale ? (
        <Modal.Footer className={styles.footer}>
          <small className={styles.confirmation}>{copy.confirmation}</small>
        </Modal.Footer>
      ) : null}
    </Modal>
  )
}

