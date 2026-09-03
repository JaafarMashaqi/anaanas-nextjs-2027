import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { BsCalendar3, BsChat, BsEye } from 'react-icons/bs'

import BlogComments from '@/components/blogs/BlogComments'
import BlogLikeButton from '@/components/blogs/BlogLikeButton'
import BlogSidebar from '@/components/blogs/BlogSidebar'
import BlogViewTracker from '@/components/blogs/BlogViewTracker'
import BlogsLayout from '@/components/blogs/BlogsLayout'
import styles from '@/components/blogs/blogsLayout.module.css'
import defaultUserAvatar from '@/assets/images/avatar/user-default.svg'
import { fetchBlogBySlug, fetchBlogs } from '@/lib/api/blogs'
import {
  buildBlogArticleJsonLd,
  buildBlogPageMetadata,
} from '@/lib/blogs/buildBlogMetadata'
import {
  blogCategoryPath,
  blogListPath,
  blogPostPath,
} from '@/lib/blogs/paths'
import { getIsBlogsHost } from '@/lib/blogs/getIsBlogsHost'
import { DEFAULT_LOCALE, isSupportedLocale, type SupportedLocale } from '@/lib/localization'
import { resolveMediaUrl } from '@/lib/media/resolveMediaUrl'
import { resolveSeoOrigin } from '@/lib/seo/resolveSeoOrigin'

type PageProps = {
  params: Promise<{ locale: string; slug: string }>
}

function formatDate(iso: string | null | undefined, locale: SupportedLocale) {
  if (!iso) return ''
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return ''
  return date.toLocaleDateString(locale === 'ar' ? 'ar' : 'en-GB', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale: localeRaw, slug } = await params
  const locale: SupportedLocale = isSupportedLocale(localeRaw) ? localeRaw : DEFAULT_LOCALE
  const isBlogsHost = await getIsBlogsHost()
  const blog = await fetchBlogBySlug(slug, locale, { revalidateSeconds: 120 })

  if (!blog) {
    return buildBlogPageMetadata({
      locale,
      title: 'Not found',
      description: '',
      pathname: blogPostPath(locale, slug, isBlogsHost),
      robots: { index: false, follow: false },
    })
  }

  const title = blog.seo_title || blog.title
  const description = blog.seo_description || blog.excerpt

  return buildBlogPageMetadata({
    locale,
    title,
    description,
    pathname: blogPostPath(locale, blog.slug, isBlogsHost),
    type: 'article',
    imageUrl: blog.cover_image_url,
    publishedAt: blog.published_at,
  })
}

export default async function BlogDetailPage({ params }: PageProps) {
  const { locale: localeRaw, slug } = await params
  const locale: SupportedLocale = isSupportedLocale(localeRaw) ? localeRaw : DEFAULT_LOCALE
  const isBlogsHost = await getIsBlogsHost()

  const blog = await fetchBlogBySlug(slug, locale, { revalidateSeconds: 120 })

  if (!blog) {
    notFound()
  }

  const relatedResult = await fetchBlogs(locale, {
    category: blog.category?.slug,
    page: 1,
    revalidateSeconds: 120,
  })

  const origin = await resolveSeoOrigin()
  const cover = blog.cover_image_url ? resolveMediaUrl(blog.cover_image_url) : ''
  const blogsLabel = locale === 'ar' ? 'المدونة' : 'Blog'
  const authorAvatarRaw = blog.author?.avatar_url
  const authorAvatar = authorAvatarRaw
    ? resolveMediaUrl(authorAvatarRaw) || defaultUserAvatar.src
    : defaultUserAvatar.src

  const articleJsonLd = buildBlogArticleJsonLd({
    origin,
    locale,
    title: blog.seo_title || blog.title,
    description: blog.seo_description || blog.excerpt,
    slug: blog.slug,
    isBlogsHost,
    coverImageUrl: cover || blog.cover_image_url,
    publishedAt: blog.published_at,
    authorName: blog.author?.name,
  })

  return (
    <BlogsLayout locale={locale} variant="detail">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
      <BlogViewTracker blogId={blog.id} />

      <nav className={styles.crumbs} aria-label="Breadcrumb">
        <Link href={blogListPath(locale, isBlogsHost)} className={styles.crumbLink}>
          {blogsLabel}
        </Link>
        {blog.category ? (
          <>
            <span className={styles.crumbSep}>/</span>
            <Link
              href={blogCategoryPath(locale, blog.category.slug, isBlogsHost)}
              className={styles.crumbLink}
            >
              {blog.category.name}
            </Link>
          </>
        ) : null}
        <span className={styles.crumbSep}>/</span>
        <span className={styles.crumbNow}>{blog.title}</span>
      </nav>

      <div className={styles.detailGrid}>
        <article className={styles.articleShell}>
          {cover ? (
            <div className={styles.articleCover}>
              <Image
                src={cover}
                alt={blog.title}
                fill
                priority
                sizes="(max-width: 992px) 100vw, 66vw"
                unoptimized
              />
              <span className={styles.articleCoverGradient} aria-hidden />
            </div>
          ) : null}

          <div className={styles.articleBody}>
            <h1 className={styles.articleTitle}>{blog.title}</h1>

            <div className={styles.articleMetaRow}>
              {blog.published_at ? (
                <span className={styles.metaChip}>
                  <BsCalendar3 aria-hidden />
                  {formatDate(blog.published_at, locale)}
                </span>
              ) : null}
              {blog.category?.name ? (
                <Link
                  href={blogCategoryPath(locale, blog.category.slug, isBlogsHost)}
                  className={`${styles.metaChip} ${styles.metaChipAccent}`}
                >
                  {blog.category.name}
                </Link>
              ) : null}
              <span className={styles.metaChip}>
                <BsEye aria-hidden /> {blog.views_count}
              </span>
              <span className={styles.metaChip}>
                <BsChat aria-hidden /> {blog.comments_count}
              </span>
            </div>

            {blog.author?.name ? (
              <div className={styles.authorRow}>
                <Image
                  src={authorAvatar}
                  alt=""
                  width={44}
                  height={44}
                  className={styles.authorAvatar}
                  unoptimized
                />
                <span className={styles.authorName}>{blog.author.name}</span>
              </div>
            ) : null}

            {blog.content ? (
              <div
                className={styles.richContent}
                dangerouslySetInnerHTML={{ __html: blog.content }}
              />
            ) : null}

            {blog.images && blog.images.length > 0 ? (
              <div className={styles.gallery}>
                {blog.images.map((image) => {
                  const src = image.url ? resolveMediaUrl(image.url) : ''
                  if (!src) return null
                  return (
                    <div key={image.id} className={styles.galleryItem}>
                      <Image src={src} alt="" fill sizes="(max-width: 768px) 50vw, 25vw" unoptimized />
                    </div>
                  )
                })}
              </div>
            ) : null}

            <div className={styles.actions}>
              <BlogLikeButton
                blogId={blog.id}
                locale={locale}
                initialLiked={Boolean(blog.liked_by_me)}
                initialCount={blog.likes_count}
              />
            </div>

            <BlogComments
              blogId={blog.id}
              locale={locale}
              initialCount={blog.comments_count}
            />
          </div>
        </article>

        <BlogSidebar
          locale={locale}
          isBlogsHost={isBlogsHost}
          related={relatedResult.data}
          currentSlug={blog.slug}
        />
      </div>
    </BlogsLayout>
  )
}
