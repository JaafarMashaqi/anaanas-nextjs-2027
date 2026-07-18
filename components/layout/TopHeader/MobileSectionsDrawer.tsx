'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Offcanvas } from 'react-bootstrap'
import { useEffect, useState, type CSSProperties } from 'react'
import {
  BsBoxArrowInRight,
  BsGearFill,
  BsGrid3X3GapFill,
  BsList,
  BsPersonFill,
  BsPower,
  BsStars,
  BsXLg,
} from 'react-icons/bs'
import { useSession } from 'next-auth/react'

import defaultUserAvatar from '@/assets/images/avatar/user-default.svg'
import { useAppData } from '@/context/AppDataContext'
import { useCurrentUser } from '@/context/useCurrentUser'
import { useClientLogout } from '@/hooks/useClientLogout'
import { resolveMediaUrl } from '@/lib/media/resolveMediaUrl'
import type { SupportedLocale } from '@/lib/localization'

import styles from './MobileSectionsDrawer.module.css'

type Props = {
  locale?: SupportedLocale
}

const COPY = {
  ar: {
    openMenu: 'فتح القائمة',
    close: 'إغلاق',
    menu: 'القائمة',
    menuSub: 'حسابك والأقسام',
    sections: 'الأقسام',
    sectionsSub: 'تصفح كل الفئات',
    noSections: 'لا توجد أقسام متاحة',
    profile: 'الملف',
    myPosts: 'منشوراتي',
    settings: 'الإعدادات',
    signOut: 'تسجيل الخروج',
    signingOut: 'جاري الخروج...',
    guestTitle: 'مرحباً بك في أناناس',
    guestSub: 'سجّل الدخول للوصول إلى ملفك ومنشوراتك',
    login: 'تسجيل الدخول',
    user: 'مستخدم',
  },
  en: {
    openMenu: 'Open menu',
    close: 'Close',
    menu: 'Menu',
    menuSub: 'Account & sections',
    sections: 'Sections',
    sectionsSub: 'Browse all categories',
    noSections: 'No sections available',
    profile: 'Profile',
    myPosts: 'My posts',
    settings: 'Settings',
    signOut: 'Sign out',
    signingOut: 'Signing out...',
    guestTitle: 'Welcome to Ananas',
    guestSub: 'Sign in to access your profile and listings',
    login: 'Sign in',
    user: 'User',
  },
} as const

/**
 * Mobile slide-in menu: account shortcuts (profile / logout) + full section list.
 */
