import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import BlogCard from '@/components/blogs/BlogCard'
import BlogListPanel from '@/components/blogs/BlogListPanel'
import BlogsLayout from '@/components/blogs/BlogsLayout'
import styles from '@/components/blogs/blogsLayout.module.css'
import { buildBlogPageMetadata } from '@/lib/blogs/buildBlogMetadata'
import { fetchBlogCategories, fetchBlogs } from '@/lib/api/blogs'
import {
  blogCategoryPath,
  blogListPath,
  blogPaginationPath,
} from '@/lib/blogs/paths'
import { getIsBlogsHost } from '@/lib/blogs/getIsBlogsHost'
import { DEFAULT_LOCALE, isSupportedLocale, type SupportedLocale } from '@/lib/localization'

type PageProps = {
  params: Promise<{ locale: string; categorySlug: string }>
  searchParams: Promise<{ page?: string }>
}

function categoryCopy(locale: SupportedLocale, categoryName: string) {
  return locale === 'ar'
    ? {
        title: categoryName,
        subtitle: `مقالات في تصنيف ${categoryName}`,
        empty: 'لا توجد مقالات في هذا التصنيف.',
        prev: 'السابق',
        next: 'التالي',
        blogs: 'المدونة',
      }
    : {
        title: categoryName,
        subtitle: `Articles in ${categoryName}`,
        empty: 'No articles in this category.',
        prev: 'Previous',
        next: 'Next',
        blogs: 'Blog',
      }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale: localeRaw, categorySlug } = await params
  const locale: SupportedLocale = isSupportedLocale(localeRaw) ? localeRaw : DEFAULT_LOCALE
  const isBlogsHost = await getIsBlogsHost()
  const categories = await fetchBlogCategories(locale, { revalidateSeconds: 300 })
  const category = categories.find((item) => item.slug === categorySlug)

  if (!category) {
    return buildBlogPageMetadata({
      locale,
      title: 'Not found',
      description: '',
      pathname: blogCategoryPath(locale, categorySlug, isBlogsHost),
      robots: { index: false, follow: false },
    })
  }

  return buildBlogPageMetadata({
    locale,
    title: category.name,
    description: category.description || category.name,
    pathname: blogCategoryPath(locale, categorySlug, isBlogsHost),
    type: 'website',
  })
}

export default async function BlogCategoryPage({ params, searchParams }: PageProps) {
  const { locale: localeRaw, categorySlug } = await params
  const locale: SupportedLocale = isSupportedLocale(localeRaw) ? localeRaw : DEFAULT_LOCALE
  const { page: pageRaw } = await searchParams
  const page = Math.max(1, Number(pageRaw) || 1)
  const isBlogsHost = await getIsBlogsHost()

  const [categories, blogsResult] = await Promise.all([
    fetchBlogCategories(locale, { revalidateSeconds: 300 }),
    fetchBlogs(locale, { category: categorySlug, page, revalidateSeconds: 120 }),
  ])

  const category = categories.find((item) => item.slug === categorySlug)
  if (!category) {
    notFound()
  }

  const copy = categoryCopy(locale, category.name)
  const { data: blogs, meta } = blogsResult
  const currentPage = meta?.current_page ?? page
  const lastPage = meta?.last_page ?? 1

  return (
    <BlogsLayout locale={locale} variant="list">
      <nav className={styles.crumbs} aria-label="Breadcrumb">
        <Link href={blogListPath(locale, isBlogsHost)} className={styles.crumbLink}>
          {copy.blogs}
        </Link>
        <span className={styles.crumbSep}>/</span>
        <span className={styles.crumbNow}>{category.name}</span>
      </nav>

      <BlogListPanel
        locale={locale}
        isBlogsHost={isBlogsHost}
        title={copy.title}
        subtitle={copy.subtitle}
        eyebrow={locale === 'ar' ? 'تصنيف المدونة' : 'Blog category'}
        categories={categories}
        activeCategorySlug={categorySlug}
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
                href={blogPaginationPath(locale, currentPage - 1, isBlogsHost, categorySlug)}
                className={styles.pageLink}
              >
                {copy.prev}
              </Link>
            ) : null}
            <span className={`${styles.pageLink} ${styles.pageLinkActive}`}>{currentPage}</span>
            {currentPage < lastPage ? (
              <Link
                href={blogPaginationPath(locale, currentPage + 1, isBlogsHost, categorySlug)}
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
