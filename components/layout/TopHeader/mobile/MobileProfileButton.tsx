'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useSession } from 'next-auth/react'

import defaultUserAvatar from '@/assets/images/avatar/user-default.svg'
import { useCurrentUser } from '@/context/useCurrentUser'
import type { SupportedLocale } from '@/lib/localization'

import styles from './MobileProfileButton.module.css'

type Props = {
  locale: SupportedLocale
}

/**
 * Compact avatar shortcut to the profile feed — fits the tight mobile header row.
 * Logout and secondary links live in {@link ../MobileSectionsDrawer}.
 */
const MobileProfileButton = ({ locale }: Props) => {
  const { data: session, status } = useSession()
  const { avatarUrl } = useCurrentUser()

  if (status !== 'authenticated') return null

  const displayName = session?.user?.name || session?.user?.email || (locale === 'ar' ? 'الملف الشخصي' : 'Profile')
  const label = locale === 'ar' ? 'الملف الشخصي' : 'Profile'

  return (
    <Link
      href={`/${locale}/profile/feed`}
      className={styles.btn}
      aria-label={`${label}: ${displayName}`}
      title={label}
    >
      <span className={styles.ring}>
        <Image
          src={avatarUrl || defaultUserAvatar}
          alt={displayName}
          width={28}
          height={28}
          unoptimized
          className={styles.avatar}
        />
      </span>
    </Link>
  )
}

export default MobileProfileButton
