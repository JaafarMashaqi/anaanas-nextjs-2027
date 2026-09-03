'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { BsHeart, BsHeartFill } from 'react-icons/bs'

import LoginRequiredDialog from '@/components/dialogs/LoginRequiredDialog'
import type { SupportedLocale } from '@/lib/localization'

import styles from './blogsLayout.module.css'

type BlogLikeButtonProps = {
  blogId: number
  locale: SupportedLocale
  initialLiked: boolean
  initialCount: number
}

const BlogLikeButton = ({
  blogId,
  locale,
  initialLiked,
  initialCount,
}: BlogLikeButtonProps) => {
  const { status } = useSession()
  const [liked, setLiked] = useState(initialLiked)
  const [count, setCount] = useState(initialCount)
  const [pending, setPending] = useState(false)
  const [showLogin, setShowLogin] = useState(false)

  const label = locale === 'ar' ? 'إعجاب' : 'Like'

  const handleClick = async () => {
    if (status !== 'authenticated') {
      setShowLogin(true)
      return
    }

    if (pending) return
    setPending(true)

    const prevLiked = liked
    const prevCount = count
    setLiked(!prevLiked)
    setCount(prevLiked ? Math.max(0, prevCount - 1) : prevCount + 1)

    try {
      const res = await fetch(`/api/blogs/${blogId}/reactions`, {
        method: 'POST',
        headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'like' }),
      })
      const json = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(json?.message || 'Failed')
      setLiked(Boolean(json.data?.liked))
      setCount(Number(json.data?.likes_count ?? count))
    } catch {
      setLiked(prevLiked)
      setCount(prevCount)
    } finally {
      setPending(false)
    }
  }

  return (
    <>
      <button
        type="button"
        className={`${styles.likeBtn} ${liked ? styles.likeBtnActive : ''}`}
        onClick={() => void handleClick()}
        disabled={pending}
        aria-pressed={liked}
      >
        {liked ? <BsHeartFill aria-hidden /> : <BsHeart aria-hidden />}
        <span>
          {label} ({count})
        </span>
      </button>

      <LoginRequiredDialog show={showLogin} onHide={() => setShowLogin(false)} locale={locale} />
    </>
  )
}

export default BlogLikeButton
