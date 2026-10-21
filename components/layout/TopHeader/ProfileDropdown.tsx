'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import {
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownToggle,
} from 'react-bootstrap'
import {
  BsGearFill,
  BsPersonFill,
  BsPower,
  BsStars,
} from 'react-icons/bs'

import defaultUserAvatar from '@/assets/images/avatar/ananas-host.svg'
import { useCurrentUser } from '@/context/useCurrentUser'
import { useClientLogout } from '@/hooks/useClientLogout'
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
  const { logout, loggingOut } = useClientLogout(locale)

  const { user: currentUser, avatarUrl: resolvedAvatarUrl } = useCurrentUser()
  const avatarUrl = currentUser ? resolvedAvatarUrl : null

  const t = STRINGS[locale] ?? STRINGS.ar

  const handleLogout = () => {
    void logout()
  }

  // ── Unauthenticated: render a login button ───────────────────────────────
  if (status === 'unauthenticated') {
    return (
      <Dropdown as="li" className="nav-item ms-2" align="end">
        <DropdownToggle className={`nav-link icon-md ${styles.toggle}`} aria-label={t.login}>
          <span className={styles.toggleAvatar}>
            <Image src={defaultUserAvatar} alt="" width={38} height={38} />
          </span>
        </DropdownToggle>
        <DropdownMenu className={styles.menu}>
          <DropdownItem as={Link} href={`/${locale}/auth/sign-in`} className={styles.item}>
            <span>{t.login}</span>
          </DropdownItem>
          <DropdownItem as={Link} href={`/${locale}/auth/sign-up`} className={styles.item}>
            <span>{locale === 'ar' ? 'إنشاء حساب' : 'Create an account'}</span>
          </DropdownItem>
          <DropdownItem as={Link} href={`/${locale}`} className={styles.item}>
            <span>{locale === 'ar' ? 'مسوداتي' : 'My drafts'}</span>
          </DropdownItem>
        </DropdownMenu>
      </Dropdown>
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
          <span>{locale === 'ar' ? 'إعلاناتي' : 'My listings'}</span>
        </DropdownItem>
        <DropdownItem as={Link} href={`/${locale}/saved`} className={styles.item}>
          <span>{locale === 'ar' ? 'المحفوظات' : 'Saved'}</span>
        </DropdownItem>
        <DropdownItem as={Link} href={`/${locale}/membership`} className={styles.item}>
          <span>{locale === 'ar' ? 'عضويتي' : 'Membership'}</span>
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
