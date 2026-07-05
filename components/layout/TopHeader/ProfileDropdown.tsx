'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { signOut, useSession } from 'next-auth/react'
import { useState } from 'react'
import {
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownToggle,
} from 'react-bootstrap'
import {
  BsBoxArrowInRight,
  BsGearFill,
  BsPersonFill,
  BsPower,
  BsStars,
} from 'react-icons/bs'

import defaultUserAvatar from '@/assets/images/avatar/user-default.svg'
import { useCurrentUser } from '@/context/useCurrentUser'
import type { SupportedLocale } from '@/lib/localization'

import styles from './ProfileDropdown.module.css'

// ─── i18n ────────────────────────────────────────────────────────────────────

type Strings = {
  login: string
  user: string
  signingOut: string
  signOut: string
  viewProfile: string
  settings: string
}

const STRINGS: Record<SupportedLocale, Strings> = {
  ar: {
    login: 'تسجيل الدخول',
    user: 'مستخدم',
    signingOut: 'جاري تسجيل الخروج...',
    signOut: 'تسجيل الخروج',
    viewProfile: 'عرض الملف الشخصي',
    settings: 'الإعدادات والخصوصية',
  },
  en: {
    login: 'Login',
    user: 'User',
    signingOut: 'Signing out...',
    signOut: 'Sign out',
    viewProfile: 'View profile',
    settings: 'Settings & Privacy',
  },
}

// ─── component ───────────────────────────────────────────────────────────────

const ProfileDropdown = ({ locale = 'ar' }: { locale?: SupportedLocale }) => {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [loggingOut, setLoggingOut] = useState(false)

  const { user: currentUser, avatarUrl: resolvedAvatarUrl } = useCurrentUser()
  const avatarUrl = currentUser ? resolvedAvatarUrl : null

  const t = STRINGS[locale] ?? STRINGS.ar

  // ── Logout flow ──────────────────────────────────────────────────────────
  // 1. Hit the backend logout endpoint so the API session is invalidated and
  //    the auth-out notification (welcome-back / logout) can be recorded.
  // 2. Clear the NextAuth client session without auto-redirect so we can
  //    decide where to go ourselves.
  // 3. Redirect to the locale-aware sign-in page and refresh the router so
  //    server components re-render against the new (logged-out) state.
  const handleLogout = async () => {
    if (loggingOut) return
    setLoggingOut(true)
    try {
      try {
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        })
      } catch (err) {
        // Don't block client sign-out if the backend call fails.
        // eslint-disable-next-line no-console
        console.warn('Backend logout failed (continuing):', err)
      }

      await signOut({ redirect: false })
      router.replace(`/${locale}/auth/sign-in`)
      router.refresh()
    } finally {
      setLoggingOut(false)
    }
  }

  // ── Unauthenticated: render a login button ───────────────────────────────
  if (status === 'unauthenticated') {
    return (
      <>
        {/* Desktop: full-text pill button */}
        <Link
          className={`${styles.loginBtn} d-none d-sm-inline-flex`}
          href={`/${locale}/auth/sign-in`}
        >
          <BsBoxArrowInRight size={14} />
          <span>{t.login}</span>
        </Link>

        {/* Mobile: compact icon-only button */}
        <Link
          className={`${styles.loginIcon} d-inline-flex d-sm-none`}
          href={`/${locale}/auth/sign-in`}
          aria-label={t.login}
          title={t.login}
        >
          <BsBoxArrowInRight size={16} />
        </Link>
      </>
    )
  }

  if (status === 'loading') return null

  // ── Authenticated: full profile dropdown ─────────────────────────────────

  const displayName = session?.user?.name || session?.user?.email || t.user
  const subline = session?.user?.email || session?.user?.mobile || ''

  return (
    <Dropdown as="li" className="nav-item ms-2" align="end">
      <DropdownToggle className={`nav-link icon-md ${styles.toggle}`} aria-label={displayName}>
        <span className={styles.toggleAvatar}>
          {avatarUrl ? (
            <Image
              src={avatarUrl}
              alt={displayName}
              width={38}
              height={38}
              unoptimized
            />
          ) : (
            <Image src={defaultUserAvatar} alt={displayName} width={38} height={38} />
          )}
        </span>
      </DropdownToggle>

      <DropdownMenu className={styles.menu} aria-labelledby="profileDropdown">
        {/* Header card: avatar + name + email */}
        <div className={styles.header}>
          <span className={styles.headerAvatar}>
            {avatarUrl ? (
              <Image src={avatarUrl} alt={displayName} width={50} height={50} unoptimized />
            ) : (
              <Image src={defaultUserAvatar} alt={displayName} width={50} height={50} />
            )}
          </span>
          <div className={styles.headerText}>
            <Link href={`/${locale}/profile/feed`} className={styles.headerName}>
              {displayName}
            </Link>
            {subline && <span className={styles.headerSub}>{subline}</span>}
          </div>
        </div>

        {/* Primary CTA — View profile */}
        <DropdownItem
          as={Link}
          href={`/${locale}/profile/feed`}
          className={styles.viewProfileBtn}
        >
          <BsPersonFill aria-hidden />
          <span>{t.viewProfile}</span>
        </DropdownItem>

        <DropdownItem
          as={Link}
          href={`/${locale}/my-posts`}
          className={styles.item}
        >
          <BsStars aria-hidden />
          <span>{locale === 'ar' ? 'منشوراتي' : 'My posts'}</span>
        </DropdownItem>

        <div className={styles.list}>
          {/* Settings & Privacy (merged from the standalone header icon) */}
          <DropdownItem
            as={Link}
            href={`/${locale}/settings/account`}
            className={styles.item}
          >
            <span className={styles.itemIcon} aria-hidden>
              <BsGearFill />
            </span>
            <span className={styles.itemLabel}>{t.settings}</span>
          </DropdownItem>
        </div>

        <hr className={styles.divider} />

        <div className={styles.list}>
          {/* Sign out */}
          <DropdownItem
            as="button"
            type="button"
            className={`${styles.item} ${styles.signOut}`}
            onClick={(e) => {
              e.preventDefault()
              void handleLogout()
            }}
            disabled={loggingOut}
          >
            <span className={styles.itemIcon} aria-hidden>
              <BsPower />
            </span>
            <span className={styles.itemLabel}>
              {loggingOut ? t.signingOut : t.signOut}
            </span>
          </DropdownItem>
        </div>
      </DropdownMenu>
    </Dropdown>
  )
}

export default ProfileDropdown
