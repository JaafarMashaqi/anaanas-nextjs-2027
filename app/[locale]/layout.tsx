import type { ChildrenType } from '@/types/component'
import { headers } from 'next/headers'

import FeaturedPopupAdLazy from '@/components/layout/FeaturedPopupAdLazy'
import MobileProductNav from '@/components/layout/mobile/MobileProductNav'
import NewPostRealtime from '@/components/realtime/NewPostRealtime'
import ResponsiveDailyUpdatesBanner from '@/components/layout/ResponsiveDailyUpdatesBanner'
import ResponsiveTopHeader from '@/components/layout/TopHeader/ResponsiveTopHeader'
import { isBlogsHostFromHeader } from '@/lib/blogs/paths'

const SocialLayout = async ({ children }: ChildrenType) => {
  const headersList = await headers()
  const isBlogsHost = isBlogsHostFromHeader(headersList.get('x-blogs-host'))

  return (
    <>
      <ResponsiveTopHeader />
      {!isBlogsHost ? <ResponsiveDailyUpdatesBanner /> : null}
      {children}
      {!isBlogsHost ? <MobileProductNav /> : null}
      {!isBlogsHost ? (
        <>
          <FeaturedPopupAdLazy />
          <NewPostRealtime />
        </>
      ) : null}
    </>
  )
}

export default SocialLayout
