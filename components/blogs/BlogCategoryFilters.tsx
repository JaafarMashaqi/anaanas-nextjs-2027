'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

import type { BlogCategory } from '@/lib/api/blogs'
import {
  activeCategorySlugFromPathname,
  blogCategoryPath,
  blogListPath,
} from '@/lib/blogs/paths'
import type { SupportedLocale } from '@/lib/localization'

import styles from './blogsLayout.module.css'

type BlogCategoryFiltersProps = {
  locale: SupportedLocale
  isBlogsHost: boolean
  categories: BlogCategory[]
  activeSlug?: string | null
}

const BlogCategoryFilters = ({
  locale,
  isBlogsHost,
  categories,
  activeSlug: activeSlugProp,
}: BlogCategoryFiltersProps) => {
  const pathname = usePathname()
  const activeSlug = activeSlugProp ?? activeCategorySlugFromPathname(pathname)
  const allLabel = locale === 'ar' ? 'الكل' : 'All'
  const listHref = blogListPath(locale, isBlogsHost)
  const listActive = !activeSlug && (pathname === listHref || pathname === `${listHref}/`)

  if (categories.length === 0) {
    return null
  }

  return (
    <nav
      className={styles.filterRow}
      aria-label={locale === 'ar' ? 'تصنيفات المدونة' : 'Blog categories'}
    >
      <Link
        href={listHref}
        className={`${styles.filterPill} ${listActive ? styles.filterPillActive : ''}`}
      >
        {allLabel}
      </Link>

      {categories.map((category) => {
        const href = blogCategoryPath(locale, category.slug, isBlogsHost)
        const isActive = activeSlug === category.slug

        return (
          <Link
            key={category.id}
            href={href}
            className={`${styles.filterPill} ${isActive ? styles.filterPillActive : ''}`}
          >
            {category.name}
            {typeof category.blogs_count === 'number' ? (
              <span className={styles.filterCount}>{category.blogs_count}</span>
            ) : null}
          </Link>
        )
      })}
    </nav>
  )
}

export default BlogCategoryFilters
