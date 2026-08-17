import { Suspense } from 'react'
import { headers } from 'next/headers'
import { Card, CardBody, CardHeader, CardTitle, Col, Row } from 'react-bootstrap'
import Feeds from './home/components/Feeds'
import Followers from './home/components/Followers'
import HomeBanner from './home/components/HomeBanner'
import Link from 'next/link'
import LoadContentButton from '@/components/LoadContentButton'
import type { Metadata } from 'next'
import FeedLayoutClient from '@/components/layout/FeedLayoutClient'
import SideBar from '@/components/layout/SideBar'
import { fetchSections } from '@/lib/api/sections'
import { t } from '@/lib/translations'
import { isSupportedLocale } from '@/lib/localization'
import type { SupportedLocale } from '@/lib/localization'
import { BsArrowUpRight, BsHammer, BsStars } from 'react-icons/bs'
import sideStyles from './homeSideCards.module.css'
import MarketPulseCard from './home/components/MarketPulseCard'
import TrendingAdsCard from './home/components/TrendingAdsCard'
import FutureRoadmapCard from './home/components/FutureRoadmapCard'
import MobileSectionsSwiper from './home/components/MobileSectionsSwiper'
import MobileAiPromoGrid from './home/components/MobileAiPromoGrid'
import MobileAIDashboard from './home/components/MobileAIDashboard'
import MobileLatestAdsSection from './home/components/MobileLatestAdsSection'
import HomeInsightsSkeleton from './home/components/HomeInsightsSkeleton'
import FeaturedPostsStrip from './home/components/FeaturedPostsStrip'
import { resolveCountryIdFromHeaders } from '@/lib/server/resolveCountryIdFromHeaders'
import CreatePostCardLazyClient from './home/components/CreatePostCardLazyClient'
import homeDiscoveryStyles from './homeDiscovery.module.css'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/auth'
import { getCountryByCodeCached } from '@/lib/server/getCountryByCodeCached'
import { buildHomeMetadata, buildHomeWebSiteJsonLd, resolveHomeCountryLabel } from '@/lib/seo/buildHomeMetadata'
import { getSiteOrigin } from '@/lib/seo/origin'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const uiLocale: SupportedLocale = isSupportedLocale(locale) ? locale : 'ar'
  const headersList = await headers()
  const countryCode = headersList.get('x-country')
  const country = countryCode ? await getCountryByCodeCached(countryCode) : null
  const canonicalPath = `/${uiLocale}`

  return buildHomeMetadata({
    uiLocale,
    country,
    countryCode,
    canonicalPath,
    headersList,
  })
}

/** Mobile AI discovery block is visible only for this account (preview). */
const MOBILE_AI_PREVIEW_USER_ID = '28775'
const MOBILE_AI_PREVIEW_USER_ID_2 = '61276'

