import { headers } from 'next/headers'
import { Col } from 'react-bootstrap'
import FeedLayoutClient from '@/components/layout/FeedLayoutClient'
import SideBar from '@/components/layout/SideBar'
import { fetchSections } from '@/lib/api/sections'
import { callLaravel } from '@/lib/laravelClient'
import { DEFAULT_LOCALE, isSupportedLocale, type SupportedLocale } from '@/lib/localization'
import MyPostsClient from './MyPostsClient'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'My posts | منشوراتي',
}

async function loadMyPosts(locale: string) {
  try {
    const data = await callLaravel(`/api/posts/my-posts?land=${encodeURIComponent(locale)}&page=1&per_page=15`)
    return Array.isArray(data?.data) ? data.data : []
  } catch {
    return []
  }
}

export default async function MyPostsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: localeParam } = await params
  const locale: SupportedLocale = isSupportedLocale(localeParam) ? localeParam : DEFAULT_LOCALE
  const headersList = await headers()
  const headerLocale = headersList.get('x-locale') || locale

  const [sections, posts] = await Promise.all([
    fetchSections(headerLocale, { revalidateSeconds: 300 }),
    loadMyPosts(headerLocale),
  ])

  return (
    <FeedLayoutClient locale={locale} sidebar={<SideBar sections={sections} locale={locale} />}>
      <Col xs={12} lg={9} xl={8} className="mx-auto px-0">
        <MyPostsClient locale={locale} initialPosts={posts} />
      </Col>
    </FeedLayoutClient>
  )
}
