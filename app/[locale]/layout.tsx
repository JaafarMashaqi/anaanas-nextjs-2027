import ResponsiveTopHeader from '@/components/layout/TopHeader/ResponsiveTopHeader'
import AnnouncementModalLazy from '@/components/layout/AnnouncementModalLazy'
import FeaturedPopupAdLazy from '@/components/layout/FeaturedPopupAdLazy'
import ResponsiveDailyUpdatesBanner from '@/components/layout/ResponsiveDailyUpdatesBanner'
import NewPostRealtime from '@/components/realtime/NewPostRealtime'
import type { ChildrenType } from '@/types/component'

const SocialLayout = ({ children }: ChildrenType) => {
  return (
    <>
      <ResponsiveTopHeader />
      <ResponsiveDailyUpdatesBanner />
      {children}
      <AnnouncementModalLazy />
      <FeaturedPopupAdLazy />
      <NewPostRealtime />
    </>
  )
}

export default SocialLayout
