'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'
import { useSession } from 'next-auth/react'

import defaultUserAvatar from '@/assets/images/avatar/user-default.svg'
import { useCurrentUser } from '@/context/useCurrentUser'
import { useClientLogout } from '@/hooks/useClientLogout'
import type { SupportedLocale } from '@/lib/localization'

import styles from './MobileProfileButton.module.css'

type Props = {
  locale: SupportedLocale
}

const MobileProfileButton = ({ locale }: Props) => {
  const { data: session, status } = useSession()
  const { avatarUrl } = useCurrentUser()
  const { logout, loggingOut } = useClientLogout(locale)
  const [open, setOpen] = useState(false)
  const ar = locale === 'ar'

  if (status !== 'authenticated') return null

  const displayName = session?.user?.name || session?.user?.email || (ar ? 'الملف الشخصي' : 'Profile')

  return (
    <div className={styles.menu}>
      <button type="button" className={styles.btn} aria-expanded={open} aria-label={displayName} onClick={() => setOpen((value) => !value)}>
        <span className={styles.ring}>
          <Image src={avatarUrl || defaultUserAvatar} alt="" width={28} height={28} unoptimized className={styles.avatar} />
        </span>
      </button>
      {open ? (
        <div className={styles.panel} role="menu">
          <Link href={`/${locale}/profile/feed`} role="menuitem">{ar ? 'ملفي' : 'My profile'}</Link>
          <Link href={`/${locale}/my-posts`} role="menuitem">{ar ? 'إعلاناتي' : 'My listings'}</Link>
          <Link href={`/${locale}/settings/account`} role="menuitem">{ar ? 'الإعدادات' : 'Settings'}</Link>
          <p>{ar ? 'المحفوظات والعضوية بلا صفحة بعد.' : 'Saved listings and membership have no page yet.'}</p>
          <button type="button" role="menuitem" onClick={() => void logout()} disabled={loggingOut}>
            {loggingOut ? (ar ? 'جارٍ الخروج' : 'Signing out') : ar ? 'تسجيل الخروج' : 'Log out'}
          </button>
        </div>
      ) : null}
    </div>
  )
}

export default MobileProfileButton
