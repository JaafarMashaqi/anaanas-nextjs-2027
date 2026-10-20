import type { Metadata } from 'next'
import { headers } from 'next/headers'
import { Card, Col, Container, Row } from 'react-bootstrap'
import Link from 'next/link'
import PostCard from '@/components/cards/PostCard'
import PostImagesGallery from './PostImagesGallery'
import PostViewTracker from './PostViewTracker'
import { t } from '@/lib/translations'
import { DEFAULT_LOCALE, isSupportedLocale, type SupportedLocale } from '@/lib/localization'
import SimpleListingCard from './SimpleListingCard'
import PostNotFoundBlock from './PostNotFoundBlock'
import PostStatusBanner from './PostStatusBanner'
import styles from './postDetails.module.css'
import { resolveMediaUrl } from '@/lib/media/resolveMediaUrl'
import { iso2ForCountryId, resolveListingCurrency } from '@/lib/seo/countryCurrency'
import Image from 'next/image'
import defaultUserAvatar from '@/assets/images/avatar/user-default.svg'
import FeedLayoutClient from '@/components/layout/FeedLayoutClient'
import SideBar from '@/components/layout/SideBar'
import { fetchSections } from '@/lib/api/sections'
import { buildPostStructuredData } from '@/lib/seo/buildPostStructuredData'
import { getSiteOrigin } from '@/lib/seo/origin'
import { toAbsoluteUrl } from '@/lib/seo/absoluteUrl'
import { resolveCountryIdFromHeaders } from '@/lib/server/resolveCountryIdFromHeaders'
import { resolveListingCountryId } from '@/lib/server/resolveListingCountryId'
import {
  fetchPostDetailsSafe,
  fetchSuggestedPostsForMissingPost,
} from '@/lib/server/postSuggestions'
import { isPubliclyPublishedStatus } from '@/lib/postStatus'
import { getApiUrl } from '@/lib/api/config'

/** تحسين الأداء: إعادة توليد الصفحة كل 60ث مع بقاءها ثابتة قدر الإمكان */
export const revalidate = 60

async function fetchSimilarPosts(
  postId: string,
  locale: string,
  countryId?: number,
): Promise<any[]> {
  try {
    const countryQs =
      countryId != null && countryId > 0 ? `&country_id=${encodeURIComponent(String(countryId))}` : ''
    const res = await fetch(
      getApiUrl(
        `/api/posts/${encodeURIComponent(postId)}/similar?land=${encodeURIComponent(locale)}&limit=6${countryQs}`,
      ),
      { method: 'GET', cache: 'no-store', headers: { Accept: 'application/json' } },
    )
    if (!res.ok) return []
    const json = (await res.json()) as { success?: boolean; data?: any[] }
    return json?.success && Array.isArray(json.data) ? json.data : []
  } catch {
    return []
  }
}

async function fetchMoreFromSection(
  postId: string,
  locale: string,
  countryId?: number,
): Promise<any[]> {
  try {
    const countryQs =
      countryId != null && countryId > 0 ? `&country_id=${encodeURIComponent(String(countryId))}` : ''
    const res = await fetch(
      getApiUrl(
        `/api/posts/${encodeURIComponent(postId)}/more-from-section?land=${encodeURIComponent(locale)}&limit=8${countryQs}`,
      ),
      { method: 'GET', cache: 'no-store', headers: { Accept: 'application/json' } },
    )
    if (!res.ok) return []
    const json = (await res.json()) as { success?: boolean; data?: any[] }
    return json?.success && Array.isArray(json.data) ? json.data : []
  } catch {
    return []
  }
}

function formatDetailsPrice(
  price: unknown,
  currency: string | null,
  locale: SupportedLocale,
): string | null {
  if (price == null || price === '') return null
  const n = typeof price === 'number' ? price : Number(String(price).replace(/,/g, ''))
  if (!Number.isFinite(n) || n <= 0) return String(price)
  const formatted = new Intl.NumberFormat(locale === 'ar' ? 'ar-JO' : 'en-US', {
    maximumFractionDigits: 0,
  }).format(n)
  if (currency === 'JOD') return locale === 'ar' ? `${formatted} د.أ` : `${formatted} JOD`
  if (currency) return `${formatted} ${currency}`
  return formatted
}

