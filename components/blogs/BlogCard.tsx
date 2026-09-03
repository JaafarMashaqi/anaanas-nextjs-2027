import Image from 'next/image'
import Link from 'next/link'
import { BsCalendar3, BsChat, BsEye, BsHeart } from 'react-icons/bs'

import type { BlogPost } from '@/lib/api/blogs'
import { blogCategoryPath, blogPostPath } from '@/lib/blogs/paths'
import type { SupportedLocale } from '@/lib/localization'
import { resolveMediaUrl } from '@/lib/media/resolveMediaUrl'

import styles from './blogsLayout.module.css'

type BlogCardProps = {
  blog: BlogPost
  locale: SupportedLocale
  isBlogsHost: boolean
}

function formatDate(iso: string | null | undefined, locale: SupportedLocale) {
  if (!iso) return ''
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return ''
  return date.toLocaleDateString(locale === 'ar' ? 'ar' : 'en-GB', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

const BlogCard = ({ blog, locale, isBlogsHost }: BlogCardProps) => {
  const cover = blog.cover_image_url ? resolveMediaUrl(blog.cover_image_url) : ''
  const href = blogPostPath(locale, blog.slug, isBlogsHost)

  return (
    <article className={styles.postCard}>
      <Link href={href} className={styles.postCardMedia}>
        {cover ? (
          <Image src={cover} alt="" width={480} height={300} unoptimized />
        ) : null}
        <span className={styles.postCardMediaOverlay} aria-hidden />
      </Link>

      <div className={styles.postCardBody}>
        {blog.category?.name ? (
          <Link
            href={
              blog.category.slug
                ? blogCategoryPath(locale, blog.category.slug, isBlogsHost)
                : href
            }
            className={styles.postCategory}
          >
            {blog.category.name}
          </Link>
        ) : null}

        <h2 className={styles.postTitle}>
          <Link href={href}>{blog.title}</Link>
        </h2>

        {blog.excerpt ? <p className={styles.postExcerpt}>{blog.excerpt}</p> : null}

        <div className={styles.postMeta}>
          {blog.published_at ? (
            <span className={styles.postMetaItem}>
              <BsCalendar3 aria-hidden />
              {formatDate(blog.published_at, locale)}
            </span>
          ) : null}
          <span className={styles.postMetaDivider} aria-hidden />
          <span className={styles.postMetaItem}>
            <BsEye aria-hidden /> {blog.views_count}
          </span>
          <span className={styles.postMetaItem}>
            <BsHeart aria-hidden /> {blog.likes_count}
          </span>
          <span className={styles.postMetaItem}>
            <BsChat aria-hidden /> {blog.comments_count}
          </span>
        </div>
      </div>
    </article>
  )
}

export default BlogCard
