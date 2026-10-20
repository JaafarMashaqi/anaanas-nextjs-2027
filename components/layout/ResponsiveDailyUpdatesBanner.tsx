'use client'

import { usePathname } from 'next/navigation'

import DailyUpdatesBanner from '@/components/layout/DailyUpdatesBanner'
import MobileDailyUpdatesBanner from '@/components/layout/mobile/MobileDailyUpdatesBanner'
import styles from '@/components/layout/ResponsiveDailyUpdatesBanner.module.css'

/**
 * Hidden on the locale home page. That page owns one greeting/campaign slot,
 * so this banner would repeat the same product announcement.
 */
const ResponsiveDailyUpdatesBanner = () => {
  const pathname = usePathname() || ''
  if (/^\/(ar|en)\/?$/.test(pathname)) return null
  return (
    <>
      <div className={styles.desktopOnly}>
        <DailyUpdatesBanner />
      </div>
      <div className={styles.mobileOnly}>
        <MobileDailyUpdatesBanner />
      </div>
    </>
  )
}

export default ResponsiveDailyUpdatesBanner
