'use client'

import dynamic from 'next/dynamic'

const FeaturedPopupAd = dynamic(() => import('@/components/promotion/FeaturedPopupAd'), {
  ssr: false,
})

export default function FeaturedPopupAdLazy() {
  return <FeaturedPopupAd />
}
