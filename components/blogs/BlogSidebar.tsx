import Image from 'next/image'
import Link from 'next/link'

import type { BlogPost } from '@/lib/api/blogs'
import { blogPostPath } from '@/lib/blogs/paths'
import type { SupportedLocale } from '@/lib/localization'
import { resolveMediaUrl } from '@/lib/media/resolveMediaUrl'

import styles from './blogsLayout.module.css'

type BlogSidebarProps = {
  locale: SupportedLocale
  isBlogsHost: boolean
  related: BlogPost[]
  currentSlug?: string
}

const BlogSidebar = ({ locale, isBlogsHost, related, currentSlug }: BlogSidebarProps) => {
  const items = related.filter((item) => item.slug !== currentSlug).slice(0, 5)
  const title = locale === 'ar' ? 'مقالات ذات صلة' : 'Related articles'

  if (items.length === 0) {
    return null
  }

  return (
    <aside className={styles.sidebarPanel}>
      <div className={styles.sidebarHead}>
        <h2 className={styles.sidebarTitle}>{title}</h2>
      </div>
      <div className={styles.sidebarBody}>
        <ul className={styles.relatedList}>
          {items.map((item) => {
            const thumb = item.cover_image_url ? resolveMediaUrl(item.cover_image_url) : ''
            return (
              <li key={item.id} className={styles.relatedItem}>
                <Link href={blogPostPath(locale, item.slug, isBlogsHost)}>
                  <div className={styles.relatedThumb}>
                    {thumb ? (
                      <Image src={thumb} alt="" fill sizes="72px" unoptimized />
                    ) : null}
                  </div>
                  <p className={styles.relatedTitle}>{item.title}</p>
                </Link>
              </li>
            )
          })}
        </ul>
      </div>
    </aside>
  )
}

export default BlogSidebar
