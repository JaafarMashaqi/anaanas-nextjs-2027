import TopHeader from './DesktopTopHeader'
import MobileTopHeader from './mobile/MobileTopHeader'

import styles from './ResponsiveTopHeader.module.css'

/**
 * Responsive entry-point for the global top header.
 *
 * Both headers are rendered server-side and toggled via CSS so there's no
 * hydration flash and no JS-based viewport sniffing required. The desktop
 * `<TopHeader />` is untouched — this wrapper only decides which of the two
 * trees is visible at the current viewport.
 */
const ResponsiveTopHeader = () => {
  return (
    <>
      <div className={`${styles.desktopOnly} ananas-desktop-only`}>
        <TopHeader />
      </div>
      <div className={`${styles.mobileOnly} ananas-mobile-only`}>
        <MobileTopHeader />
      </div>
    </>
  )
}

export default ResponsiveTopHeader
