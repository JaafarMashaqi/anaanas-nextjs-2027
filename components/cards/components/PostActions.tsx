'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import {
  BsChatDots,
  BsChatFill,
  BsGraphUp,
  BsShare,
  BsStars,
  BsTelephoneFill,
} from 'react-icons/bs'
import { t } from '@/lib/translations'
import type { SupportedLocale } from '@/lib/localization'
import styles from './PostActions.module.css'

type ReactionKey = 'like' | 'love' | 'care' | 'haha' | 'wow' | 'sad' | 'angry'

type ReactionItem = {
  key: ReactionKey
  emoji: string
  labelAr: string
  labelEn: string
}

const REACTIONS: ReactionItem[] = [
  { key: 'like', emoji: '👍', labelAr: 'أعجبني', labelEn: 'Like' },
  { key: 'love', emoji: '❤️', labelAr: 'أحببته', labelEn: 'Love' },
  { key: 'care', emoji: '🥰', labelAr: 'مهتم', labelEn: 'Care' },
  { key: 'haha', emoji: '😂', labelAr: 'أضحكني', labelEn: 'Haha' },
  { key: 'wow', emoji: '😮', labelAr: 'أدهشني', labelEn: 'Wow' },
  { key: 'sad', emoji: '😢', labelAr: 'أحزنني', labelEn: 'Sad' },
  { key: 'angry', emoji: '😡', labelAr: 'أغضبني', labelEn: 'Angry' },
]

type PostActionsProps = {
  locale?: SupportedLocale
  isOwner?: boolean
  showFeature?: boolean
  onFeature?: () => void
  // Like button props
  postLikedByMe: boolean
  reactionTypeByMe?: ReactionKey | null
  postLikesCount: number
  onToggleLikePost: (reaction?: ReactionKey) => void | Promise<void>
  likeTooltipTitle?: string

  // Comment button props
  commentsCount: number
  onShowComments: () => void

  // Share button props
  onShowShare: () => void

  // Chat button props
  onOpenChat: () => void | Promise<void>
  isAuthenticated: boolean
  postId?: number | string

  // Contact button props
  onContact: () => void | Promise<void>
  contactHref: string | null
  contactLabel: string
  userMobile?: string | null
}

