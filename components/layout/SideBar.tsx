'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useParams, usePathname, useSearchParams } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { useEffect, useMemo, useRef, useState, useTransition } from 'react'
import { BsChevronRight, BsGlobe2, BsHouseDoorFill, BsJournalRichtext } from 'react-icons/bs'
import clsx from 'clsx'

import styles from './SideBar.module.css'

import { currentYear, developedBy, developedByLink } from '@/context/constants'
import { DEFAULT_LOCALE, isSupportedLocale } from '@/lib/localization'
import type { SupportedLocale } from '@/lib/localization'
import type { Section } from '@/lib/api/sections'
import { t } from '@/lib/translations'
import { playSidebarSpotlightChime } from '@/lib/ui/sidebarSpotlightChime'
import LanguageSelectorModal from './LanguageSelectorModal'

const SPOTLIGHT_INTERVAL_MS = 15_000
const SPOTLIGHT_DURATION_MS = 3200

function sectionTeaserCopy(locale: SupportedLocale, sectionName: string) {
  return t('sidebar.sectionTeaser', locale).replace(/\{\{section\}\}/g, sectionName)
}

type SideBarProps = {
  sections: Section[]
  locale?: string
}

const SideBar = ({ sections, locale: localeProp }: SideBarProps) => {
  const [showModal, setShowModal] = useState(false)
  const [targetLocale, setTargetLocale] = useState<SupportedLocale | null>(null)
  const [isPending, startTransition] = useTransition()
  const [spotlightSectionId, setSpotlightSectionId] = useState<number | null>(null)
  const spotlightClearRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const lastSpotlightPickRef = useRef<number | null>(null)
  const reduceMotion = useReducedMotion()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const params = useParams<{ locale?: string }>()
  const { status } = useSession()
  const isAuthed = status === 'authenticated'

  const currentLocale: SupportedLocale = useMemo(() => {
    if (localeProp && isSupportedLocale(localeProp)) {
      return localeProp
    }
    const localeFromParams = Array.isArray(params?.locale) ? params?.locale[0] : params?.locale
    if (isSupportedLocale(localeFromParams)) {
      return localeFromParams
    }
    if (pathname) {
      const segments = pathname.split('/').filter(Boolean)
      const maybeLocale = segments[0]
      if (isSupportedLocale(maybeLocale)) {
        return maybeLocale
      }
    }
    return DEFAULT_LOCALE
  }, [localeProp, params?.locale, pathname])

  useEffect(() => {
    if (sections.length === 0 || reduceMotion === true) {
      return
    }

    const clearSpotlightTimer = () => {
      if (spotlightClearRef.current) {
        clearTimeout(spotlightClearRef.current)
        spotlightClearRef.current = null
      }
    }

    const runSpotlight = () => {
      let idx = Math.floor(Math.random() * sections.length)
      if (sections.length > 1) {
        let guard = 0
        while (sections[idx].id === lastSpotlightPickRef.current && guard++ < 14) {
          idx = Math.floor(Math.random() * sections.length)
        }
      }
      const id = sections[idx].id
      lastSpotlightPickRef.current = id
      clearSpotlightTimer()
      setSpotlightSectionId(id)
      playSidebarSpotlightChime()
      spotlightClearRef.current = setTimeout(() => {
        setSpotlightSectionId(null)
        spotlightClearRef.current = null
      }, SPOTLIGHT_DURATION_MS)
    }

    const intervalId = window.setInterval(runSpotlight, SPOTLIGHT_INTERVAL_MS)

    return () => {
      window.clearInterval(intervalId)
      clearSpotlightTimer()
    }
  }, [sections, reduceMotion])

  const copy = useMemo(
    () =>
      currentLocale === 'ar'
        ? {
            triggerLabel: 'تغيير اللغة',
            modalTitle: 'اختر اللغة المفضلة لديك',
            modalSubtitle: 'سنقوم بتحديث المحتوى فوراً بناءً على اختيارك.',
            actionHint: 'اضغط على اللغة المطلوبة للاستمرار',
            confirmation: 'جارٍ تفعيل اللغة الجديدة...',
            currentLabel: 'اللغة الحالية',
            inactiveHint: 'انقر للتبديل',
          }
        : {
            triggerLabel: 'Change language',
            modalTitle: 'Choose your preferred language',
            modalSubtitle: 'The experience will instantly match your selection.',
            actionHint: 'Tap a card to continue',
            confirmation: 'Switching to the new language...',
            currentLabel: 'Current language',
            inactiveHint: 'Tap to switch',
          },
    [currentLocale],
  )

  const localeCards: Record<
    SupportedLocale,
    {
      title: string
      subtitle: string
      badge: string
    }
  > = {
    ar: {
      title: 'العربية',
      subtitle: 'تجربة عربية كاملة مع اتجاه RTL',
      badge: 'AR',
    },
    en: {
      title: 'English',
      subtitle: 'A clean LTR experience for global users',
      badge: 'EN',
    },
  }

  const buildLocalizedPath = (nextLocale: SupportedLocale) => {
    if (!pathname) {
      return `/${nextLocale}`
    }

    const segments = pathname.split('/').filter(Boolean)
    if (segments.length === 0) {
      segments.push(nextLocale)
    } else if (isSupportedLocale(segments[0])) {
      segments[0] = nextLocale
    } else {
      segments.unshift(nextLocale)
    }

    const nextPath = `/${segments.join('/')}`
    const queryString = searchParams?.toString()

    return queryString ? `${nextPath}?${queryString}` : nextPath
  }

  const handleSwitchLocale = (nextLocale: SupportedLocale) => {
    if (nextLocale === currentLocale) {
      return
    }
    setTargetLocale(nextLocale)

    const targetPath = buildLocalizedPath(nextLocale)
    startTransition(() => {
      location.href = targetPath
    })
  }

  const normalizedPath = pathname?.replace(/\/$/, '')
  const homeHref = `/${currentLocale}`
  const blogsHref = `/${currentLocale}/blogs`
  const profileHref = `/${currentLocale}/profile/feed`
  const myPostsHref = `/${currentLocale}/my-posts`

  const isHomeActive =
    normalizedPath === homeHref ||
    normalizedPath === `${homeHref}/home` ||
    normalizedPath === `${homeHref}/` ||
    normalizedPath === ''

  const isBlogsActive = normalizedPath?.startsWith(blogsHref) ?? false

  const asideLabel =
    currentLocale === 'ar' ? 'أقسام الإعلانات والتنقل' : 'Listing sections and navigation'

  return (
    <>
      <aside className={styles.shell} aria-label={asideLabel}>
        <div className={styles.glowOrbs} aria-hidden>
          <span className={`${styles.orb} ${styles.orb1}`} />
          <span className={`${styles.orb} ${styles.orb2}`} />
          <span className={`${styles.orb} ${styles.orb3}`} />
        </div>

        <div className={styles.panelHeader}>
          <div className={styles.header}>
            <h2 id="sidebar-sections-heading" className={styles.title}>
              <span className={styles.liveDot} aria-hidden />
              {t('sidebar.panelTitle', currentLocale)}
            </h2>
            <div className={styles.pulseStrip} aria-hidden>
              <span className={styles.pulseBar} />
              <span className={styles.pulseBar} />
              <span className={styles.pulseBar} />
              <span className={styles.pulseBar} />
            </div>
          </div>
          <p className={styles.panelHint}>{t('sidebar.panelHint', currentLocale)}</p>
        </div>

        <nav className={styles.nav} aria-labelledby="sidebar-sections-heading">
          <Link
            href={homeHref}
            className={clsx(styles.homeLink, { [styles.homeLinkActive]: isHomeActive })}
          >
            <span className={styles.homeIcon}>
              <BsHouseDoorFill aria-hidden />
            </span>
            <span>{currentLocale === 'ar' ? 'الرئيسية' : 'Home'}</span>
            <BsChevronRight className={styles.chevron} aria-hidden />
          </Link>

          <Link
            href={blogsHref}
            className={clsx(styles.homeLink, { [styles.homeLinkActive]: isBlogsActive })}
          >
            <span className={styles.homeIcon}>
              <BsJournalRichtext aria-hidden />
            </span>
            <span>{currentLocale === 'ar' ? 'المدونة' : 'Blog'}</span>
            <BsChevronRight className={styles.chevron} aria-hidden />
          </Link>

          {sections.length === 0 ? (
            <p className={styles.emptyState} role="status">
              {t('sidebar.noSections', currentLocale)}
            </p>
          ) : (
            <div className={styles.menuListScroll}>
              <h3 className="visually-hidden">{t('seo.sidebar.sectionsMap', currentLocale)}</h3>
              <ul className={styles.menuList}>
              {sections.map((section) => {
                const active =
                  normalizedPath?.startsWith(`/${currentLocale}/sections/${section.slug}`) ?? false
                const isLit = spotlightSectionId === section.id && reduceMotion !== true
                return (
                  <motion.li
                    key={section.id}
                    className={clsx(styles.sectionLi, isLit && styles.sectionLiSpotlight)}
                    style={{ transformOrigin: 'center center' }}
                    animate={
                      reduceMotion === true
                        ? {}
                        : isLit
                          ? {
                              y: -32,
                              scale: 1.14,
                              rotate: currentLocale === 'ar' ? 3.2 : -3.2,
                              boxShadow:
                                '0 28px 52px rgba(21, 21, 21, 0.22), 0 0 0 1px rgba(254, 203, 1, 0.45), 0 -2px 0 rgba(255, 255, 255, 0.65) inset',
                            }
                          : {
                              y: 0,
                              scale: 1,
                              rotate: 0,
                              boxShadow: '0 0 0 rgba(0, 0, 0, 0)',
                            }
                    }
                    transition={
                      isLit
                        ? { type: 'spring', stiffness: 260, damping: 16, mass: 0.78 }
                        : { type: 'spring', stiffness: 440, damping: 30 }
                    }
                  >
                    <AnimatePresence>
                      {isLit ? (
                        <motion.div
                          className={styles.teaserBubble}
                          aria-hidden
                          initial={{ opacity: 0, y: 16, scale: 0.9 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 10, scale: 0.93 }}
                          transition={{ type: 'spring', stiffness: 400, damping: 28 }}
                        >
                          {sectionTeaserCopy(currentLocale, section.name)}
                        </motion.div>
                      ) : null}
                    </AnimatePresence>
                    <Link
                      href={`/${currentLocale}/sections/${section.slug}`}
                      className={clsx(styles.sectionLink, { [styles.sectionLinkActive]: active })}
                    >
                      <span className={styles.iconSlot}>
                        {section.icon ? (
                          <Image
                            src={section.icon}
                            unoptimized
                            alt=""
                            width={24}
                            height={24}
                            className={styles.iconImg}
                          />
                        ) : (
                          <span className={styles.menuEmoji} aria-hidden>
                            ✦
                          </span>
                        )}
                      </span>
                      <span className={styles.sectionName}>{section.name}</span>
                      <BsChevronRight className={styles.chevron} aria-hidden />
                    </Link>
                  </motion.li>
                )
              })}
              </ul>
            </div>
          )}
        </nav>

        <div className={styles.footer}>
          <Link href={`/${currentLocale}/contact`} className={styles.profileLink}>
            {t('sidebar.contactUs', currentLocale)}
          </Link>

          {isAuthed ? (
            <>
              <Link href={myPostsHref} className={styles.profileLink}>
                {currentLocale === 'ar' ? 'منشوراتي' : 'My posts'}
              </Link>

              <Link href={profileHref} className={styles.profileLink}>
                {t('sidebar.viewProfile', currentLocale)}
              </Link>
            </>
          ) : null}

          <button type="button" className={styles.langBtn} onClick={() => setShowModal(true)}>
            <BsGlobe2 aria-hidden />
            <span>{copy.triggerLabel}</span>
          </button>

          <p className={styles.copyright}>
            ©{currentYear}{' '}
            <a target="_blank" rel="noreferrer" href={developedByLink}>
              {developedBy}
            </a>
          </p>
        </div>
      </aside>

      <LanguageSelectorModal
        show={showModal}
        onHide={() => setShowModal(false)}
        copy={copy}
        currentLocale={currentLocale}
        isPending={isPending}
        targetLocale={targetLocale}
        localeCards={localeCards}
        onSwitchLocale={handleSwitchLocale}
      />
    </>
  )
}

export default SideBar
