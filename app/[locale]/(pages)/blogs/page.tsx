import type { Metadata } from 'next'
import Link from 'next/link'

import BlogCard from '@/components/blogs/BlogCard'
import BlogListPanel from '@/components/blogs/BlogListPanel'
import BlogsLayout from '@/components/blogs/BlogsLayout'
import styles from '@/components/blogs/blogsLayout.module.css'
import { buildBlogPageMetadata } from '@/lib/blogs/buildBlogMetadata'
import { fetchBlogCategories, fetchBlogs } from '@/lib/api/blogs'
import { blogListPath, blogPaginationPath } from '@/lib/blogs/paths'
import { getIsBlogsHost } from '@/lib/blogs/getIsBlogsHost'
import { DEFAULT_LOCALE, isSupportedLocale, type SupportedLocale } from '@/lib/localization'

type PageProps = {
  params: Promise<{ locale: string }>
  searchParams: Promise<{ page?: string }>
}

function blogListCopy(locale: SupportedLocale) {
  return locale === 'ar'
    ? {
        title: 'اكتشف المدونة',
        subtitle: 'مقالات ونصائح من فريق أناناس',
        empty: 'لا توجد مقالات منشورة حالياً.',
        prev: 'السابق',
        next: 'التالي',
      }
    : {
        title: 'Discover Blog',
        subtitle: 'Articles and tips from the Ananas team',
        empty: 'No published articles yet.',
        prev: 'Previous',
        next: 'Next',
      }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale: localeRaw } = await params
  const locale: SupportedLocale = isSupportedLocale(localeRaw) ? localeRaw : DEFAULT_LOCALE
  const isBlogsHost = await getIsBlogsHost()
  const copy = blogListCopy(locale)

  return buildBlogPageMetadata({
    locale,
    title: copy.title,
    description: copy.subtitle,
    pathname: blogListPath(locale, isBlogsHost),
    type: 'website',
  })
}

export default async function BlogsIndexPage({ params, searchParams }: PageProps) {
  const { locale: localeRaw } = await params
  const locale: SupportedLocale = isSupportedLocale(localeRaw) ? localeRaw : DEFAULT_LOCALE
  const { page: pageRaw } = await searchParams
  const page = Math.max(1, Number(pageRaw) || 1)
  const copy = blogListCopy(locale)
  const isBlogsHost = await getIsBlogsHost()

  const [categories, blogsResult] = await Promise.all([
    fetchBlogCategories(locale, { revalidateSeconds: 300 }),
    fetchBlogs(locale, { page, revalidateSeconds: 120 }),
  ])

  const { data: blogs, meta } = blogsResult
  const currentPage = meta?.current_page ?? page
  const lastPage = meta?.last_page ?? 1

  return (
    <BlogsLayout locale={locale} variant="list">
      <BlogListPanel
        locale={locale}
        isBlogsHost={isBlogsHost}
        title={copy.title}
        subtitle={copy.subtitle}
        categories={categories}
        showCategoryCards
      >
        {blogs.length === 0 ? (
          <p className={styles.emptyState}>{copy.empty}</p>
        ) : (
          <div className={styles.postGrid}>
            {blogs.map((blog) => (
              <BlogCard key={blog.id} blog={blog} locale={locale} isBlogsHost={isBlogsHost} />
            ))}
          </div>
        )}

        {lastPage > 1 ? (
          <nav className={styles.pagination} aria-label="Pagination">
            {currentPage > 1 ? (
              <Link
                href={blogPaginationPath(locale, currentPage - 1, isBlogsHost)}
                className={styles.pageLink}
              >
                {copy.prev}
              </Link>
            ) : null}
            <span className={`${styles.pageLink} ${styles.pageLinkActive}`}>{currentPage}</span>
            {currentPage < lastPage ? (
              <Link
                href={blogPaginationPath(locale, currentPage + 1, isBlogsHost)}
                className={styles.pageLink}
              >
                {copy.next}
              </Link>
            ) : null}
          </nav>
        ) : null}
      </BlogListPanel>
    </BlogsLayout>
  )
}
