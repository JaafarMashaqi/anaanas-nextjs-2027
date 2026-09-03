import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { BsArrowLeft, BsArrowRight, BsClockHistory } from 'react-icons/bs'

import { fetchCmsPage, fetchCmsPages } from '@/lib/api/cmsPages'
import { DEFAULT_LOCALE, isSupportedLocale, type SupportedLocale } from '@/lib/localization'

import styles from './cmsPage.module.css'

type PageProps = {
  params: Promise<{ locale: string; slug: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale: localeRaw, slug } = await params
  const locale: SupportedLocale = isSupportedLocale(localeRaw) ? localeRaw : DEFAULT_LOCALE
  const page = await fetchCmsPage(slug, locale, { revalidateSeconds: 300 })

  if (!page) {
    return { title: 'Not found' }
  }

  const title = page.seo_title || page.title
  const description = page.seo_description || page.name

  return {
    title,
    description,
    alternates: { canonical: `/${locale}/p/${page.slug}` },
    openGraph: {
      title,
      description,
      type: 'website',
      url: `/${locale}/p/${page.slug}`,
    },
    twitter: {
      card: 'summary',
      title,
      description,
    },
  }
}

function formatUpdatedAt(iso: string | null | undefined, locale: SupportedLocale) {
  if (!iso) return null
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return null
  return date.toLocaleDateString(locale === 'ar' ? 'ar' : 'en-GB', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export default async function CmsDynamicPage({ params }: PageProps) {
  const { locale: localeRaw, slug } = await params
  const locale: SupportedLocale = isSupportedLocale(localeRaw) ? localeRaw : DEFAULT_LOCALE
  const isRtl = locale === 'ar'

  const [page, siblings] = await Promise.all([
    fetchCmsPage(slug, locale, { revalidateSeconds: 300 }),
    fetchCmsPages(locale, { revalidateSeconds: 300 }),
  ])

  if (!page) {
    notFound()
  }

  const Chevron = isRtl ? BsArrowLeft : BsArrowRight
  const homeLabel = isRtl ? 'الرئيسية' : 'Home'
  const updatedLabel = isRtl ? 'آخر تحديث' : 'Last updated'
  const relatedLabel = isRtl ? 'صفحات ذات صلة' : 'Related pages'
  const updatedAt = formatUpdatedAt(page.updated_at, locale)
  const otherPages = siblings.filter((item) => item.slug !== page.slug)
  const html = typeof page.content === 'string' ? page.content.trim() : ''

  return (
    <main className={styles.page} dir={isRtl ? 'rtl' : 'ltr'}>
      <div className={styles.frame}>
        <nav className={styles.crumbs} aria-label="breadcrumb">
          <Link href={`/${locale}`} className={styles.crumbHome}>
            {homeLabel}
          </Link>
          <Chevron className={styles.crumbSep} aria-hidden />
          <span className={styles.crumbNow}>{page.name}</span>
        </nav>

        <article className={styles.doc}>
          <div className={styles.docHead}>
            <h1 className={styles.docTitle}>{page.title}</h1>
            {page.seo_description ? (
              <p className={styles.docLead}>{page.seo_description}</p>
            ) : null}
            {updatedAt ? (
              <p className={styles.docMeta}>
                <BsClockHistory aria-hidden />
                <span>
                  {updatedLabel}: {updatedAt}
                </span>
              </p>
            ) : null}
          </div>

          <hr className={styles.rule} />

          {html ? (
            <div className={styles.prose} dangerouslySetInnerHTML={{ __html: html }} />
          ) : (
            <p className={styles.empty}>
              {isRtl ? 'لا يوجد محتوى لهذه الصفحة بعد.' : 'No content has been added to this page yet.'}
            </p>
          )}
        </article>

        {otherPages.length > 0 ? (
          <aside className={styles.related}>
            <p className={styles.relatedLabel}>{relatedLabel}</p>
            <div className={styles.relatedRow}>
              {otherPages.map((item) => (
                <Link key={item.id} href={`/${locale}/p/${item.slug}`} className={styles.relatedChip}>
                  {item.name}
                  <Chevron aria-hidden />
                </Link>
              ))}
            </div>
          </aside>
        ) : null}
      </div>
    </main>
  )
}
