import type { ReactNode } from 'react'

import type { SupportedLocale } from '@/lib/localization'

import BlogCategoryCards from './BlogCategoryCards'
import BlogCategoryFilters from './BlogCategoryFilters'
import styles from './blogsLayout.module.css'

type BlogListPanelProps = {
  locale: SupportedLocale
  isBlogsHost: boolean
  title: string
  subtitle: string
  eyebrow?: string
  categories: Parameters<typeof BlogCategoryFilters>[0]['categories']
  activeCategorySlug?: string | null
  showCategoryCards?: boolean
  children: ReactNode
}

const BlogListPanel = ({
  locale,
  isBlogsHost,
  title,
  subtitle,
  eyebrow,
  categories,
  activeCategorySlug,
  showCategoryCards = false,
  children,
}: BlogListPanelProps) => {
  const defaultEyebrow = locale === 'ar' ? 'مدونة أناناس' : 'Ananas Blog'

  return (
    <div className={styles.panel}>
      <div className={styles.panelHero}>
        <span className={styles.eyebrow}>{eyebrow ?? defaultEyebrow}</span>
        <h1 className={styles.listTitle}>{title}</h1>
        <p className={styles.listSubtitle}>{subtitle}</p>
      </div>

      <div className={styles.panelBody}>
        {showCategoryCards ? (
          <BlogCategoryCards
            locale={locale}
            isBlogsHost={isBlogsHost}
            categories={categories}
            activeSlug={activeCategorySlug}
          />
        ) : null}

        <BlogCategoryFilters
          locale={locale}
          isBlogsHost={isBlogsHost}
          categories={categories}
          activeSlug={activeCategorySlug}
        />

        {children}
      </div>
    </div>
  )
}

export default BlogListPanel
