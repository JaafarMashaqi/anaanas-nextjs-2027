'use client'

import Link from 'next/link'
import { useCallback, useMemo, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import {
  BsArrowRepeat,
  BsCollectionFill,
  BsHourglassSplit,
  BsPlusLg,
  BsStars,
  BsCheckCircleFill,
} from 'react-icons/bs'
import FeaturePostModal from '@/components/promotion/FeaturePostModal'
import { deletePost, fetchMyPosts, type PostRecord } from '@/lib/api/posts'
import type { SupportedLocale } from '@/lib/localization'
import { useSession } from 'next-auth/react'
import MyPostListItem from './MyPostListItem'
import styles from './myPosts.module.css'

type Filter = 'all' | 'active' | 'pending' | 'featured'

type Props = {
  locale: SupportedLocale
  initialPosts: PostRecord[]
}

const FILTER_KEYS: Filter[] = ['all', 'active', 'pending', 'featured']

function postMatchesFilter(post: PostRecord, filter: Filter): boolean {
  const status = String(post.status ?? '')
  const featured = Boolean(post.is_featured_active || post.promotion?.is_active)
  if (filter === 'active') return status === 'active'
  if (filter === 'pending') return status === 'pending_review' || status === 'pending'
  if (filter === 'featured') return featured
  return true
}

export default function MyPostsClient({ locale, initialPosts }: Props) {
  const { data: session } = useSession()
  const reducedMotion = useReducedMotion()

  const [posts, setPosts] = useState(initialPosts)
  const [filter, setFilter] = useState<Filter>('all')
  const [page, setPage] = useState(1)
  const [loadingMore, setLoadingMore] = useState(false)
  const [hasMore, setHasMore] = useState(initialPosts.length >= 15)
  const [featurePostId, setFeaturePostId] = useState<number | null>(null)

  const isAr = locale === 'ar'

  const copy = useMemo(
    () => ({
      title: isAr ? 'منشوراتي' : 'My listings',
      subtitle: isAr
        ? 'إدارة إعلاناتك، تعديلها، تمييزها، ومتابعة أدائها — كل شيء في مكان واحد.'
        : 'Manage, edit, feature, and track your listings — all in one place.',
      create: isAr ? 'إعلان جديد' : 'New listing',
      all: isAr ? 'الكل' : 'All',
      active: isAr ? 'نشط' : 'Active',
      pending: isAr ? 'قيد المراجعة' : 'Pending',
      featured: isAr ? 'مميز' : 'Featured',
      showing: isAr ? 'عرض' : 'Showing',
      of: isAr ? 'من' : 'of',
      emptyTitle: isAr ? 'لا توجد إعلانات هنا' : 'No listings here',
      emptyBody: isAr
        ? 'جرّب فلتراً آخر أو أنشئ إعلانك الأول الآن.'
        : 'Try another filter or create your first listing.',
      emptyCta: isAr ? 'أنشئ إعلاناً' : 'Create listing',
      loadMore: isAr ? 'تحميل المزيد' : 'Load more',
      loading: isAr ? 'جاري التحميل...' : 'Loading...',
    }),
    [isAr],
  )

  const counts = useMemo(() => {
    let active = 0
    let pending = 0
    let featured = 0
    for (const post of posts) {
      const status = String(post.status ?? '')
      const isFeatured = Boolean(post.is_featured_active || post.promotion?.is_active)
      if (status === 'active') active += 1
      if (status === 'pending_review' || status === 'pending') pending += 1
      if (isFeatured) featured += 1
    }
    return { all: posts.length, active, pending, featured }
  }, [posts])

  const filtered = useMemo(() => posts.filter((post) => postMatchesFilter(post, filter)), [posts, filter])

  const statCards = useMemo(
    () =>
      [
        { key: 'all' as Filter, label: copy.all, value: counts.all, icon: BsCollectionFill, iconClass: styles.statCardIcon_all },
        { key: 'active' as Filter, label: copy.active, value: counts.active, icon: BsCheckCircleFill, iconClass: styles.statCardIcon_active },
        { key: 'pending' as Filter, label: copy.pending, value: counts.pending, icon: BsHourglassSplit, iconClass: styles.statCardIcon_pending },
        { key: 'featured' as Filter, label: copy.featured, value: counts.featured, icon: BsStars, iconClass: styles.statCardIcon_featured },
      ] as const,
    [copy, counts],
  )

  const filterLabels: Record<Filter, string> = {
    all: copy.all,
    active: copy.active,
    pending: copy.pending,
    featured: copy.featured,
  }

  const loadMore = async () => {
    setLoadingMore(true)
    const nextPage = page + 1
    try {
      const rows = await fetchMyPosts({ page: nextPage, perPage: 15, locale })
      const list = Array.isArray(rows?.data) ? rows.data : []
      if (!list.length) {
        setHasMore(false)
        return
      }
      setPosts((prev) => [...prev, ...list])
      setPage(nextPage)
      if (list.length < 15) setHasMore(false)
    } finally {
      setLoadingMore(false)
    }
  }

  const handleDelete = useCallback(
    async (postId: number) => {
      const token = (session as any)?.accessToken
      if (!token) return
      const ok = await deletePost(String(postId), token)
      if (ok) setPosts((prev) => prev.filter((p) => Number(p.id) !== postId))
    },
    [session],
  )

  return (
    <main className={styles.page} dir={isAr ? 'rtl' : 'ltr'}>
      <div className={styles.container}>
        <motion.section
          className={styles.shell}
          initial={reducedMotion ? false : { opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
        >
          {/* Hero */}
          <div className={styles.hero}>
            <div className={styles.heroMesh} aria-hidden />
            <div className={styles.heroInner}>
              <div className={styles.heroTop}>
                <div className={styles.heroMain}>
                  <div className={styles.heroIcon} aria-hidden>
                    <BsCollectionFill />
                  </div>
                  <div className={styles.heroText}>
                    <h1 className={styles.heroTitle}>{copy.title}</h1>
                    <p className={styles.heroSubtitle}>{copy.subtitle}</p>
                  </div>
                </div>
                <Link href={`/${locale}`} className={styles.createBtn}>
                  <BsPlusLg size={14} aria-hidden />
                  {copy.create}
                </Link>
              </div>

              <div className={styles.statGrid}>
                {statCards.map((card, i) => {
                  const Icon = card.icon
                  const isActive = filter === card.key
                  return (
                    <motion.button
                      key={card.key}
                      type="button"
                      className={`${styles.statCard} ${isActive ? styles.statCardActive : ''}`}
                      onClick={() => setFilter(card.key)}
                      initial={reducedMotion ? false : { opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.08 + i * 0.05, duration: 0.3 }}
                      whileHover={reducedMotion ? undefined : { y: -2 }}
                      whileTap={reducedMotion ? undefined : { scale: 0.98 }}
                    >
                      <span className={`${styles.statCardIcon} ${card.iconClass}`}>
                        <Icon aria-hidden />
                      </span>
                      <span className={styles.statCardValue}>{card.value}</span>
                      <span className={styles.statCardLabel}>{card.label}</span>
                      {isActive && !reducedMotion && <span className={styles.statCardRing} aria-hidden />}
                    </motion.button>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Toolbar */}
          <div className={styles.toolbar}>
            <div className={styles.filterRail}>
              {FILTER_KEYS.map((key) => (
                <button
                  key={key}
                  type="button"
                  className={`${styles.filterPill} ${filter === key ? styles.filterPillActive : ''}`}
                  onClick={() => setFilter(key)}
                >
                  {filterLabels[key]}
                </button>
              ))}
            </div>
            <span className={styles.resultCount}>
              {copy.showing} {filtered.length} {copy.of} {counts.all}
            </span>
          </div>

          {/* List */}
          <div className={styles.listSection}>
            <AnimatePresence mode="wait">
              {filtered.length === 0 ? (
                <motion.div
                  key="empty"
                  className={styles.emptyState}
                  initial={reducedMotion ? false : { opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={reducedMotion ? undefined : { opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.25 }}
                >
                  <div className={styles.emptyIcon} aria-hidden>
                    <BsCollectionFill />
                  </div>
                  <h2 className={styles.emptyTitle}>{copy.emptyTitle}</h2>
                  <p className={styles.emptyBody}>{copy.emptyBody}</p>
                  <Link href={`/${locale}`} className={styles.createBtn}>
                    <BsPlusLg size={14} aria-hidden />
                    {copy.emptyCta}
                  </Link>
                </motion.div>
              ) : (
                <motion.ul
                  key={filter}
                  className={styles.list}
                  initial={reducedMotion ? false : { opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={reducedMotion ? undefined : { opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  {filtered.map((post, index) => (
                    <MyPostListItem
                      key={String(post.id)}
                      post={post}
                      locale={locale}
                      index={index}
                      reducedMotion={Boolean(reducedMotion)}
                      onFeature={setFeaturePostId}
                      onDelete={(id) => void handleDelete(id)}
                    />
                  ))}
                </motion.ul>
              )}
            </AnimatePresence>

            {hasMore && filter === 'all' && filtered.length > 0 && (
              <div className={styles.loadMoreWrap}>
                <button
                  type="button"
                  className={styles.loadMoreBtn}
                  onClick={() => void loadMore()}
                  disabled={loadingMore}
                >
                  {loadingMore && <BsArrowRepeat className={styles.spin} size={15} aria-hidden />}
                  {loadingMore ? copy.loading : copy.loadMore}
                </button>
              </div>
            )}
          </div>
        </motion.section>
      </div>

      {featurePostId != null && (
        <FeaturePostModal
          show
          onHide={() => setFeaturePostId(null)}
          postId={featurePostId}
          locale={locale}
          accessToken={(session as any)?.accessToken ?? ''}
          origin={typeof window !== 'undefined' ? window.location.origin : ''}
        />
      )}
    </main>
  )
}
