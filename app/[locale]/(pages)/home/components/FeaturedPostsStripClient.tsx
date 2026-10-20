'use client'

import Link from 'next/link'
import Image from 'next/image'
import { BsStars } from 'react-icons/bs'
import { resolveMediaUrl } from '@/lib/media/resolveMediaUrl'
import { plainListingText } from '@/lib/text/plainListingText'
import styles from './FeaturedPostsStrip.module.css'
import type { SupportedLocale } from '@/lib/localization'

type PostRow = Record<string, unknown>

type Props = {
  locale: SupportedLocale
  posts: PostRow[]
}

export default function FeaturedPostsStripClient({ locale, posts }: Props) {
  const isAr = locale === 'ar'

  return (
    <section className={styles.strip} aria-label={isAr ? 'إعلانات مميزة' : 'Featured ads'}>
      <div className={styles.header}>
        <h2 className={styles.title}>
          <BsStars className="text-warning" aria-hidden />
          {isAr ? 'صفقات بارزة' : 'Hot deals'}
        </h2>
        <p className={styles.sub}>
          {isAr
            ? 'إعلانات مميزة من الخادم. لا تُحسب درجة سخونة.'
            : 'Featured ads from the server. No heat score is calculated.'}
        </p>
      </div>
      <div className={styles.scroller}>
        {posts.map((post) => {
          const id = Number(post.id)
          const title = plainListingText(String(post.title ?? ''))
          const image = resolveMediaUrl(
            (post.main_image as string) ||
              ((post.post_images as { image?: string }[] | undefined)?.[0]?.image ?? ''),
          )
          return (
            <Link key={id} href={`/${locale}/post/${id}`} className={styles.card} data-listing-id={id}>
              {image ? (
                <Image src={image} alt="" width={120} height={90} className={styles.thumb} unoptimized />
              ) : (
                <div className={styles.thumbPlaceholder} />
              )}
              <div className={styles.cardBody}>
                <span className={styles.badge}>{isAr ? 'مميز' : 'Featured'}</span>
                <div className={styles.cardTitle}>{title || `#${id}`}</div>
              </div>
            </Link>
          )
        })}
      </div>
    </section>
  )
}
