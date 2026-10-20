'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import {
  BsBookmark,
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
  layout?: 'default' | 'marketplace'
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
  layout = 'default',
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
  const [saveHint, setSaveHint] = useState(false)
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

  const isMarketplace = layout === 'marketplace'
  const interestLabel = locale === 'ar' ? 'اهتمام' : 'Interested'
  const shareLabel = t('post.share', locale)
  const contactActionLabel = t('post.contact', locale)
  const statsLabel = t('post.statistics', locale)
  const featureLabel = locale === 'ar' ? 'تمييز' : 'Feature'

  const likeButton = (
    <button
      type="button"
      className={`${styles.action} ${postLikedByMe ? styles.likeActive : styles.like} ${isMarketplace ? styles.marketplaceAction : ''}`}
      onClick={(e) => {
        e.stopPropagation()
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
      {...(likeTooltipTitle
        ? {
            'data-bs-toggle': 'tooltip',
            'data-bs-placement': 'top',
            'data-bs-html': 'true',
            'data-bs-custom-class': 'tooltip-text-start',
            'data-bs-title': likeTooltipTitle,
          }
        : {})}
    >
      <span className={styles.iconWrap} key={postLikedByMe ? 'liked' : 'not'}>
        <span className={styles.reactionEmoji} aria-hidden>
          {selectedReactionItem?.emoji ?? '👍'}
        </span>
      </span>
      <span className={styles.label}>
        {isMarketplace
          ? interestLabel
          : `${postLikedByMe ? selectedLabel : t('post.like', locale)} (${postLikesCount})`}
      </span>
    </button>
  )

  const commentButton = (
    <button
      type="button"
      className={`${styles.action} ${styles.comment} ${isMarketplace ? styles.marketplaceAction : ''}`}
      onClick={(e) => {
        e.stopPropagation()
        onShowComments()
      }}
    >
      <span className={styles.iconWrap}>
        <BsChatFill size={18} aria-hidden />
      </span>
      <span className={styles.label}>
        {isMarketplace
          ? `${locale === 'ar' ? 'تعليق' : 'Comment'}${commentsCount > 0 ? ` (${commentsCount})` : ''}`
          : `${t('post.comment', locale)} (${commentsCount})`}
      </span>
    </button>
  )

  const chatButton = (
    <button
      type="button"
      className={`${styles.action} ${chatReady ? styles.chat : styles.chatMuted} ${isMarketplace ? styles.marketplaceAction : ''}`}
      onClick={(e) => {
        e.stopPropagation()
        void onOpenChat()
      }}
      disabled={!chatReady}
      title={isAuthenticated ? t('post.openChat', locale) : t('post.loginToChat', locale)}
    >
      <span className={styles.iconWrap}>
        <BsChatDots size={18} aria-hidden />
      </span>
      <span className={styles.label}>{isMarketplace ? (locale === 'ar' ? 'دردشة' : 'Chat') : t('post.chat', locale)}</span>
    </button>
  )

  const shareButton = (
    <button
      type="button"
      className={`${styles.action} ${styles.share} ${isMarketplace ? styles.marketplaceAction : ''}`}
      onClick={(e) => {
        e.stopPropagation()
        onShowShare()
      }}
      title={shareLabel}
    >
      <span className={styles.iconWrap}>
        <BsShare size={18} aria-hidden />
      </span>
      <span className={styles.label}>{shareLabel}</span>
    </button>
  )

  const featureButton = showFeature ? (
    <button
      type="button"
      className={`${styles.action} ${styles.feature} ${isMarketplace ? styles.marketplaceAction : ''}`}
      onClick={(e) => {
        e.stopPropagation()
        onFeature?.()
      }}
      title={locale === 'ar' ? 'تمييز الإعلان' : 'Feature ad'}
    >
      <span className={styles.iconWrap}>
        <BsStars size={16} aria-hidden />
      </span>
      <span className={styles.label}>{featureLabel}</span>
    </button>
  ) : null

  const statsLink = (
    <a
      href={statisticsHref || '#'}
      className={`${styles.action} ${styles.stats} ${!statisticsHref ? styles.actionDisabled : ''} ${isMarketplace ? styles.marketplaceAction : ''}`}
      title={statsLabel}
      aria-disabled={!statisticsHref}
      onClick={(e) => {
        e.stopPropagation()
        if (!statisticsHref) e.preventDefault()
      }}
    >
      <span className={styles.iconWrap}>
        <BsGraphUp size={16} aria-hidden />
      </span>
      <span className={styles.label}>{statsLabel}</span>
    </a>
  )

  const contactButton = (
    <button
      type="button"
      className={`${styles.action} ${contactHref ? styles.contact : styles.contactMuted} ${isMarketplace ? styles.marketplaceContact : ''}`}
      onClick={(e) => {
        e.stopPropagation()
        void onContact()
      }}
      disabled={!contactHref}
      title={contactLabel}
    >
      <span className={styles.iconWrap}>
        <BsTelephoneFill size={16} aria-hidden />
      </span>
      <span className={styles.label}>{contactActionLabel}</span>
    </button>
  )

  const reactionAnchor = (
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
      {likeButton}
    </div>
  )

  if (isMarketplace) {
    return (
      <div>
        <div className={styles.marketplaceBar}>
          {reactionAnchor}
          {commentButton}
          {shareButton}
          <button
            type="button"
            className={`${styles.action} ${styles.marketplaceAction}`}
            onClick={(e) => {
              e.stopPropagation()
              setSaveHint(true)
            }}
            title={locale === 'ar' ? 'الحفظ غير متصل بالخادم' : 'Saving is not connected to the server'}
          >
            <span className={styles.iconWrap}>
              <BsBookmark size={16} aria-hidden />
            </span>
            <span className={styles.label}>{locale === 'ar' ? 'حفظ' : 'Save'}</span>
          </button>
          {isOwner ? (
            <>
              {featureButton}
              {statsLink}
            </>
          ) : (
            <>
              {chatButton}
              {contactButton}
            </>
          )}
        </div>
        {saveHint ? (
          <p className={styles.apiNote} role="status">
            {locale === 'ar'
              ? 'حفظ الإعلان غير متصل بخدمة. لم يُخزَّن شيء.'
              : 'Saving a listing is not connected to a service. Nothing was stored.'}
          </p>
        ) : null}
      </div>
    )
  }

  return (
    <div className={styles.bar}>
      {reactionAnchor}
      {commentButton}
      {shareButton}
      {isOwner ? (
        <>
          {featureButton}
          {statsLink}
        </>
      ) : (
        <>
          {chatButton}
          {contactButton}
        </>
      )}
    </div>
  )
}