const Home = async ({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>
  searchParams?: Promise<Record<string, string | string[] | undefined>>
}) => {
  const { locale } = await params
  const uiLocale: SupportedLocale = isSupportedLocale(locale) ? locale : 'ar'
  const headersList = await headers()
  const countryCode = headersList.get('x-country')
  const country = countryCode ? await getCountryByCodeCached(countryCode) : null
  const countryLabel = resolveHomeCountryLabel(uiLocale, country, countryCode)
  const origin = getSiteOrigin(headersList)
  const canonicalPath = `/${uiLocale}`
  const jsonLd = buildHomeWebSiteJsonLd({ origin, uiLocale, countryLabel, path: canonicalPath })

  const [session, sections, countryId] = await Promise.all([
    getServerSession(authOptions),
    fetchSections(locale, { revalidateSeconds: 300 }),
    resolveCountryIdFromHeaders(),
  ])
  const showMobileAiDashboard =   session?.user?.id === MOBILE_AI_PREVIEW_USER_ID || session?.user?.id === MOBILE_AI_PREVIEW_USER_ID_2
  const sp = (await searchParams) ?? {}
  const pageRaw = sp.page ? (Array.isArray(sp.page) ? sp.page[0] : sp.page) : undefined
  const page = pageRaw ? Number(pageRaw) : undefined

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <FeedLayoutClient locale={locale} sidebar={<SideBar sections={sections} locale={locale} />}>
        <Col md={8} lg={6} className="gap-4">
          <h1 className="visually-hidden">
            {t('home.a11y.visuallyHiddenTitle', uiLocale).replace('{{country}}', countryLabel)}
          </h1>

          <HomeBanner locale={uiLocale} />

          {/* CreatePostCard before discovery row; mobile order: Banner, CreatePost, discovery, latest ads, feeds */}
          <CreatePostCardLazyClient />

          <Row className={`g-3 ${homeDiscoveryStyles.discoveryRow} d-md-none`}>
            {showMobileAiDashboard ? (
              <Col md={12} lg={5} className={homeDiscoveryStyles.discoveryAi}>
                <MobileAIDashboard locale={uiLocale === 'en' ? 'en' : 'ar'} className="h-100" />
              </Col>
            ) : null}
            <Col md={12} lg={showMobileAiDashboard ? 7 : 12} className={homeDiscoveryStyles.discoverySections}>
              <MobileSectionsSwiper sections={sections} locale={uiLocale} />
              {showMobileAiDashboard ? <MobileAiPromoGrid locale={uiLocale} /> : null}
            </Col>
          </Row>

          <MobileLatestAdsSection locale={uiLocale} />

          <FeaturedPostsStrip locale={uiLocale} countryId={countryId} />

          <div className="vstack mt-3 gap-4">
            <Feeds
              listingsHeading={t('seo.home.feedListings', uiLocale)}
              filters={{
                page: Number.isFinite(page as any) && (page as number) > 0 ? (page as number) : undefined,
                basePath: `/${locale}`,
              }}
            />
          </div>
        </Col>

        <Col lg={3} md={3}>
          <aside className="vstack gap-4" aria-label={uiLocale === 'ar' ? 'رؤى السوق' : 'Market insights'}>
            <div className={sideStyles.sideStack}>
              <Suspense fallback={<HomeInsightsSkeleton />}>
                <MarketPulseCard locale={uiLocale} />
              </Suspense>
              <Suspense fallback={<HomeInsightsSkeleton />}>
                <TrendingAdsCard locale={uiLocale} />
              </Suspense>

              <FutureRoadmapCard locale={uiLocale} />
            </div>

          {/* <EliteCards locale={uiLocale} /> */}
          {/* links Cards */}
          {/* <div className={sideStyles.sideCard}>
            <h5 className={sideStyles.cardTitle}>{t('home.quickLinks', uiLocale)}</h5>
            <div className={sideStyles.sideStack}>
              <Link
                href={`/${uiLocale}/pages/auction`}
                className={`${sideStyles.listRow} text-decoration-none`}
              >
                <div className={sideStyles.listLeft}>
                  <div className={sideStyles.listIcon}>
                    <BsHammer />
                  </div>
                  <div>
                    <div className={sideStyles.listText}>{t('home.quick.auction.title', uiLocale)}</div>
                    <div className={sideStyles.smallMuted}>{t('home.quick.auction.hint', uiLocale)}</div>
                  </div>
                </div>
                <BsArrowUpRight />
              </Link>

              <Link
                href={`/${uiLocale}/pages/auction-posts`}
                className={`${sideStyles.listRow} text-decoration-none`}
              >
                <div className={sideStyles.listLeft}>
                  <div className={sideStyles.listIcon}>
                    <BsStars />
                  </div>
                  <div>
                    <div className={sideStyles.listText}>{t('home.quick.auctionPosts.title', uiLocale)}</div>
                    <div className={sideStyles.smallMuted}>{t('home.quick.auctionPosts.hint', uiLocale)}</div>
                  </div>
                </div>
                <BsArrowUpRight />
              </Link>
            </div>
          </div> */}

          {/* Keep these disabled as before */}
          <div className="d-none">
            <Followers />
          </div>

          <div className="d-none">
            <Card>
              <CardHeader className="pb-0 border-0">
                <CardTitle className="mb-0">{t('home.todaysNews', uiLocale)}</CardTitle>
              </CardHeader>
              <CardBody>
                <div className="mb-3">
                  <h6 className="mb-0">
                    <Link href="/blogs/details">Ten questions you should answer truthfully</Link>
                  </h6>
                  <small>2hr</small>
                </div>
                <div className="mb-3">
                  <h6 className="mb-0">
                    <Link href="/blogs/details">Five unbelievable facts about money</Link>
                  </h6>
                  <small>3hr</small>
                </div>
                <div className="mb-3">
                  <h6 className="mb-0">
                    <Link href="/blogs/details">Best Pinterest Boards for learning about business</Link>
                  </h6>
                  <small>4hr</small>
                </div>
                <div className="mb-3">
                  <h6 className="mb-0">
                    <Link href="/blogs/details">Skills that you can learn from business</Link>
                  </h6>
                  <small>6hr</small>
                </div>
                <LoadContentButton name={t('home.viewAllLatestNews', uiLocale)} />
              </CardBody>
            </Card>
          </div>
        </aside>
      </Col>
      </FeedLayoutClient>
    </>
  )
}

export default Home