const MobileSectionsDrawer = ({ locale = 'ar' }: Props) => {
  const [show, setShow] = useState(false)
  const { sections, loadingSections } = useAppData()
  const { status } = useSession()
  const { user: currentUser, avatarUrl } = useCurrentUser()
  const { logout, loggingOut } = useClientLogout(locale)

  const isArabic = locale === 'ar'
  const t = COPY[locale] ?? COPY.ar
  const isAuthed = status === 'authenticated'
  const isLoadingSession = status === 'loading'

  const displayName =
    currentUser?.name || currentUser?.username || (isAuthed ? t.user : '')
  const subline = currentUser?.email || currentUser?.mobile || ''

  useEffect(() => {
    if (!show) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [show])

  const handleOpen = () => setShow(true)
  const handleClose = () => setShow(false)

  const drawerStyle = {
    '--drawer-slide': isArabic ? '14px' : '-14px',
  } as CSSProperties

  const handleLogout = () => {
    void logout().then(() => handleClose())
  }

  return (
    <>
      <button
        type="button"
        onClick={handleOpen}
        aria-label={t.openMenu}
        className={`${styles.trigger} d-lg-none`}
      >
        <BsList aria-hidden />
      </button>

      <Offcanvas
        show={show}
        onHide={handleClose}
        placement={isArabic ? 'end' : 'start'}
        className={styles.drawer}
        backdropClassName={styles.backdrop}
        data-rtl={isArabic ? 'true' : 'false'}
      >
        <Offcanvas.Header className="align-items-center">
          <div className={styles.headerBrand}>
            <span className={styles.headerIcon} aria-hidden>
              <BsGrid3X3GapFill size={17} />
            </span>
            <div className={styles.headerText}>
              <div className={styles.headerTitle}>{t.menu}</div>
              <div className={styles.headerSub}>{t.menuSub}</div>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClose}
            aria-label={t.close}
            className={styles.closeBtn}
          >
            <BsXLg size={14} />
          </button>
        </Offcanvas.Header>

        <Offcanvas.Body>
          <div className={styles.scrollBody} style={drawerStyle}>
            {isLoadingSession ? (
              <div className={styles.accountSkeleton} aria-hidden />
            ) : isAuthed ? (
              <div className={styles.accountCard}>
                <div className={styles.accountTop}>
                  <Link
                    href={`/${locale}/profile/feed`}
                    onClick={handleClose}
                    className={styles.accountAvatar}
                    aria-label={t.profile}
                  >
                    <Image
                      src={avatarUrl || defaultUserAvatar}
                      alt={displayName}
                      width={52}
                      height={52}
                      unoptimized
                    />
                  </Link>
                  <div className={styles.accountMeta}>
                    <Link
                      href={`/${locale}/profile/feed`}
                      onClick={handleClose}
                      className={styles.accountName}
                    >
                      {displayName}
                    </Link>
                    {subline ? <span className={styles.accountSub}>{subline}</span> : null}
                  </div>
                </div>

                <div className={styles.quickGrid}>
                  <Link
                    href={`/${locale}/profile/feed`}
                    onClick={handleClose}
                    className={styles.quickLink}
                  >
                    <span className={styles.quickIcon}>
                      <BsPersonFill />
                    </span>
                    <span>{t.profile}</span>
                  </Link>
                  <Link
                    href={`/${locale}/my-posts`}
                    onClick={handleClose}
                    className={styles.quickLink}
                  >
                    <span className={styles.quickIcon}>
                      <BsStars />
                    </span>
                    <span>{t.myPosts}</span>
                  </Link>
                  <Link
                    href={`/${locale}/settings/account`}
                    onClick={handleClose}
                    className={styles.quickLink}
                  >
                    <span className={styles.quickIcon}>
                      <BsGearFill />
                    </span>
                    <span>{t.settings}</span>
                  </Link>
                </div>

                <button
                  type="button"
                  className={styles.logoutBtn}
                  onClick={handleLogout}
                  disabled={loggingOut}
                >
                  <BsPower size={16} aria-hidden />
                  <span>{loggingOut ? t.signingOut : t.signOut}</span>
                </button>
              </div>
            ) : (
              <div className={styles.accountCardGuest}>
                <div className={styles.guestTitle}>{t.guestTitle}</div>
                <div className={styles.guestSub}>{t.guestSub}</div>
                <Link
                  href={`/${locale}/auth/sign-in`}
                  onClick={handleClose}
                  className={styles.guestLoginBtn}
                >
                  <BsBoxArrowInRight size={16} aria-hidden />
                  <span>{t.login}</span>
                </Link>
              </div>
            )}

            <div className={styles.sectionsBlock}>
              <div className={styles.sectionsLabel}>{t.sections}</div>

              {loadingSections && (
                <div className={styles.skeletonList} aria-hidden>
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className={styles.skeletonItem} />
                  ))}
                </div>
              )}

              {!loadingSections && sections.length === 0 && (
                <div className={styles.empty}>{t.noSections}</div>
              )}

              {!loadingSections && sections.length > 0 && (
                <ul className={styles.sectionList}>
                  {sections.map((s, idx) => {
                    const href = `/${locale}/sections/${s.slug}`
                    const iconSrc = s.icon ? resolveMediaUrl(s.icon) : ''
                    return (
                      <li key={s.id}>
                        <Link
                          href={href}
                          onClick={handleClose}
                          className={styles.sectionItem}
                          style={{ animationDelay: `${Math.min(idx * 40, 280)}ms` }}
                        >
                          <span className={styles.sectionIcon}>
                            {iconSrc ? (
                              <Image
                                src={iconSrc}
                                alt=""
                                width={28}
                                height={28}
                                unoptimized
                              />
                            ) : (
                              <BsGrid3X3GapFill className="text-warning" size={20} />
                            )}
                          </span>
                          <span className={styles.sectionName}>{s.name}</span>
                          <BsBoxArrowInRight className={styles.sectionArrow} size={15} />
                        </Link>
                      </li>
                    )
                  })}
                </ul>
              )}
            </div>
          </div>
        </Offcanvas.Body>
      </Offcanvas>
    </>
  )
}

export default MobileSectionsDrawer
