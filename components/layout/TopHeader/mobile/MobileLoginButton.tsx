'use client'

import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { BsBoxArrowInRight } from 'react-icons/bs'

import type { SupportedLocale } from '@/lib/localization'

import styles from './MobileLoginButton.module.css'

type Props = {
  locale: SupportedLocale
}

/**
 * Compact mobile login affordance shown when the visitor is unauthenticated.
 * Routes to the same `/auth/sign-in` page used by the desktop `ProfileDropdown`
 * fallback, so behaviour stays in sync across the two header variants. We use
 * an icon-only round button to match the visual density of the other mobile
 * header actions (bell, chat, hamburger).
 */
const MobileLoginButton = ({ locale }: Props) => {
  const { status } = useSession()
  const isArabic = locale === 'ar'
  const label = isArabic ? 'تسجيل الدخول' : 'Login'

  if (status !== 'unauthenticated') return null

  return (
    <Link
      href={`/${locale}/auth/sign-in`}
      className={styles.btn}
      aria-label={label}
      title={label}
    >
      <BsBoxArrowInRight aria-hidden className={styles.icon} />
    </Link>
  )
}

export default MobileLoginButton