function pickLocalizedName(value: any, locale: string): string {
  if (!value) return ''
  if (typeof value === 'string') return value
  if (typeof value === 'object') {
    if (typeof value[locale] === 'string') return value[locale]
    if (typeof value.en === 'string') return value.en
    if (typeof value.ar === 'string') return value.ar
  }
  try {
    return JSON.stringify(value)
  } catch {
    return String(value)
  }
}

function buildKeywords(post: any, locale: string): string[] {
  const parts = [
    'ANANAS',
    'أناناس',
    pickLocalizedName(post?.section?.name, locale),
    pickLocalizedName(post?.category?.name, locale),
    pickLocalizedName(post?.city?.name, locale),
    post?.title ? String(post.title).slice(0, 80) : '',
    post?.price != null && post?.price !== '' ? String(post.price) : '',
  ]
  return [...new Set(parts.map((s) => String(s || '').trim()).filter(Boolean))]
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; id: string }>
}): Promise<Metadata> {
  const { locale, id } = await params
  const headersList = await headers()
  const origin = getSiteOrigin(headersList)
  const canonicalPath = `/${locale}/post/${id}`

  const post = await fetchPostDetailsSafe(id, locale)
  if (!post) {
    const fallbackTitle = locale === 'ar' ? `إعلان غير متاح #${id} | ANANAS` : `Unavailable ad #${id} | ANANAS`
    const fallbackDescription =
      locale === 'ar'
        ? `الإعلان رقم ${id} غير متاح على أناناس.`
        : `Ad #${id} is not available on ANANAS.`
    return {
      title: fallbackTitle,
      description: fallbackDescription,
      alternates: { canonical: canonicalPath },
      robots: { index: false, follow: true },
    }
  }

  const publiclyVisible = isPubliclyPublishedStatus((post as any)?.status)

  try {
    const rawImg =
      (post as any)?.post_images?.[0]?.image_full_url ||
      (post as any)?.post_images?.[0]?.image ||
      (post as any)?.image ||
      ''
    const firstImage = resolveMediaUrl(rawImg)
    const ogImageUrl = firstImage ? toAbsoluteUrl(firstImage, origin) : undefined
    const price = (post as any)?.price != null && (post as any)?.price !== '' ? ` — ${(post as any).price}` : ''
    const baseTitle = (post as any)?.title
      ? `${(post as any).title}${price}`
      : locale === 'ar'
        ? `إعلان #${id}`
        : `Listing #${id}`
    const title = `${baseTitle} | ANANAS`
    const descSource = (post as any)?.description ? String((post as any).description) : ''
    const description =
      descSource.length > 0
        ? descSource.slice(0, 165) + (descSource.length > 165 ? '…' : '')
        : locale === 'ar'
          ? `إعلان رقم ${id} على أناناس — تفاصيل، صور، وتواصل مع المعلن.`
          : `Listing #${id} on ANANAS — details, photos, and contact.`
    const keywords = buildKeywords(post, locale)
    const sectionName = pickLocalizedName((post as any)?.section?.name, locale)
    const published = (post as any)?.created_at ? String((post as any).created_at) : undefined
    const modified = (post as any)?.updated_at ? String((post as any).updated_at) : published

    return {
      title,
      description,
      keywords,
      authors: (post as any)?.user?.name ? [{ name: String((post as any).user.name) }] : undefined,
      alternates: {
        canonical: `${origin}${canonicalPath}`,
        languages: {
          ar: `${origin}/ar/post/${id}`,
          en: `${origin}/en/post/${id}`,
        },
      },
      openGraph: {
        title,
        description,
        type: 'article',
        url: `${origin}${canonicalPath}`,
        siteName: 'ANANAS',
        locale: locale === 'ar' ? 'ar_AR' : 'en_US',
        publishedTime: published,
        modifiedTime: modified,
        section: sectionName || undefined,
        images: ogImageUrl
          ? [
              {
                url: ogImageUrl,
                width: 1200,
                height: 630,
                alt: (post as any)?.title ? String((post as any).title) : `ANANAS ${id}`,
              },
            ]
          : undefined,
      },
      twitter: {
        card: ogImageUrl ? 'summary_large_image' : 'summary',
        title,
        description,
        images: ogImageUrl ? [ogImageUrl] : undefined,
      },
      robots: publiclyVisible
        ? { index: true, follow: true, googleBot: { index: true, follow: true } }
        : { index: false, follow: true },
    }
  } catch {
    const fallbackTitle = locale === 'ar' ? `إعلان #${id} | ANANAS` : `Listing #${id} | ANANAS`
    return {
      title: fallbackTitle,
      alternates: { canonical: canonicalPath },
      robots: { index: false, follow: true },
    }
  }
}

