'use client'

import { useCallback, useMemo, useState } from 'react'
import { Button, ButtonGroup } from 'react-bootstrap'
import PostCard from '@/components/cards/PostCard'
import FeaturePostModal from '@/components/promotion/FeaturePostModal'
import { deletePost, fetchMyPosts, type PostRecord } from '@/lib/api/posts'
import { isPubliclyPublishedStatus } from '@/lib/postStatus'
import type { SupportedLocale } from '@/lib/localization'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import styles from './myPosts.module.css'

type Filter = 'all' | 'active' | 'pending' | 'featured'

type Props = {
  locale: SupportedLocale
  initialPosts: PostRecord[]
}

export default function MyPostsClient({ locale, initialPosts }: Props) {
  const { data: session } = useSession()
  const router = useRouter()
  const [posts, setPosts] = useState(initialPosts)
  const [filter, setFilter] = useState<Filter>('all')
  const [page, setPage] = useState(1)
  const [loadingMore, setLoadingMore] = useState(false)
  const [hasMore, setHasMore] = useState(initialPosts.length >= 15)
  const [featurePostId, setFeaturePostId] = useState<number | null>(null)

  const isAr = locale === 'ar'

  const filtered = useMemo(() => {
    return posts.filter((post) => {
      const status = String(post.status ?? '')
      const featured = Boolean(post.is_featured_active || post.promotion?.is_active)
      if (filter === 'active') return status === 'active'
      if (filter === 'pending') return status === 'pending_review' || status === 'pending'
      if (filter === 'featured') return featured
      return true
    })
  }, [posts, filter])

  const loadMore = async () => {
    setLoadingMore(true)
    const nextPage = page + 1
    const rows = await fetchMyPosts({ page: nextPage, perPage: 15, locale })
    const list = Array.isArray(rows?.data) ? rows.data : []
    setLoadingMore(false)
    if (!list.length) {
      setHasMore(false)
      return
    }
    setPosts((prev) => [...prev, ...list])
    setPage(nextPage)
    if (list.length < 15) setHasMore(false)
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
    <div className={styles.wrap}>
      <div className={styles.header}>
        <h1 className={styles.title}>{isAr ? 'منشوراتي' : 'My posts'}</h1>
        <p className={styles.subtitle}>
          {isAr ? 'استعرض إعلاناتك، عدّلها، ميّزها، أو تابع إحصائياتها.' : 'Browse, edit, feature, and track your listings.'}
        </p>
      </div>

      <ButtonGroup className={styles.filters}>
        {([
          ['all', isAr ? 'الكل' : 'All'],
          ['active', isAr ? 'نشط' : 'Active'],
          ['pending', isAr ? 'قيد المراجعة' : 'Pending'],
          ['featured', isAr ? 'مميز' : 'Featured'],
        ] as const).map(([key, label]) => (
          <Button
            key={key}
            variant={filter === key ? 'warning' : 'outline-secondary'}
            size="sm"
            onClick={() => setFilter(key)}
          >
            {label}
          </Button>
        ))}
      </ButtonGroup>

      {filtered.length === 0 ? (
        <div className="card">
          <div className="card-body text-center py-5 text-muted">
            {isAr ? 'لا توجد منشورات في هذا الفلتر.' : 'No posts in this filter.'}
          </div>
        </div>
      ) : (
        <div className="vstack gap-3">
          {filtered.map((post) => (
            <div key={String(post.id)} className={styles.rowCard}>
              <PostCard
                post={post}
                onDelete={() => void handleDelete(Number(post.id))}
              />
              <div className={styles.rowActions}>
                <Button
                  size="sm"
                  variant="outline-primary"
                  onClick={() => router.push(`/${locale}/post/${post.id}/edit`)}
                >
                  {isAr ? 'تعديل' : 'Edit'}
                </Button>
                <Button
                  size="sm"
                  variant="outline-secondary"
                  onClick={() => router.push(`/${locale}/post/${post.id}/statistics`)}
                >
                  {isAr ? 'إحصائيات' : 'Stats'}
                </Button>
                {isPubliclyPublishedStatus(String(post.status ?? '')) &&
                  !Boolean(post.is_featured_active || post.promotion?.is_active) && (
                    <Button size="sm" variant="warning" onClick={() => setFeaturePostId(Number(post.id))}>
                      {isAr ? 'تمييز' : 'Feature'}
                    </Button>
                  )}
              </div>
            </div>
          ))}
        </div>
      )}

      {hasMore && filter === 'all' && (
        <div className="text-center mt-3">
          <Button variant="light" onClick={() => void loadMore()} disabled={loadingMore}>
            {loadingMore ? (isAr ? 'جاري التحميل...' : 'Loading...') : isAr ? 'تحميل المزيد' : 'Load more'}
          </Button>
        </div>
      )}

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
    </div>
  )
}
