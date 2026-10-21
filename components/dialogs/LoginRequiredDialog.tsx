'use client'
import { Modal, Button } from 'react-bootstrap'
import Link from 'next/link'
import { BsShieldLock, BsArrowRight, BsArrowLeft } from 'react-icons/bs'
import GateDialogGlobalStyles from './GateDialogGlobalStyles'
import { useEffect, useState } from 'react'
import clsx from 'clsx'
import { useParams } from 'next/navigation'
import { t } from '@/lib/translations'
import { DEFAULT_LOCALE, isSupportedLocale } from '@/lib/localization'
import type { SupportedLocale } from '@/lib/localization'

interface LoginRequiredDialogProps {
  show: boolean
  onHide: () => void
  title?: string
  message?: string
  loginButtonText?: string
  loginUrl?: string
  registerUrl?: string
  locale?: SupportedLocale
}

const LoginRequiredDialog = ({
  show,
  onHide,
  title,
  message,
  loginButtonText,
  loginUrl,
  registerUrl,
  locale: localeProp,
}: LoginRequiredDialogProps) => {
  const [isAnimating, setIsAnimating] = useState(false)
  const params = useParams<{ locale?: string }>()
  const localeFromParams = Array.isArray(params?.locale) ? params.locale[0] : params?.locale
  const locale: SupportedLocale = localeProp || (localeFromParams && isSupportedLocale(localeFromParams) ? localeFromParams : DEFAULT_LOCALE)
  
  // Build login URL with locale prefix
  const finalLoginUrl = loginUrl || (localeFromParams ? `/${localeFromParams}/auth/sign-in` : '/auth/sign-in')
  
  // Use provided props or fallback to translated defaults
  const finalTitle = title ?? t('dialog.loginRequired.title', locale)
  const finalMessage = message ?? t('dialog.loginRequired.message', locale)
  const finalLoginButtonText = loginButtonText ?? t('dialog.loginRequired.loginButton', locale)
  const ArrowIcon = locale === 'ar' ? BsArrowLeft : BsArrowRight
  const arrowClass = locale === 'ar' ? 'me-2' : 'ms-2'

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined
    if (show) {
      // Trigger animation after modal is shown
      timer = setTimeout(() => setIsAnimating(true), 40)
    } else {
      setIsAnimating(false)
    }
    return () => {
      if (timer) clearTimeout(timer)
    }
  }, [show])

  return (
    <Modal
      show={show}
      onHide={onHide}
      centered
      backdrop="static"
      keyboard={false}
      className="login-required-dialog"
      dialogClassName="login-required-dialog__dialog"
      contentClassName="login-required-dialog__content"
      aria-labelledby="login-required-title"
    >
      <Modal.Body className="p-0">
        <div className={clsx('login-required-dialog__wrapper', { 'animate-in': isAnimating })}>
          <div className="login-required-dialog__hero">
            <div className="login-required-dialog__icon-wrapper">
              <div className="login-required-dialog__icon">
                <BsShieldLock />
              </div>
              <div className="login-required-dialog__icon-glow"></div>
            </div>
            <div className="login-required-dialog__text-block">
              <h4 id="login-required-title" className="login-required-dialog__title">
                {finalTitle}
              </h4>
              <p className="login-required-dialog__message">{finalMessage}</p>
            </div>
          </div>

          <div className="login-required-dialog__actions">
            <Button
              variant="secondary"
              onClick={onHide}
              className="login-required-dialog__cancel-btn"
            >
              {t('dialog.loginRequired.cancelButton', locale)}
            </Button>
            <Link href={finalLoginUrl} passHref legacyBehavior>
              <Button
                as="a"
                variant="primary"
                className="login-required-dialog__login-btn"
              >
                {finalLoginButtonText}
                <ArrowIcon className={arrowClass} />
              </Button>
            </Link>
            {registerUrl ? (
              <Link href={registerUrl} className="login-required-dialog__cancel-btn btn btn-link">
                {locale === 'ar' ? 'إنشاء حساب' : 'Create an account'}
              </Link>
            ) : null}
          </div>
        </div>
      </Modal.Body>

      <GateDialogGlobalStyles />
    </Modal>
  )
}

export default LoginRequiredDialog