async function PostNotFoundPage({
  locale,
  id,
  safeLocale,
}: {
  locale: string
  id: string
  safeLocale: SupportedLocale
}) {
  const countryId = await resolveCountryIdFromHeaders()
  const [suggestedPosts, sections] = await Promise.all([
    fetchSuggestedPostsForMissingPost({
      postId: id,
      locale,
      countryId,
      limit: 8,
    }),
    fetchSections(locale),
  ])

  const isRtl = safeLocale === 'ar'

  return (
    <div className={styles.pageMain} lang={safeLocale} dir={isRtl ? 'rtl' : 'ltr'}>
      <FeedLayoutClient locale={locale} sidebar={<SideBar sections={sections} locale={locale} />}>
        <Col lg={9} className={styles.feedCol}>
          <Container fluid className={styles.shell}>
            <PostNotFoundBlock locale={safeLocale} postId={id} />

            <section className={styles.moreSection} aria-label={t('post.notFound.mightInterestYou', safeLocale)}>
              <h2 className={styles.moreTitle}>{t('post.notFound.mightInterestYou', safeLocale)}</h2>
              {suggestedPosts.length === 0 ? (
                <p className={`${styles.emptyRelated} mb-0`}>{t('post.notFound.noSuggestions', safeLocale)}</p>
              ) : (
                <div className={styles.moreGrid}>
                  {suggestedPosts.map((p: any) => (
                    <SimpleListingCard key={p.id} post={p} locale={safeLocale} />
                  ))}
                </div>
              )}
            </section>
          </Container>
        </Col>
      </FeedLayoutClient>
    </div>
  )
}

