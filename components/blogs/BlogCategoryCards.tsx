import Link from 'next/link'
import { BsBook, BsGraphUp, BsLightbulb, BsStars } from 'react-icons/bs'

import type { BlogCategory } from '@/lib/api/blogs'
import { blogCategoryPath } from '@/lib/blogs/paths'
import type { SupportedLocale } from '@/lib/localization'

import styles from './blogsLayout.module.css'

type BlogCategoryCardsProps = {
  locale: SupportedLocale
  isBlogsHost: boolean
  categories: BlogCategory[]
  activeSlug?: string | null
}

const CATEGORY_ICONS: Record<string, typeof BsLightbulb> = {
  tips: BsLightbulb,
  market: BsGraphUp,
  guides: BsBook,
}

function categoryIcon(slug: string) {
  return CATEGORY_ICONS[slug] ?? BsStars
}

const BlogCategoryCards = ({
  locale,
  isBlogsHost,
  categories,
  activeSlug,
}: BlogCategoryCardsProps) => {
  const heading = locale === 'ar' ? 'تصفح حسب التصنيف' : 'Browse by category'

  if (categories.length === 0) {
    return null
  }

  return (
    <section className={styles.categoryCardsSection} aria-labelledby="blog-category-cards-title">
      <h2 id="blog-category-cards-title" className={styles.categoryCardsTitle}>
        {heading}
      </h2>
      <div className={styles.categoryGrid}>
        {categories.map((category) => {
          const href = blogCategoryPath(locale, category.slug, isBlogsHost)
          const isActive = activeSlug === category.slug
          const Icon = categoryIcon(category.slug)

          return (
            <Link
              key={category.id}
              href={href}
              className={styles.categoryCardLink}
            >
              <div className={`${styles.categoryCard} ${isActive ? styles.categoryCardActive : ''}`}>
                <span className={styles.categoryIcon} aria-hidden>
                  <Icon />
                </span>
                <p className={styles.categoryCardName}>{category.name}</p>
                {category.description ? (
                  <p className={styles.categoryCardDesc}>{category.description}</p>
                ) : null}
                {typeof category.blogs_count === 'number' ? (
                  <span className={styles.categoryCardCount}>
                    {locale === 'ar'
                      ? `${category.blogs_count} مقال`
                      : `${category.blogs_count} article${category.blogs_count === 1 ? '' : 's'}`}
                  </span>
                ) : null}
              </div>
            </Link>
          )
        })}
      </div>
    </section>
  )
}

export default BlogCategoryCards
