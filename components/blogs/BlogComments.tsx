'use client'

import Image from 'next/image'
import { useSession } from 'next-auth/react'
import { useCallback, useEffect, useState } from 'react'

import defaultUserAvatar from '@/assets/images/avatar/user-default.svg'
import LoginRequiredDialog from '@/components/dialogs/LoginRequiredDialog'
import {
  fetchBlogComments,
  postBlogComment,
  type BlogComment,
} from '@/lib/api/blogs'
import type { SupportedLocale } from '@/lib/localization'
import { resolveMediaUrl } from '@/lib/media/resolveMediaUrl'

import styles from './blogsLayout.module.css'

type BlogCommentsProps = {
  blogId: number
  locale: SupportedLocale
  initialCount: number
}

function formatTime(iso: string | null | undefined, locale: SupportedLocale) {
  if (!iso) return ''
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return ''
  return date.toLocaleString(locale === 'ar' ? 'ar' : 'en-GB', {
    dateStyle: 'medium',
    timeStyle: 'short',
  })
}

const BlogComments = ({ blogId, locale, initialCount }: BlogCommentsProps) => {
  const { status } = useSession()
  const [comments, setComments] = useState<BlogComment[]>([])
  const [loading, setLoading] = useState(true)
  const [body, setBody] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [showLogin, setShowLogin] = useState(false)
  const [count, setCount] = useState(initialCount)

  const title = locale === 'ar' ? `التعليقات (${count})` : `Comments (${count})`
  const placeholder = locale === 'ar' ? 'اكتب تعليقك...' : 'Write a comment...'
  const submitLabel = locale === 'ar' ? 'نشر التعليق' : 'Post comment'
  const emptyLabel = locale === 'ar' ? 'لا توجد تعليقات بعد.' : 'No comments yet.'

  const loadComments = useCallback(async () => {
    setLoading(true)
    try {
      const result = await fetchBlogComments(blogId)
      setComments(result.data)
    } catch {
      setComments([])
    } finally {
      setLoading(false)
    }
  }, [blogId])

  useEffect(() => {
    void loadComments()
  }, [loadComments])

  const handleSubmit = async () => {
    const trimmed = body.trim()
    if (!trimmed) return

    if (status !== 'authenticated') {
      setShowLogin(true)
      return
    }

    setSubmitting(true)
    try {
      const created = await postBlogComment(blogId, trimmed)
      setComments((prev) => [created, ...prev])
      setBody('')
      setCount((prev) => prev + 1)
    } catch (error) {
      const message = error instanceof Error ? error.message : ''
      if (message.toLowerCase().includes('unauth') || status !== 'authenticated') {
        setShowLogin(true)
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section className={styles.commentsSection} aria-labelledby="blog-comments-title">
      <h2 id="blog-comments-title" className={styles.commentsTitle}>
        {title}
      </h2>

      <form
        className={styles.commentForm}
        onSubmit={(event) => {
          event.preventDefault()
          void handleSubmit()
        }}
      >
        <textarea
          value={body}
          onChange={(event) => setBody(event.target.value)}
          placeholder={placeholder}
          maxLength={4000}
          aria-label={placeholder}
        />
        <div className={styles.commentFormActions}>
          <button type="submit" className={styles.submitBtn} disabled={submitting || !body.trim()}>
            {submitLabel}
          </button>
        </div>
      </form>

      {loading ? (
        <p className={styles.empty}>{locale === 'ar' ? 'جاري التحميل...' : 'Loading...'}</p>
      ) : comments.length === 0 ? (
        <p className={styles.empty}>{emptyLabel}</p>
      ) : (
        <ul className={styles.commentList}>
          {comments.map((comment) => {
            const avatarRaw = comment.user?.avatar_url
            const avatarSrc = avatarRaw
              ? resolveMediaUrl(avatarRaw) || defaultUserAvatar.src
              : defaultUserAvatar.src

            return (
              <li key={comment.id} className={styles.commentItem}>
                <Image
                  src={avatarSrc}
                  alt=""
                  width={36}
                  height={36}
                  className={styles.commentAvatar}
                  unoptimized
                />
                <div className={styles.commentBody}>
                  <p className={styles.commentAuthor}>{comment.user?.name || '—'}</p>
                  <p className={styles.commentText}>{comment.body}</p>
                  <div className={styles.commentTime}>{formatTime(comment.created_at, locale)}</div>
                </div>
              </li>
            )
          })}
        </ul>
      )}

      <LoginRequiredDialog show={showLogin} onHide={() => setShowLogin(false)} locale={locale} />
    </section>
  )
}

export default BlogComments