export default async function PostDetailsPage({ params }: { params: Promise<{ locale: string; id: string }> }) {
  const { locale, id } = await params
  const safeLocale = isSupportedLocale(locale) ? locale : DEFAULT_LOCALE

  const post = await fetchPostDetailsSafe(id, locale)
  if (!post) {
    return <PostNotFoundPage locale={locale} id={id} safeLocale={safeLocale} />
  }

  const portalCountryId = await resolveCountryIdFromHeaders()
  const filterCountryId = resolveListingCountryId(post, portalCountryId)

  const [similarPosts, morePosts, sections] = await Promise.all([
    fetchSimilarPosts(id, locale, filterCountryId),
    fetchMoreFromSection(id, locale, filterCountryId),
    fetchSections(locale),
  ])

  const postImages: Array<{ url: string; alt?: string }> = Array.isArray((post as any)?.post_images)
    ? (post as any).post_images
        .map((img: any) => ({
          url: img?.image_full_url || img?.image,
          alt: (post as any)?.title,
        }))
        .filter((x: any) => Boolean(x.url))
    : []

  const postData = (post as any)?.post_data
  const attributesAndOptions = Array.isArray(postData?.attributes_and_options) ? postData.attributes_and_options : []

  /** منع تكرار صورة الغلاف داخل PostCard بعد عرض المعرض */
  const postForCard = { ...post, post_images: [], image: undefined }

  const isRtl = safeLocale === 'ar'
  const cityName = pickLocalizedName((post as any)?.city?.name, safeLocale)
  const sectionName = pickLocalizedName((post as any)?.section?.name, safeLocale)
  const categoryName = pickLocalizedName((post as any)?.category?.name, safeLocale)
  const sectionSlug = (post as any)?.section?.slug ? String((post as any).section.slug) : ''
  const categorySlug = (post as any)?.category?.slug ? String((post as any).category.slug) : ''
  const userName = (post as any)?.user?.name || (safeLocale === 'ar' ? 'صاحب الإعلان' : 'Publisher')
  const userPhone = (post as any)?.user?.mobile ? String((post as any).user.mobile) : ''
  const userEmail = (post as any)?.user?.email ? String((post as any).user.email) : ''
  const hasPrice = (post as any)?.price != null && (post as any)?.price !== ''
  const countryIso2 = String(
    (post as any)?.country?.iso2 ||
      (post as any)?.country?.iso_code ||
      iso2ForCountryId((post as any)?.country_id ?? (post as any)?.country?.id) ||
      '',
  ).toLowerCase()
  const countryName = pickLocalizedName((post as any)?.country?.name, safeLocale)
  const currencyCode = resolveListingCurrency({
    iso2: countryIso2,
    countryId: (post as any)?.country_id ?? (post as any)?.country?.id,
  })
  const priceLabel = hasPrice ? formatDetailsPrice((post as any).price, currencyCode, safeLocale) : null
  const isFeaturedActive = Boolean((post as any)?.is_featured_active || (post as any)?.promotion?.is_active)
  const listingTitle = (post as any)?.title
    ? String((post as any).title)
    : safeLocale === 'ar'
      ? `إعلان ${id}`
      : `Listing ${id}`
  const publisherAvatar =
    resolveMediaUrl(
      (post as any)?.user?.avatar_url ||
        (post as any)?.user?.avatar ||
        (post as any)?.user?.profile_image ||
        '',
    ) || defaultUserAvatar.src

  const headersList = await headers()
  const origin = getSiteOrigin(headersList)
  const homePath = `/${safeLocale}`
  const sectionPath = sectionSlug ? `/${safeLocale}/sections/${sectionSlug}` : homePath
  const categoryPath =
    sectionSlug && categorySlug ? `/${safeLocale}/sections/${sectionSlug}/${categorySlug}` : sectionPath

  const postUrl = `${origin}/${safeLocale}/post/${id}`
  const breadcrumbLabelHome = safeLocale === 'ar' ? 'الرئيسية' : 'Home'
  const breadcrumbLabelAd = safeLocale === 'ar' ? `إعلان ${id}` : `Ad ${id}`

  const crumbItems: Array<{ name: string; item: string }> = [
    { name: breadcrumbLabelHome, item: `${origin}${homePath}` },
  ]
  if (sectionSlug && sectionName) crumbItems.push({ name: sectionName, item: `${origin}${sectionPath}` })
  if (sectionSlug && categorySlug && categoryName) {
    crumbItems.push({ name: categoryName, item: `${origin}${categoryPath}` })
  }
  crumbItems.push({
    name: (post as any)?.title ? String((post as any).title) : breadcrumbLabelAd,
    item: postUrl,
  })

  const firstImageAbs = postImages[0]?.url
    ? toAbsoluteUrl(resolveMediaUrl(String(postImages[0].url)), origin)
    : undefined

  const structuredDataGraph = buildPostStructuredData({
    post: post as Record<string, unknown>,
    postId: id,
    title: (post as any)?.title ? String((post as any).title) : safeLocale === 'ar' ? `إعلان ${id}` : `Listing ${id}`,
    description: (post as any)?.description ? String((post as any).description) : undefined,
    postUrl,
    locale: safeLocale,
    imageUrl: firstImageAbs,
    price: hasPrice ? (post as any).price : null,
    categoryName: categoryName || undefined,
    sectionName: sectionName || undefined,
    sellerName: userName || undefined,
    cityName: cityName || undefined,
    countryName: countryName || undefined,
    countryIso2: countryIso2 || null,
    datePosted: (post as any)?.publish_date
      ? String((post as any).publish_date)
      : (post as any)?.created_at
        ? String((post as any).created_at)
        : null,
    breadcrumbItems: crumbItems,
  })

  const structuredData = JSON.stringify(structuredDataGraph)

  return (
    <div className={styles.pageMain} lang={safeLocale} dir={isRtl ? 'rtl' : 'ltr'}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: structuredData }} />

      <FeedLayoutClient locale={locale} sidebar={<SideBar sections={sections} locale={locale} />}>
        <Col lg={9} className={styles.feedCol}>
          <PostViewTracker postId={id} postUserId={(post as any)?.user_id} />

          <Container fluid className={styles.shell}>
            <nav className={styles.breadcrumbNav} aria-label={safeLocale === 'ar' ? 'مسار التنقل' : 'Breadcrumb'}>
              <ol className={styles.breadcrumbList}>
                <li className={styles.breadcrumbItem}>
                  <Link href={homePath} className={styles.breadcrumbLink}>
                    {breadcrumbLabelHome}
                  </Link>
                </li>
                {sectionSlug && sectionName ? (
                  <li className={styles.breadcrumbItem}>
                    <span className={styles.breadcrumbSep} aria-hidden>
                      /
                    </span>
                    <Link href={sectionPath} className={styles.breadcrumbLink}>
                      {sectionName}
                    </Link>
                  </li>
                ) : null}
                {sectionSlug && categorySlug && categoryName ? (
                  <li className={styles.breadcrumbItem}>
                    <span className={styles.breadcrumbSep} aria-hidden>
                      /
                    </span>
                    <Link href={categoryPath} className={styles.breadcrumbLink}>
                      {categoryName}
                    </Link>
                  </li>
                ) : null}
                <li className={styles.breadcrumbItem}>
                  <span className={styles.breadcrumbSep} aria-hidden>
                    /
                  </span>
                  <span className={styles.breadcrumbCurrent}>{breadcrumbLabelAd}</span>
                </li>
              </ol>
            </nav>

            <PostStatusBanner locale={safeLocale} status={(post as any)?.status} />


            <div className={styles.detailsHead}>
                      <div className={styles.detailsHeadTop}>
                        <div className={styles.detailsHeadBadges}>
                          <span className={styles.adIdBadge}>
                            {safeLocale === 'ar' ? `إعلان #${id}` : `Ad #${id}`}
                          </span>
                          {isFeaturedActive ? (
                            <span className={styles.featuredBadge}>
                              {safeLocale === 'ar' ? 'عرض مميز' : 'Featured'}
                            </span>
                          ) : null}
                          {postImages.length > 1 ? (
                            <span className={styles.photoCountBadge}>
                              {postImages.length} {safeLocale === 'ar' ? 'صور' : 'photos'}
                            </span>
                          ) : null}
                        </div>
                        {priceLabel ? (
                          <div className={styles.priceHero}>
                            <span className={styles.priceHeroLabel}>{safeLocale === 'ar' ? 'السعر' : 'Price'}</span>
                            <span className={styles.priceHeroValue}>{priceLabel}</span>
                          </div>
                        ) : null}
                      </div>

                      <h1 className={styles.listingTitle}>{listingTitle}</h1>

                      {(sectionName || categoryName || cityName) && (
                        <div className={styles.metaRow}>
                          {sectionName && sectionSlug ? (
                            <Link href={sectionPath} className={styles.metaChipAccent}>
                              {sectionName}
                            </Link>
                          ) : (
                            sectionName ? <span className={styles.metaChipAccent}>{sectionName}</span> : null
                          )}
                          {categoryName && sectionSlug && categorySlug ? (
                            <Link href={categoryPath} className={styles.metaChip}>
                              {categoryName}
                            </Link>
                          ) : (
                            categoryName ? <span className={styles.metaChip}>{categoryName}</span> : null
                          )}
                          {cityName ? <span className={styles.metaChip}>{cityName}</span> : null}
                        </div>
                      )}
                    </div>



            <article className={styles.article}>
              <Row className={`g-3 g-lg-4 ${styles.contentRow}`}>
                <Col lg={8} xl={8} className={styles.primaryCol}>
                  <div className={styles.listingPanel}>
                    {postImages.length > 0 ? (
                      <div className={styles.detailsGallery}>
                        <PostImagesGallery
                          images={postImages}
                          title={(post as any)?.title}
                          isRtl={isRtl}
                          variant="details"
                        />
                      </div>
                    ) : null}

              
                    <PostCard
                      post={postForCard}
                      detailsIntroMode="actionsOnly"
                      attributesAndOptions={
                        <Card className={styles.detailsCard}>
                          <div className={styles.detailsCardBody}>
                            <h2 className={styles.detailsTitle}>{t('post.detailsTitle', safeLocale)}</h2>

                            {attributesAndOptions.length === 0 ? (
                              <p className={styles.emptyAttributes}>{t('post.noAttributes', safeLocale)}</p>
                            ) : (
                              <dl className={styles.attrGrid}>
                                {attributesAndOptions.map((row: any, idx: number) => {
                                  const attrName =
                                    pickLocalizedName(row?.attribute?.name, locale) ||
                                    row?.attribute?.slug ||
                                    `#${idx + 1}`

                                  const singleOptName = pickLocalizedName(row?.option?.name, locale)
                                  const multiOptNames = Array.isArray(row?.options)
                                    ? row.options.map((o: any) => pickLocalizedName(o?.name, locale)).filter(Boolean)
                                    : []

                                  const value = singleOptName || (multiOptNames.length ? multiOptNames.join('، ') : '')

                                  return (
                                    <div className={styles.attrRow} key={idx}>
                                      <dt className={styles.attrName}>{attrName}</dt>
                                      <dd className={styles.attrValue}>{value || '—'}</dd>
                                    </div>
                                  )
                                })}
                              </dl>
                            )}
                          </div>
                        </Card>
                      }
                    />
                  </div>
                </Col>

                <Col lg={4} xl={4} className={styles.asideCol}>
                  <aside className={styles.asideSticky} aria-label={safeLocale === 'ar' ? 'الجانب' : 'Sidebar'}>
                    <Card className={styles.contactCard}>
                      <div className={styles.contactBody}>
                        <div className={styles.contactHeader}>
                          <Image
                            src={publisherAvatar}
                            alt=""
                            width={52}
                            height={52}
                            className={styles.contactAvatar}
                            unoptimized
                          />
                          <div className={styles.contactHeaderText}>
                            <h2 className={styles.contactTitle}>
                              {safeLocale === 'ar' ? 'معلومات المعلن' : 'Publisher'}
                            </h2>
                            <div className={styles.contactName}>{userName}</div>
                          </div>
                        </div>

                        <div className={styles.contactGrid}>
                          <div className={styles.contactItem}>
                            <span className={styles.contactItemLabel}>{safeLocale === 'ar' ? 'المدينة' : 'City'}</span>
                            <span className={styles.contactItemValue}>{cityName || '—'}</span>
                          </div>
                          <div className={styles.contactItem}>
                            <span className={styles.contactItemLabel}>{safeLocale === 'ar' ? 'الهاتف' : 'Phone'}</span>
                            <span className={styles.contactItemValue}>
                              {userPhone ? (
                                <a href={`tel:${userPhone}`} className={styles.contactLink}>
                                  {userPhone}
                                </a>
                              ) : (
                                '—'
                              )}
                            </span>
                          </div>
                          <div className={styles.contactItem}>
                            <span className={styles.contactItemLabel}>{safeLocale === 'ar' ? 'البريد' : 'Email'}</span>
                            <span className={styles.contactItemValue}>
                              {userEmail ? (
                                <a href={`mailto:${userEmail}`} className={styles.contactLink}>
                                  {userEmail}
                                </a>
                              ) : (
                                '—'
                              )}
                            </span>
                          </div>
                          {priceLabel ? (
                            <div className={`${styles.contactItem} ${styles.contactItemHighlight}`}>
                              <span className={styles.contactItemLabel}>{safeLocale === 'ar' ? 'السعر' : 'Price'}</span>
                              <span className={styles.contactPriceValue}>{priceLabel}</span>
                            </div>
                          ) : null}
                        </div>
                      </div>
                    </Card>

                    <h2 className={`${styles.sidebarTitle} d-none d-lg-block`}>{t('post.similarTitle', safeLocale)}</h2>
                    {similarPosts.length === 0 ? (
                      <p className={`${styles.emptyRelated} d-none d-lg-block mb-0`}>{t('post.noSimilar', safeLocale)}</p>
                    ) : (
                      <div className={`${styles.sidebarStack} d-none d-lg-flex flex-column`}>
                        {similarPosts.map((p: any) => (
                          <SimpleListingCard key={p.id} post={p} locale={safeLocale} />
                        ))}
                      </div>
                    )}
                  </aside>
                </Col>
              </Row>
            </article>

            <div className={`d-lg-none ${styles.moreSection}`}>
              <h2 className={styles.moreTitle}>{t('post.similarTitle', safeLocale)}</h2>
              {similarPosts.length === 0 ? (
                <p className={styles.emptyRelated}>{t('post.noSimilar', safeLocale)}</p>
              ) : (
                <div className={styles.moreGrid}>
                  {similarPosts.map((p: any) => (
                    <SimpleListingCard key={p.id} post={p} locale={safeLocale} />
                  ))}
                </div>
              )}
            </div>

            <section className={styles.moreSection} aria-label={t('post.moreFromSection', safeLocale)}>
              <h2 className={styles.moreTitle}>{t('post.moreFromSection', safeLocale)}</h2>
              {morePosts.length === 0 ? (
                <p className={`${styles.emptyRelated} mb-0`}>{t('post.noSimilar', safeLocale)}</p>
              ) : (
                <div className={styles.moreGrid}>
                  {morePosts.map((p: any) => (
                    <SimpleListingCard key={p.id} post={p} locale={safeLocale} />
                  ))}
                </div>
              )}
            </section>
          </Container>
        </Col>
      </FeedLayoutClient>
    </div>
  )
}