export default function PostActions({
  postLikedByMe,
  reactionTypeByMe = null,
  postLikesCount,
  onToggleLikePost,
  likeTooltipTitle,
  commentsCount,
  onShowComments,
  onShowShare,
  onOpenChat,
  isAuthenticated,
  postId,
  onContact,
  contactHref,
  contactLabel,
  userMobile,
  locale = 'ar',
  isOwner = false,
  showFeature = false,
  onFeature,
}: PostActionsProps) {
  const HIDE_DELAY_MS = 220
  const LONG_PRESS_MS = 320
  const statisticsHref = postId ? `/${locale}/post/${String(postId)}/statistics` : null
  const chatReady = Boolean(isAuthenticated && postId)
  const [selectedReaction, setSelectedReaction] = useState<ReactionKey | null>(postLikedByMe ? (reactionTypeByMe ?? 'like') : null)
  const [showReactions, setShowReactions] = useState(false)
  const [isTouchDevice, setIsTouchDevice] = useState(false)
  const reactionWrapRef = useRef<HTMLDivElement | null>(null)
  const hideTimerRef = useRef<number | null>(null)
  const longPressTimerRef = useRef<number | null>(null)
  const longPressTriggeredRef = useRef(false)

  useEffect(() => {
    if (!postLikedByMe) {
      setSelectedReaction(null)
      return
    }
    setSelectedReaction((prev) => reactionTypeByMe ?? prev ?? 'like')
  }, [postLikedByMe, reactionTypeByMe])

  useEffect(() => {
    if (typeof window === 'undefined') return
    const media = window.matchMedia('(hover: none), (pointer: coarse)')
    const update = () => setIsTouchDevice(media.matches)
    update()
    media.addEventListener('change', update)
    return () => media.removeEventListener('change', update)
  }, [])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!reactionWrapRef.current) return
      if (!reactionWrapRef.current.contains(event.target as Node)) {
        setShowReactions(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    return () => {
      if (hideTimerRef.current != null) window.clearTimeout(hideTimerRef.current)
      if (longPressTimerRef.current != null) window.clearTimeout(longPressTimerRef.current)
    }
  }, [])

  const selectedReactionItem = useMemo(
    () => REACTIONS.find((reaction) => reaction.key === selectedReaction) ?? null,
    [selectedReaction]
  )

  const selectedLabel =
    selectedReactionItem ? (locale === 'ar' ? selectedReactionItem.labelAr : selectedReactionItem.labelEn) : t('post.like', locale)

  const onPrimaryLikeClick = () => {
    if (postLikedByMe) {
      setSelectedReaction(null)
      void onToggleLikePost()
      return
    }

    setSelectedReaction('like')
    void onToggleLikePost('like')
  }

  const onSelectReaction = (reaction: ReactionKey) => {
    if (postLikedByMe && selectedReaction === reaction) {
      setShowReactions(false)
      return
    }
    setSelectedReaction(reaction)
    setShowReactions(false)
    void onToggleLikePost(reaction)
  }

  const clearHideTimer = () => {
    if (hideTimerRef.current != null) {
      window.clearTimeout(hideTimerRef.current)
      hideTimerRef.current = null
    }
  }

  const clearLongPressTimer = () => {
    if (longPressTimerRef.current != null) {
      window.clearTimeout(longPressTimerRef.current)
      longPressTimerRef.current = null
    }
  }

  const openReactions = () => {
    clearHideTimer()
    setShowReactions(true)
  }

  const scheduleHideReactions = () => {
    clearHideTimer()
    hideTimerRef.current = window.setTimeout(() => {
      setShowReactions(false)
    }, HIDE_DELAY_MS)
  }

  const onTouchLikeStart = () => {
    if (!isTouchDevice) return
    clearLongPressTimer()
    longPressTriggeredRef.current = false
    longPressTimerRef.current = window.setTimeout(() => {
      longPressTriggeredRef.current = true
      openReactions()
    }, LONG_PRESS_MS)
  }

  const onTouchLikeEnd = () => {
    clearLongPressTimer()
  }

  return (
    <div className={styles.bar}>
      <div
        className={styles.reactionAnchor}
        ref={reactionWrapRef}
        onMouseEnter={() => {
          if (!isTouchDevice) openReactions()
        }}
        onMouseLeave={() => {
          if (!isTouchDevice) scheduleHideReactions()
        }}
      >
        {showReactions && (
          <div
            className={styles.reactionsPopover}
            role="menu"
            aria-label={locale === 'ar' ? 'اختيار تفاعل' : 'Choose reaction'}
            onMouseEnter={clearHideTimer}
            onMouseLeave={scheduleHideReactions}
          >
            {REACTIONS.map((reaction) => (
              <button
                key={reaction.key}
                type="button"
                className={`${styles.reactionOption} ${selectedReaction === reaction.key ? styles.reactionOptionActive : ''}`}
                onClick={() => onSelectReaction(reaction.key)}
                title={locale === 'ar' ? reaction.labelAr : reaction.labelEn}
                aria-label={locale === 'ar' ? reaction.labelAr : reaction.labelEn}
              >
                <span aria-hidden>{reaction.emoji}</span>
              </button>
            ))}
          </div>
        )}
        <button
          type="button"
          className={`${styles.action} ${postLikedByMe ? styles.likeActive : styles.like}`}
          onClick={() => {
            if (longPressTriggeredRef.current) {
              longPressTriggeredRef.current = false
              return
            }
            onPrimaryLikeClick()
          }}
          onTouchStart={onTouchLikeStart}
          onTouchEnd={onTouchLikeEnd}
          onTouchCancel={onTouchLikeEnd}
          data-bs-container="body"
          data-bs-toggle="tooltip"
          data-bs-placement="top"
          data-bs-html="true"
          data-bs-custom-class="tooltip-text-start"
          data-bs-title={
            likeTooltipTitle ||
            'Frances Guerrero<br> Lori Stevens<br> Billy Vasquez<br> Judy Nguyen<br> Larry Lawson<br> Amanda Reed<br> Louis Crawford'
          }
        >
          <span className={styles.iconWrap} key={postLikedByMe ? 'liked' : 'not'}>
            <span className={styles.reactionEmoji} aria-hidden>
              {selectedReactionItem?.emoji ?? '👍'}
            </span>
          </span>
          <span className={styles.label}>
            {postLikedByMe ? selectedLabel : t('post.like', locale)} ({postLikesCount})
          </span>
        </button>
      </div>

      <button type="button" className={`${styles.action} ${styles.comment}`} onClick={onShowComments}>
        <span className={styles.iconWrap}>
          <BsChatFill size={18} aria-hidden />
        </span>
        <span className={styles.label}>
          {t('post.comment', locale)} ({commentsCount})
        </span>
      </button>

      <button
        type="button"
        className={`${styles.action} ${styles.share}`}
        onClick={onShowShare}
        title={t('post.share', locale)}
      >
        <span className={styles.iconWrap}>
          <BsShare size={18} aria-hidden />
        </span>
        <span className={styles.label}>{t('post.share', locale)}</span>
      </button>

      {isOwner ? (
        <>
          {showFeature && (
            <button
              type="button"
              className={`${styles.action} ${styles.feature}`}
              onClick={() => onFeature?.()}
              title={locale === 'ar' ? 'تمييز الإعلان' : 'Feature ad'}
            >
              <span className={styles.iconWrap}>
                <BsStars size={18} aria-hidden />
              </span>
              <span className={styles.label}>{locale === 'ar' ? 'تمييز' : 'Feature'}</span>
            </button>
          )}
          <a
          href={statisticsHref || '#'}
          className={`${styles.action} ${styles.stats} ${!statisticsHref ? styles.actionDisabled : ''}`}
          title={t('post.statistics', locale)}
          aria-disabled={!statisticsHref}
          onClick={(e) => {
            if (!statisticsHref) e.preventDefault()
          }}
        >
          <span className={styles.iconWrap}>
            <BsGraphUp size={18} aria-hidden />
          </span>
          <span className={styles.label}>{t('post.statistics', locale)}</span>
        </a>
        </>
      ) : (
        <>
          <button
            type="button"
            className={`${styles.action} ${chatReady ? styles.chat : styles.chatMuted}`}
            onClick={() => void onOpenChat()}
            disabled={!chatReady}
            title={isAuthenticated ? t('post.openChat', locale) : t('post.loginToChat', locale)}
          >
            <span className={styles.iconWrap}>
              <BsChatDots size={18} aria-hidden />
            </span>
            <span className={styles.label}>{t('post.chat', locale)}</span>
          </button>

          <button
            type="button"
            className={`${styles.action} ${contactHref ? styles.contact : styles.contactMuted}`}
            onClick={() => void onContact()}
            disabled={!contactHref}
            title={contactLabel}
          >
            <span className={styles.iconWrap}>
              <BsTelephoneFill size={18} aria-hidden />
            </span>
            <span className={styles.label}>{t('post.contact', locale)}</span>
          </button>
        </>
      )}
    </div>
  )
}
