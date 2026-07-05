'use client'

import type { PostRecord } from '@/lib/api/posts'
import { timeSince } from '@/utils/date'
import Image from 'next/image'
import { useEffect, useMemo, useRef, useState } from 'react'
import { t } from '@/lib/translations'
import { DEFAULT_LOCALE, isSupportedLocale } from '@/lib/localization'
import type { SupportedLocale } from '@/lib/localization'
import { ensureAnalyticsSocket, sendAnalyticsEvent } from '@/lib/analytics/socket'
import { handleEmailVerificationBlock } from '@/lib/auth/emailVerification'
import {
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  Col,
  Dropdown,
  DropdownDivider,
  DropdownItem,
  DropdownMenu,
  DropdownToggle,
  Row,
} from 'react-bootstrap'
import {
  BsBookmark,
  BsChatFill,
  BsChatDots,
  BsFlag,
  BsHandThumbsUpFill,
  BsPersonX,
  BsSendFill,
  BsShare,
  BsSlashCircle,
  BsStars,
  BsTelephoneFill,
  BsThreeDots,
  BsXCircle,
} from 'react-icons/bs'
import GlightBox from '../GlightBox'
import LoadContentButton from '../LoadContentButton'
import CommentItem from './components/CommentItem'
import PostActions from './components/PostActions'
import FeaturePostModal from '@/components/promotion/FeaturePostModal'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import LoginRequiredDialog from '@/components/dialogs/LoginRequiredDialog'
import type { CommentType } from '@/types/data'
import { useParams, usePathname, useRouter } from 'next/navigation'
import SharePostModal from '@/components/share/SharePostModal'
import { deletePost } from '@/lib/api/posts'
import { resolveMediaUrl } from '@/lib/media/resolveMediaUrl'
import { linkifyPlainText } from '@/lib/text/linkify'
import { useCurrentUser } from '@/context/useCurrentUser'
import clsx from 'clsx'
import styles from './PostCard.module.css'

import defaultUserAvatar from '@/assets/images/avatar/user-default.svg'
import postImg3 from '@/assets/images/post/1by1/03.jpg'
import postImg1 from '@/assets/images/post/3by2/01.jpg'
import postImg2 from '@/assets/images/post/3by2/02.jpg'
import VideoPlayer from './components/VideoPlayer'

type PostCardProps = {
  post: PostRecord
  // NOTE: for post details page, render these OUTSIDE PostCard (server components can't pass JSX to client).
  // Keeping them optional for now to avoid breaking existing usage.
  banner?: any
  attributesAndOptions?: any
  onDelete?: (postId: number | string) => void
}

type ApiComment = {
  id: number | string
  post_id?: number | string
  parent_id?: number | string | null
  body?: string
  created_at?: string
  likes_count?: number
  liked_by_me?: boolean
  replies_count?: number
  user?: { id?: number | string; name?: string; avatar?: string | null }
}

type CommentsListResponse = {
  success?: boolean
  data?: ApiComment[]
  meta?: { next_page_url?: string | null; current_page?: number }
}

type CreateCommentResponse = {
  success?: boolean
  data?: ApiComment
  message?: string
}

type ReactionToggleResponse = {
  success?: boolean
  data?: {
    comment_id?: number | string
    likes_count?: number
    toggled_on?: boolean
  }
  message?: string
}

type PostReactionToggleResponse = {
  success?: boolean
  data?: {
    post_id?: number | string
    likes_count?: number
    toggled_on?: boolean
    reaction_type_by_me?: 'like' | 'love' | 'care' | 'haha' | 'wow' | 'sad' | 'angry' | null
    reaction_counts?: Partial<Record<'like' | 'love' | 'care' | 'haha' | 'wow' | 'sad' | 'angry', number>>
  }
  message?: string
}

type PostReactionSummaryResponse = {
  success?: boolean
  data?: {
    likes_count?: number
    liked_by_me?: boolean
    reaction_type_by_me?: 'like' | 'love' | 'care' | 'haha' | 'wow' | 'sad' | 'angry' | null
    reaction_counts?: Partial<Record<'like' | 'love' | 'care' | 'haha' | 'wow' | 'sad' | 'angry', number>>
  }
  message?: string
}

type ReactionKey = 'like' | 'love' | 'care' | 'haha' | 'wow' | 'sad' | 'angry'

const REACTION_ORDER: ReactionKey[] = ['like', 'love', 'care', 'haha', 'wow', 'sad', 'angry']
const REACTION_EMOJI: Record<ReactionKey, string> = {
  like: '👍',
  love: '❤️',
  care: '🥰',
  haha: '😂',
  wow: '😮',
  sad: '😢',
  angry: '😡',
}

const EMPTY_REACTION_COUNTS: Record<ReactionKey, number> = {
  like: 0,
  love: 0,
  care: 0,
  haha: 0,
  wow: 0,
  sad: 0,
  angry: 0,
}

const normalizeReactionCounts = (input?: Partial<Record<ReactionKey, number>> | null): Record<ReactionKey, number> => {
  const result = { ...EMPTY_REACTION_COUNTS }
  if (!input) return result

  for (const key of REACTION_ORDER) {
    const value = Number(input[key] ?? 0)
    result[key] = Number.isFinite(value) && value > 0 ? Math.floor(value) : 0
  }
  return result
}

const ActionMenu = ({
  name,
  canEdit,
  editHref,
  canDelete,
  onDelete,
  locale = 'ar',
}: {
  name?: string
  canEdit?: boolean
  editHref?: string
  canDelete?: boolean
  onDelete?: () => void
  locale?: SupportedLocale
}) => {
  return (
    <Dropdown>
      <DropdownToggle as="a" className="text-secondary btn btn-secondary-soft-hover py-1 px-2 content-none" id="cardFeedAction">
        <BsThreeDots />
      </DropdownToggle>

      <DropdownMenu className="dropdown-menu-end" aria-labelledby="cardFeedAction">
        {canEdit && editHref && (
          <li>
            <DropdownItem as={Link as any} href={editHref}>
              <BsBookmark size={22} className="fa-fw pe-2" />
              {t('post.editPost', locale)}
            </DropdownItem>
          </li>
        )}

        {canDelete && onDelete && (
          <li>
            <DropdownItem
              href="#"
              onClick={(e) => {
                e.preventDefault()
                if (window.confirm(t('post.confirmDelete', locale))) {
                  onDelete()
                }
              }}
              className="text-danger"
            >
              <BsXCircle size={22} className="fa-fw pe-2" />
              {t('post.deletePost', locale)}
            </DropdownItem>
          </li>
        )}




        {/* <li>
          <DropdownItem href="#">
            {' '}
            <BsBookmark size={22} className="fa-fw pe-2" />
            Save post
          </DropdownItem>
        </li>

        
        <li>
          <DropdownItem href="#">
            {' '}
            <BsPersonX size={22} className="fa-fw pe-2" />
            Unfollow {name}{' '}
          </DropdownItem>
        </li>
        <li>
          <DropdownItem href="#">
            {' '}
            <BsXCircle size={22} className="fa-fw pe-2" />
            Hide post
          </DropdownItem>
        </li>
        <li>
          <DropdownItem href="#">
            {' '}
            <BsSlashCircle size={22} className="fa-fw pe-2" />
            Block
          </DropdownItem>
        </li>
        <li>
          <DropdownDivider />
        </li>
        <li>
          <DropdownItem href="#">
            {' '}
            <BsFlag size={22} className="fa-fw pe-2" />
            Report post
          </DropdownItem>
        </li> */}
      </DropdownMenu>
    </Dropdown>
  )
}

const PostCard = ({ post, banner, attributesAndOptions, onDelete: onDeleteCallback }: PostCardProps) => {
  const { status, data: session } = useSession()
  const pathname = usePathname()
  const params = useParams<{ locale?: string }>()
  const router = useRouter()
  const localeFromParams = Array.isArray(params?.locale) ? params.locale[0] : params?.locale
  const locale: SupportedLocale = (localeFromParams && isSupportedLocale(localeFromParams)) ? localeFromParams : DEFAULT_LOCALE
  
  const user = (post?.user as Record<string, any>) ?? {}
  const userName = user?.name || t('post.user', locale)
  const createdAt = (post as any)?.publish_date || post?.created_at || post?.createdAt
  const createdAtDate = createdAt ? new Date(createdAt) : null
  const isOwner =
    status === 'authenticated' &&
    Number((session as any)?.user?.id) > 0 &&
    Number((session as any)?.user?.id) === Number((post as any)?.user_id)
  const isFeaturedActive = Boolean((post as any)?.is_featured_active || (post as any)?.promotion?.is_active)
  const [showFeatureModal, setShowFeatureModal] = useState(false)
  const initialPostLikesCount = post?.likes_count ?? post?.likesCount ?? 0
  const initialPostLikedByMe = Boolean((post as any)?.liked_by_me)
  const initialReactionTypeByMe =
    ((post as any)?.reaction_type_by_me as 'like' | 'love' | 'care' | 'haha' | 'wow' | 'sad' | 'angry' | null | undefined) ?? null
  const initialReactionCounts = normalizeReactionCounts((post as any)?.reaction_counts ?? null)
  const commentsCount = post?.comments_count ?? post?.commentsCount ?? 0
  const caption = post?.description ?? post?.caption ?? ''
  const title = post?.title ?? ''
  const postImages = Array.isArray((post as any)?.post_images) ? ((post as any).post_images as any[]) : []
  const image = resolveMediaUrl(postImages[0]?.image_full_url ?? post?.image)
  const imageCount = postImages.length > 0 ? postImages.length : image ? 1 : 0
  const sectionName = (post as any)?.section?.name ?? ''
  const categoryName = (post as any)?.category?.name ?? ''
  const cityName = (post as any)?.city?.name ?? ''
  const sectionSlug = (post as any)?.section?.slug ?? ''
  const categorySlug = (post as any)?.category?.slug ?? ''



  const photos = post?.photos
  const isVideo = post?.isVideo
  const commentsPreview = (post?.comments as ApiComment[] | undefined) ?? []
  // Post author avatar — normalize any backend path and fall back to the default avatar.
  const avatarSrc =
    resolveMediaUrl(user?.avatar_url || user?.avatar || user?.profile_image || user?.image || '') ||
    defaultUserAvatar.src

  const isDetailsPage = Boolean(pathname?.includes('/post/'))
  const postDetailsHref = localeFromParams ? `/${localeFromParams}/post/${post?.id}` : `/post/${post?.id}`

  const cardRef = useRef<HTMLDivElement | null>(null)
  const commentInputRef = useRef<HTMLTextAreaElement | null>(null)
  const impressionSentRef = useRef(false)

  // Current (logged-in) user avatar comes from the shared CurrentUserProvider,
  // which fetches /api/auth/profile ONCE for the whole app (not per-card) and
  // re-renders all consumers on `profile:updated` events.
  const { user: currentUser, avatarUrl: currentUserAvatarResolved } = useCurrentUser()
  const currentUserAvatar = currentUser ? currentUserAvatarResolved : null

  useEffect(() => {
    // Warm up analytics socket early for viewport tracking.
    ensureAnalyticsSocket()
  }, [])

  useEffect(() => {
    // Track impressions only in feeds (not details page) and only once
    if (isDetailsPage) return
    const pid = post?.id
    if (!pid) return
    if (impressionSentRef.current) return

    const el = cardRef.current
    if (!el || typeof IntersectionObserver === 'undefined') return

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0]
        if (!entry) return
        if (entry.isIntersecting && entry.intersectionRatio >= 0.55) {
          impressionSentRef.current = true
          observer.disconnect()
          void sendAnalyticsEvent({
            post_id: String(pid),
            event: 'post_impression',
            meta: {
              ratio: entry.intersectionRatio,
              path: typeof window !== 'undefined' ? window.location.pathname : null,
            },
          })
        }
      },
      { threshold: [0, 0.25, 0.55, 0.75, 1] }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [isDetailsPage, post?.id])

  // The backend now always includes `reaction_counts` + `liked_by_me` +
  // `reaction_type_by_me` inside the post payload (see PostController::index
  // and SectionController::getPosts), so we no longer need a per-card GET
  // to /api/posts/{id}/reactions on mount. This eliminates an N+1 request
  // pattern (one request per rendered card) that was hammering the server.
  //
  // The fallback fetch is only issued when the post object was constructed
  // from a legacy/partial source that literally omits `reaction_counts`.
  useEffect(() => {
    const postId = post?.id
    if (!postId) return

    const payloadHasCounts = (post as any)?.reaction_counts !== undefined &&
                             (post as any)?.reaction_counts !== null
    if (payloadHasCounts) return

    const controller = new AbortController()
    ;(async () => {
      try {
        const res = await fetch(`/api/posts/${postId}/reactions`, {
          method: 'GET',
          headers: { Accept: 'application/json' },
          signal: controller.signal,
        })
        const json = (await res.json().catch(() => ({}))) as PostReactionSummaryResponse
        if (!res.ok || !json?.success || !json?.data) return

        const counts = normalizeReactionCounts(json.data.reaction_counts ?? null)
        setPostReactionCounts(counts)
        setPostLikesCount(Number(json.data.likes_count ?? 0))
        setPostLikedByMe(Boolean(json.data.liked_by_me))
        setPostReactionTypeByMe((json.data.reaction_type_by_me as any) ?? null)
      } catch (e: any) {
        if (e?.name !== 'AbortError') {
          console.error('Failed to load reaction summary', e)
        }
      }
    })()

    return () => controller.abort()
  }, [post?.id])
  const postEditHref = localeFromParams ? `/${localeFromParams}/post/${post?.id}/edit` : `/post/${post?.id}/edit`

  const currentUserId = (session as any)?.user?.id
  const ownerId = (post as any)?.user_id ?? (post as any)?.user?.id
  const canEdit = status === 'authenticated' && ownerId != null && currentUserId != null && String(ownerId) === String(currentUserId)
  const canDelete = status === 'authenticated' && ownerId != null && currentUserId != null && String(ownerId) === String(currentUserId)

  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    const postId = post?.id
    if (!postId) return

    setIsDeleting(true)
    try {
      const accessToken = (session as any)?.accessToken
      await deletePost(postId, accessToken)

      // إذا كان في صفحة التعديل أو التفاصيل، إعادة التوجيه للرئيسية
      if (isDetailsPage || pathname?.includes('/edit')) {
        const homeHref = localeFromParams ? `/${localeFromParams}` : '/'
        router.push(homeHref)
      } else {
        // إذا كان في صفحة list، إزالة المنشور من المكون
        if (onDeleteCallback) {
          onDeleteCallback(postId)
        }
      }
    } catch (error) {
      console.error('Error deleting post:', error)
      alert(error instanceof Error ? error.message : t('post.errorDeletingPost', locale))
    } finally {
      setIsDeleting(false)
    }
  }

  const shouldTruncateCaption = !isDetailsPage
  const MAX_CAPTION_CHARS = 160
  const normalizedCaption = String(caption ?? '')
  const hasLongCaption = normalizedCaption.length > MAX_CAPTION_CHARS
  const shortCaption = hasLongCaption ? `${normalizedCaption.slice(0, MAX_CAPTION_CHARS).trim()}…` : normalizedCaption

  const [showLoginAlert, setShowLoginAlert] = useState(false)
  const [showShareModal, setShowShareModal] = useState(false)
  /** في الخلاصة تبقى مخفية حتى يضغط «تعليق»؛ في صفحة المنشور تُعرض مباشرة */
  const [showComments, setShowComments] = useState(isDetailsPage)
  const [commentText, setCommentText] = useState('')
  const [sending, setSending] = useState(false)
  const [postLikesCount, setPostLikesCount] = useState<number>(Number(initialPostLikesCount) || 0)
  const [postLikedByMe, setPostLikedByMe] = useState<boolean>(initialPostLikedByMe)
  const [postReactionTypeByMe, setPostReactionTypeByMe] = useState<
    'like' | 'love' | 'care' | 'haha' | 'wow' | 'sad' | 'angry' | null
  >(initialPostLikedByMe ? (initialReactionTypeByMe ?? 'like') : null)
  const [postReactionCounts, setPostReactionCounts] = useState<Record<ReactionKey, number>>(initialReactionCounts)
  const [isExpanded, setIsExpanded] = useState(false)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(Boolean(commentsCount) && commentsCount > commentsPreview.length)
  const [openReplyForId, setOpenReplyForId] = useState<string | null>(null)
  const [replyValueById, setReplyValueById] = useState<Record<string, string>>({})
  const [loadingRepliesById, setLoadingRepliesById] = useState<Record<string, boolean>>({})
  const [replyPageById, setReplyPageById] = useState<Record<string, number>>({})
  const [hasMoreRepliesById, setHasMoreRepliesById] = useState<Record<string, boolean>>({})

  const topReactionKeys = useMemo(() => {
    return [...REACTION_ORDER]
      .sort((a, b) => {
        const byCount = (postReactionCounts[b] ?? 0) - (postReactionCounts[a] ?? 0)
        if (byCount !== 0) return byCount
        return REACTION_ORDER.indexOf(a) - REACTION_ORDER.indexOf(b)
      })
      .filter((key) => (postReactionCounts[key] ?? 0) > 0)
      .slice(0, 3)
  }, [postReactionCounts])

  const myReactionLabel = useMemo(() => {
    if (!postReactionTypeByMe) return ''
    const labelsAr: Record<ReactionKey, string> = {
      like: 'أعجبني',
      love: 'أحببته',
      care: 'مهتم',
      haha: 'أضحكني',
      wow: 'أدهشني',
      sad: 'أحزنني',
      angry: 'أغضبني',
    }
    const labelsEn: Record<ReactionKey, string> = {
      like: 'Like',
      love: 'Love',
      care: 'Care',
      haha: 'Haha',
      wow: 'Wow',
      sad: 'Sad',
      angry: 'Angry',
    }
    const dict = locale === 'ar' ? labelsAr : labelsEn
    return dict[postReactionTypeByMe]
  }, [locale, postReactionTypeByMe])

  const handleCardOpenDetails = (e: any) => {
    if (isDetailsPage || !postDetailsHref) return
    const target = e?.target as HTMLElement | null
    if (!target) return
    if (target.closest('a,button,input,textarea,select,label,[role="button"],.dropdown-menu,.modal,[data-glightbox]')) {
      return
    }
    router.push(postDetailsHref)
  }

  const initialUiComments = useMemo<CommentType[]>(() => {
    const basePostId = String(post?.id ?? '')

    return commentsPreview
      .filter(Boolean)
      .map((c) => {
        const created = c.created_at ? new Date(c.created_at) : new Date()
        const authorName = c.user?.name || t('post.user', locale)
        const authorAvatar = (
          resolveMediaUrl((c.user as any)?.avatar_url || c.user?.avatar || '') ||
          defaultUserAvatar.src
        ) as any
        return {
          id: String(c.id),
          postId: basePostId as any,
          socialUserId: String(c.user?.id ?? c.id) as any,
          socialUser: {
            id: String(c.user?.id ?? c.id) as any,
            name: authorName,
            avatar: authorAvatar,
            mutualCount: 0,
            role: 'user',
            status: 'online',
            lastMessage: '',
            lastActivity: created,
            isStory: false,
          } as any,
          replyTo: c.parent_id ? String(c.parent_id) : undefined,
          comment: c.body ?? '',
          likesCount: c.likes_count ?? 0,
          likedByMe: c.liked_by_me ?? false,
          repliesCount: c.replies_count ?? 0,
          createdAt: created,
          children: [],
        }
      })
  }, [commentsPreview, post?.id])

  const [uiComments, setUiComments] = useState<CommentType[]>(initialUiComments)

  const loadCommentsPage = async (targetPage: number) => {
    const postId = post?.id
    if (!postId) return

    const res = await fetch(`/api/posts/${postId}/comments?page=${targetPage}&per_page=10`, {
      method: 'GET',
      headers: { Accept: 'application/json' },
    })

    const json = (await res.json().catch(() => ({}))) as CommentsListResponse
    const items = Array.isArray(json.data) ? json.data : []
    const mapped = items.map((c) => {
      const created = c.created_at ? new Date(c.created_at) : new Date()
      const authorName = c.user?.name || t('post.user', locale)
      const authorAvatar = (
        resolveMediaUrl((c.user as any)?.avatar_url || c.user?.avatar || '') ||
        defaultUserAvatar.src
      ) as any
      return {
        id: String(c.id),
        postId: String(postId) as any,
        socialUserId: String(c.user?.id ?? c.id) as any,
        socialUser: {
          id: String(c.user?.id ?? c.id) as any,
          name: authorName,
          avatar: authorAvatar,
          mutualCount: 0,
          role: 'user',
          status: 'online',
          lastMessage: '',
          lastActivity: created,
          isStory: false,
        } as any,
        replyTo: c.parent_id ? String(c.parent_id) : undefined,
        comment: c.body ?? '',
        likesCount: c.likes_count ?? 0,
        likedByMe: c.liked_by_me ?? false,
        repliesCount: c.replies_count ?? 0,
        createdAt: created,
        children: [],
      } as CommentType
    })

    // FB-like behavior: first expand replaces preview with real page 1
    if (!isExpanded && targetPage === 1) {
      setUiComments(mapped)
    } else {
      // append older (avoid duplicates by id)
      setUiComments((prev) => {
        const seen = new Set(prev.map((x) => String(x.id)))
        const next = [...prev]
        for (const m of mapped) {
          if (!seen.has(String(m.id))) next.push(m)
        }
        return next
      })
    }

    setHasMore(Boolean(json.meta?.next_page_url))
    setPage(targetPage)
    setIsExpanded(true)
  }

  const onSendComment = async () => {
    if (status !== 'authenticated') {
      setShowLoginAlert(true)
      return
    }
    const postId = post?.id
    if (!postId) return
    const trimmed = commentText.trim()
    if (!trimmed) return

    setSending(true)
    try {
      const res = await fetch(`/api/posts/${postId}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({ body: trimmed }),
      })

      const json = (await res.json().catch(() => ({}))) as CreateCommentResponse
      if (handleEmailVerificationBlock(json, locale)) return
      if (!res.ok || !json?.success || !json?.data) {
        throw new Error(json?.message || 'Failed to create comment')
      }

      const c = json.data
      const created = c.created_at ? new Date(c.created_at) : new Date()
      const authorName = c.user?.name || (session as any)?.user?.name || t('post.you', locale)
      // Prefer the freshly-loaded profile avatar, then session image, then default.
      const sessionAvatar = (
        currentUserAvatar ||
        resolveMediaUrl((session as any)?.user?.image || '') ||
        defaultUserAvatar.src
      ) as any

      const mapped: CommentType = {
        id: String(c.id),
        postId: String(postId) as any,
        socialUserId: String(c.user?.id ?? (session as any)?.user?.id ?? 'me') as any,
        socialUser: {
          id: String(c.user?.id ?? (session as any)?.user?.id ?? 'me') as any,
          name: authorName,
          avatar: (
            resolveMediaUrl((c.user as any)?.avatar_url || c.user?.avatar || '') || sessionAvatar
          ) as any,
          mutualCount: 0,
          role: 'user',
          status: 'online',
          lastMessage: '',
          lastActivity: created,
          isStory: false,
        } as any,
        comment: c.body ?? trimmed,
        likesCount: c.likes_count ?? 0,
        likedByMe: c.liked_by_me ?? false,
        repliesCount: c.replies_count ?? 0,
        createdAt: created,
        children: [],
      }

      // prepend the new comment
      setUiComments((prev) => [mapped, ...prev])
      setCommentText('')
      setIsExpanded(true)
    } catch (e) {
      console.error('Error sending comment:', e)
    } finally {
      setSending(false)
    }
  }

  const onToggleLikePost = async (reactionType?: 'like' | 'love' | 'care' | 'haha' | 'wow' | 'sad' | 'angry') => {
    if (status !== 'authenticated') {
      setShowLoginAlert(true)
      return
    }
    const postId = post?.id
    if (!postId) return

    // optimistic UI
    const prevLiked = postLikedByMe
    const prevCount = postLikesCount
    const prevReactionType = postReactionTypeByMe
    const prevReactionCounts = postReactionCounts

    if (!reactionType && prevLiked) {
      // remove existing reaction
      setPostLikedByMe(false)
      setPostReactionTypeByMe(null)
      setPostLikesCount(Math.max(0, prevCount - 1))
    } else if (reactionType && !prevLiked) {
      // first reaction
      setPostLikedByMe(true)
      setPostReactionTypeByMe(reactionType)
      setPostLikesCount(prevCount + 1)
    } else if (reactionType && prevLiked) {
      // switch reaction type (same total count)
      setPostLikedByMe(true)
      setPostReactionTypeByMe(reactionType)
      setPostLikesCount(prevCount)
    }

    try {
      const res = await fetch(`/api/posts/${postId}/reactions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ type: reactionType ?? (prevReactionType ?? 'like') }),
      })
      const json = (await res.json().catch(() => ({}))) as PostReactionToggleResponse
      if (handleEmailVerificationBlock(json, locale)) return
      if (!res.ok || !json?.success) throw new Error(json?.message || 'Failed to like post')

      setPostLikesCount(Number(json.data?.likes_count ?? 0))
      setPostLikedByMe(Boolean(json.data?.toggled_on))
      setPostReactionTypeByMe((json.data?.reaction_type_by_me as any) ?? null)
      setPostReactionCounts(normalizeReactionCounts((json.data?.reaction_counts as any) ?? null))
    } catch (e) {
      console.error('Error toggling post like:', e)
      // rollback
      setPostLikedByMe(prevLiked)
      setPostLikesCount(prevCount)
      setPostReactionTypeByMe(prevReactionType)
      setPostReactionCounts(prevReactionCounts)
    }
  }

  const contactHref = user?.mobile ? `tel:${String(user.mobile).trim()}` : user?.email ? `mailto:${String(user.email).trim()}` : null
  const contactLabel = user?.mobile ? t('post.contact', locale) : user?.email ? t('post.sendEmail', locale) : t('post.noContactData', locale)

  const onContact = async () => {
    if (!post?.id || !contactHref) return

    try {
      await sendAnalyticsEvent({
        post_id: String(post.id),
        event: 'post_call',
        meta: {
          contact_method: user?.mobile ? 'tel' : 'mailto',
          target_user_id: user?.id ?? post?.user_id,
          path: typeof window !== 'undefined' ? window.location.pathname : null,
        },
      })
    } catch (e) {
      console.error('Failed to log contact event', e)
    }

    window.location.href = contactHref
  }

  const onOpenChat = async () => {
    if (status !== 'authenticated') {
      setShowLoginAlert(true)
      return
    }

    const postId = post?.id
    if (!postId) return

    try {
      // Get or create chat
      const res = await fetch(`/api/posts/${postId}/chat`, {
        method: 'GET',
        headers: { Accept: 'application/json' },
      })

      const json = await res.json()

      if (handleEmailVerificationBlock(json, locale)) return

      if (!res.ok) {
        const errorMsg = json?.message || `HTTP ${res.status}: ${res.statusText}`
        console.error('Chat API error:', { status: res.status, json })
        throw new Error(errorMsg)
      }

      if (!json?.success || !json?.data) {
        console.error('Invalid chat response:', json)
        throw new Error(json?.message || 'Invalid response from server')
      }

      const chatId = json.data.id
      if (!chatId) {
        console.error('No chat ID in response:', json)
        throw new Error('No chat ID received')
      }

      router.push(`/${locale}/messaging?chat=${encodeURIComponent(String(chatId))}`)
    } catch (error) {
      console.error('Failed to open chat:', error)
      const errorMessage = error instanceof Error ? error.message : t('post.failedToOpenChat', locale)
      alert(`${errorMessage}. ${t('post.pleaseTryAgain', locale)}`)
    }
  }

  const updateCommentTree = (items: CommentType[], id: string, updater: (c: CommentType) => CommentType): CommentType[] => {
    return items.map((c) => {
      if (String(c.id) === id) return updater(c)
      if (c.children?.length) {
        return { ...c, children: updateCommentTree(c.children, id, updater) }
      }
      return c
    })
  }

  const onToggleLikeComment = async (commentId: string) => {
    if (status !== 'authenticated') {
      setShowLoginAlert(true)
      return
    }
    try {
      const res = await fetch(`/api/comments/${commentId}/reactions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ type: 'like' }),
      })
      const json = (await res.json().catch(() => ({}))) as ReactionToggleResponse
      if (handleEmailVerificationBlock(json, locale)) return
      if (!res.ok || !json?.success) throw new Error(json?.message || 'Failed to react')

      const likesCount = json.data?.likes_count ?? 0
      const likedByMe = Boolean(json.data?.toggled_on)
      setUiComments((prev) =>
        updateCommentTree(prev, commentId, (c) => ({
          ...c,
          likesCount,
          likedByMe,
        }))
      )
    } catch (e) {
      console.error('Error toggling like:', e)
    }
  }

  const onReplyClick = (commentId: string) => {
    if (status !== 'authenticated') {
      setShowLoginAlert(true)
      return
    }
    setOpenReplyForId((prev) => (prev === commentId ? null : commentId))
  }

  const loadReplies = async (commentId: string, pageToLoad: number) => {
    try {
      setLoadingRepliesById((p) => ({ ...p, [commentId]: true }))
      const res = await fetch(`/api/comments/${commentId}/replies?page=${pageToLoad}&per_page=5`, {
        method: 'GET',
        headers: { Accept: 'application/json' },
      })
      const json = (await res.json().catch(() => ({}))) as CommentsListResponse
      const items = Array.isArray(json.data) ? json.data : []

      const mappedReplies: CommentType[] = items.map((c) => {
        const created = c.created_at ? new Date(c.created_at) : new Date()
        const authorName = c.user?.name || t('post.user', locale)
        const authorAvatar = (
          resolveMediaUrl((c.user as any)?.avatar_url || c.user?.avatar || '') ||
          defaultUserAvatar.src
        ) as any
        return {
          id: String(c.id),
          postId: String(post?.id ?? '') as any,
          socialUserId: String(c.user?.id ?? c.id) as any,
          socialUser: {
            id: String(c.user?.id ?? c.id) as any,
            name: authorName,
            avatar: authorAvatar,
            mutualCount: 0,
            role: 'user',
            status: 'online',
            lastMessage: '',
            lastActivity: created,
            isStory: false,
          } as any,
          replyTo: c.parent_id ? String(c.parent_id) : undefined,
          comment: c.body ?? '',
          likesCount: c.likes_count ?? 0,
          likedByMe: c.liked_by_me ?? false,
          repliesCount: 0,
          createdAt: created,
          children: [],
        }
      })

      const hasMore = Boolean(json.meta?.next_page_url)
      setHasMoreRepliesById((p) => ({ ...p, [commentId]: hasMore }))
      setReplyPageById((p) => ({ ...p, [commentId]: pageToLoad }))

      setUiComments((prev) =>
        updateCommentTree(prev, commentId, (c) => {
          const existing = c.children ?? []
          const seen = new Set(existing.map((x) => String(x.id)))
          const merged = [...existing]
          for (const r of mappedReplies) {
            if (!seen.has(String(r.id))) merged.push(r)
          }
          return { ...c, children: merged }
        })
      )
    } catch (e) {
      console.error('Error loading replies:', e)
    } finally {
      setLoadingRepliesById((p) => ({ ...p, [commentId]: false }))
    }
  }

  const onViewRepliesClick = (commentId: string) => {
    const currentPage = replyPageById[commentId] ?? 0
    if (currentPage === 0) {
      void loadReplies(commentId, 1)
    }
  }

  const onLoadMoreReplies = (commentId: string) => {
    const current = replyPageById[commentId] ?? 0
    void loadReplies(commentId, current + 1)
  }

  const onSubmitReply = async (parentId: string) => {
    if (status !== 'authenticated') {
      setShowLoginAlert(true)
      return
    }
    const postId = post?.id
    if (!postId) return
    const value = (replyValueById[parentId] ?? '').trim()
    if (!value) return

    try {
      const res = await fetch(`/api/posts/${postId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ body: value, parent_id: Number(parentId) }),
      })
      const json = (await res.json().catch(() => ({}))) as CreateCommentResponse
      if (handleEmailVerificationBlock(json, locale)) return
      if (!res.ok || !json?.success || !json?.data) throw new Error(json?.message || 'Failed to reply')

      const c = json.data
      const created = c.created_at ? new Date(c.created_at) : new Date()
      const authorName = c.user?.name || (session as any)?.user?.name || t('post.you', locale)
      const sessionAvatar = (
        currentUserAvatar ||
        resolveMediaUrl((session as any)?.user?.image || '') ||
        defaultUserAvatar.src
      ) as any

      const mappedReply: CommentType = {
        id: String(c.id),
        postId: String(postId) as any,
        socialUserId: String(c.user?.id ?? (session as any)?.user?.id ?? 'me') as any,
        socialUser: {
          id: String(c.user?.id ?? (session as any)?.user?.id ?? 'me') as any,
          name: authorName,
          avatar: (
            resolveMediaUrl((c.user as any)?.avatar_url || c.user?.avatar || '') || sessionAvatar
          ) as any,
          mutualCount: 0,
          role: 'user',
          status: 'online',
          lastMessage: '',
          lastActivity: created,
          isStory: false,
        } as any,
        replyTo: parentId,
        comment: c.body ?? value,
        likesCount: c.likes_count ?? 0,
        likedByMe: c.liked_by_me ?? false,
        repliesCount: 0,
        createdAt: created,
        children: [],
      }

      setUiComments((prev) =>
        updateCommentTree(prev, parentId, (parent) => ({
          ...parent,
          repliesCount: (parent.repliesCount ?? 0) + 1,
          children: [mappedReply, ...(parent.children ?? [])],
        }))
      )
      setReplyValueById((p) => ({ ...p, [parentId]: '' }))
      setOpenReplyForId(null)
    } catch (e) {
      console.error('Error submitting reply:', e)
    }
  }

  return (
    <Card ref={cardRef as any} className={clsx(styles.fbCard, isFeaturedActive && styles.fbCardFeatured)} style={{ cursor: isDetailsPage ? 'default' : 'pointer' }}>
      {!isDetailsPage && (
        <CardHeader className={styles.fbHeader}>
          <div className="d-flex align-items-center justify-content-between">
            <div className="d-flex align-items-center">
              <div className="me-2">
                {avatarSrc ? (
                  <span role="button">
                    <Image
                      unoptimized
                      width={42}
                      height={42}
                      className={styles.avatar}
                      src={avatarSrc}
                      alt={userName}
                    />
                  </span>
                ) : (
                  <div className={`${styles.avatar} bg-light d-flex align-items-center justify-content-center text-uppercase small`}>
                    {userName?.slice(0, 1) || '?'}
                  </div>
                )}
              </div>

              <div>
                <h6 className={styles.userName}>
                  <span role="button">{userName}</span>
                </h6>
                <div className={styles.metaRow}>
                  {createdAtDate && <span>{timeSince(createdAtDate)}</span>}
                  {isFeaturedActive && (
                    <span className={styles.featuredBadge}>
                      <BsStars size={12} aria-hidden />
                      {locale === 'ar' ? 'مميز' : 'Featured'}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <ActionMenu
              name={userName}
              canEdit={canEdit}
              editHref={postEditHref}
              canDelete={canDelete}
              onDelete={handleDelete}
              locale={locale}
            />
          </div>
        </CardHeader>
      )}


      {/* تفاصيل tags — مخفية في صفحة المنشور لتفادي التكرار مع شريط العنوان فوق البطاقة */}
      {!isDetailsPage && (sectionName || categoryName || cityName) && (
        <CardBody className={styles.tags}>
          <div className="d-flex flex-wrap gap-2">
            {sectionName && sectionSlug ? (
              <Link
                href={localeFromParams ? `/${localeFromParams}/sections/${sectionSlug}` : `/sections/${sectionSlug}`}
                className={clsx(styles.chip, styles.chipSection)}
              >
                {sectionName}
              </Link>
            ) : (
              sectionName && (
                <span className={clsx(styles.chip, styles.chipSection)}>
                  {sectionName}
                </span>
              )
            )}

            {categoryName && sectionSlug && categorySlug ? (
              <Link
                href={localeFromParams ? `/${localeFromParams}/sections/${sectionSlug}/${categorySlug}` : `/sections/${sectionSlug}/${categorySlug}`}
                className={clsx(styles.chip, styles.chipCategory)}
              >
                {categoryName}
              </Link>
            ) : (
              categoryName && (
                <span className={clsx(styles.chip, styles.chipCategory)}>
                  {categoryName}
                </span>
              )
            )}
            {cityName && (
              <span className={clsx(styles.chip, styles.chipCity)}>
                {cityName}
              </span>
            )}
          </div>
        </CardBody>
      )}

      <CardBody className={styles.content}>
        {isDetailsPage && (
          <div className={styles.detailsPageIntro}>
            <div className={styles.detailsPageIntroTop}>
              <h1 className={styles.detailH1}>
                {title || (locale === 'ar' ? `إعلان ${post?.id}` : `Listing ${post?.id}`)}
              </h1>
              {(canEdit || canDelete) && (
                <div className={styles.detailsPageActions}>
                  <ActionMenu
                    name={userName}
                    canEdit={canEdit}
                    editHref={postEditHref}
                    canDelete={canDelete}
                    onDelete={handleDelete}
                    locale={locale}
                  />
                </div>
              )}
            </div>
            {(sectionName || categoryName || cityName) && (
              <div className={styles.detailsPageChips}>
                {sectionName && sectionSlug ? (
                  <Link
                    href={localeFromParams ? `/${localeFromParams}/sections/${sectionSlug}` : `/sections/${sectionSlug}`}
                    className={clsx(styles.chip, styles.chipSection)}
                  >
                    {sectionName}
                  </Link>
                ) : (
                  sectionName && <span className={clsx(styles.chip, styles.chipSection)}>{sectionName}</span>
                )}
                {categoryName && sectionSlug && categorySlug ? (
                  <Link
                    href={
                      localeFromParams
                        ? `/${localeFromParams}/sections/${sectionSlug}/${categorySlug}`
                        : `/sections/${sectionSlug}/${categorySlug}`
                    }
                    className={clsx(styles.chip, styles.chipCategory)}
                  >
                    {categoryName}
                  </Link>
                ) : (
                  categoryName && <span className={clsx(styles.chip, styles.chipCategory)}>{categoryName}</span>
                )}
                {cityName && <span className={clsx(styles.chip, styles.chipCity)}>{cityName}</span>}
              </div>
            )}
          </div>
        )}
        {!isDetailsPage && title && (
          <h3 className={styles.title}>
            <Link href={postDetailsHref} className="text-decoration-none text-reset">
              {title}
            </Link>
          </h3>
        )}
        {normalizedCaption && (
          <p className={clsx(styles.caption, isDetailsPage && styles.captionDetails)}>
            {linkifyPlainText(
              shouldTruncateCaption ? shortCaption : normalizedCaption,
              styles.captionLink,
            )}{' '}
            {shouldTruncateCaption && hasLongCaption && (
              <Link href={postDetailsHref} className="ms-1">
                {t('post.readMore', locale)}
              </Link>
            )}
          </p>
        )}




        {image && !banner && (
          <Link href={postDetailsHref} className={`${styles.mediaLink} text-decoration-none`}>
            <div className={styles.mediaWrap}>
              <Image
                unoptimized
                fill
                className={styles.mainImage}
                src={image}
                alt={title || 'Post'}
                sizes="(max-width: 576px) 100vw, (max-width: 1200px) 92vw, 720px"
              />
              {imageCount > 1 && (
                <span className={styles.imageCount}>
                  +{imageCount}
                </span>
              )}
            </div>
          </Link>
        )}


<div  onClick={handleCardOpenDetails}>


      {banner }

      {attributesAndOptions && attributesAndOptions}



        {photos && (
          <div className="d-flex justify-content-between">
            <Row className="g-3">
              <Col xs={6}>
                <GlightBox className="h-100" href={postImg3.src} data-gallery="image-popup">
                  <Image className="rounded img-fluid" src={postImg3} alt="Image" />
                </GlightBox>
              </Col>
              <Col xs={6}>
                <GlightBox href={postImg1.src} data-glightbox data-gallery="image-popup">
                  <Image className="rounded img-fluid" src={postImg1} alt="Image" />
                </GlightBox>
                <div className="position-relative bg-dark mt-3 rounded">
                  <div className="hover-actions-item position-absolute top-50 start-50 translate-middle z-index-9">
                    <Link className="btn btn-link text-white" href="#">
                      {' '}
                      {t('post.viewAll', locale)}{' '}
                    </Link>
                  </div>
                  <GlightBox href={postImg2.src} data-glightbox data-gallery="image-popup">
                    <Image className="img-fluid opacity-50 rounded" src={postImg2} alt="image" />
                  </GlightBox>
                </div>
              </Col>
            </Row>
          </div>
        )}
        {isVideo && <VideoPlayer />}


        </div>

        <div className={styles.reactionSummaryBar}>
          <div className={styles.reactionSummaryLeft}>
            {topReactionKeys.length > 0 && (
              <span className={styles.reactionPills} aria-label={locale === 'ar' ? 'التفاعلات' : 'Reactions'}>
                {topReactionKeys.map((key) => (
                  <span key={key} className={styles.reactionPill}>
                    {REACTION_EMOJI[key]}
                  </span>
                ))}
              </span>
            )}
            <span className={styles.reactionCountText}>{postLikesCount}</span>
          </div>
          {postReactionTypeByMe && (
            <div className={styles.myReactionBadge}>
              <span className={styles.myReactionEmoji}>{REACTION_EMOJI[postReactionTypeByMe]}</span>
              <span>{locale === 'ar' ? `تفاعلك: ${myReactionLabel}` : `Your reaction: ${myReactionLabel}`}</span>
            </div>
          )}
        </div>


        <PostActions
          postLikedByMe={postLikedByMe}
          reactionTypeByMe={postReactionTypeByMe}
          postLikesCount={postLikesCount}
          onToggleLikePost={onToggleLikePost}
          commentsCount={commentsCount}
          onShowComments={() => {
            setShowComments(true)
            window.requestAnimationFrame(() => {
              setTimeout(() => {
                const el = document.getElementById(`comments-${post?.id}`)
                el?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
                commentInputRef.current?.focus({ preventScroll: true })
              }, 50)
            })
          }}
          onShowShare={() => setShowShareModal(true)}
          onOpenChat={onOpenChat}
          isAuthenticated={status === 'authenticated'}
          postId={post?.id}
          onContact={onContact}
          contactHref={contactHref}
          contactLabel={contactLabel}
          userMobile={user?.mobile}
          locale={locale}
          isOwner={isOwner}
          showFeature={isOwner && !isFeaturedActive}
          onFeature={() => setShowFeatureModal(true)}
        />

        {isOwner && (
          <FeaturePostModal
            show={showFeatureModal}
            onHide={() => setShowFeatureModal(false)}
            postId={Number(post?.id)}
            locale={locale}
            accessToken={(session as any)?.accessToken ?? ''}
            origin={typeof window !== 'undefined' ? window.location.origin : ''}
          />
        )}


        <SharePostModal
          show={showShareModal}
          onHide={() => setShowShareModal(false)}
          postId={String(post?.id ?? '')}
          postUrl={postDetailsHref}
          title={title}
          defaultMessage={`${t('post.watchOnAnanas', locale)}: ${title || (locale === 'ar' ? 'منشور' : 'Post')}`}
        />

        {showComments && (
          <div className={styles.commentsSection}>
            <div id={`comments-${post?.id}`} className={styles.commentsComposer}>
              <div className={styles.commentsAvatarWrap}>
                <span role="button">
                  <Image
                    key={currentUserAvatar || 'default'}
                    unoptimized
                    className={styles.commentsAvatar}
                    src={
                      (currentUserAvatar ||
                        resolveMediaUrl((session as any)?.user?.image || '') ||
                        defaultUserAvatar.src) as any
                    }
                    alt={(session as any)?.user?.name || 'avatar'}
                    width={30}
                    height={30}
                  />
                </span>
              </div>

              <form
                className={styles.commentsFormWrap}
                onSubmit={(e) => {
                  e.preventDefault()
                  void onSendComment()
                }}
              >
                {status !== 'authenticated' && (
                  <div
                    className="cursor-pointer"
                    style={{ position: 'absolute', zIndex: 1, left: 0, right: 0, top: 0, bottom: 0 }}
                    onClick={() => setShowLoginAlert(true)}
                  />
                )}
                <textarea
                  ref={commentInputRef}
                  data-autoresize
                  className={styles.commentsInput}
                  rows={1}
                  placeholder={status === 'authenticated' ? t('post.addComment', locale) : t('post.loginToComment', locale)}
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  disabled={status !== 'authenticated' || sending}
                />
                <button
                  className={styles.sendBtn}
                  type="submit"
                  disabled={status !== 'authenticated' || sending || !commentText.trim()}
                  aria-label={t('post.send', locale)}
                >
                  <BsSendFill size={14} />
                </button>
              </form>
            </div>

            {uiComments.length > 0 && (
              <ul className={styles.commentsList}>
                {uiComments.map((comment) => (
                  <CommentItem
                    {...(comment as any)}
                    key={comment.id}
                    onToggleLike={onToggleLikeComment}
                    onReplyClick={onReplyClick}
                    onViewRepliesClick={onViewRepliesClick}
                    onLoadMoreReplies={onLoadMoreReplies}
                    showReplyBox={openReplyForId === String(comment.id)}
                    replyValue={replyValueById[String(comment.id)] ?? ''}
                    onReplyValueChange={(id, value) => setReplyValueById((p) => ({ ...p, [id]: value }))}
                    onSubmitReply={onSubmitReply}
                    loadingReplies={loadingRepliesById[String(comment.id)] ?? false}
                    hasMoreReplies={hasMoreRepliesById[String(comment.id)] ?? false}
                    locale={locale}
                  />
                ))}
              </ul>
            )}
          </div>
        )}

        <LoginRequiredDialog
          show={showLoginAlert}
          onHide={() => setShowLoginAlert(false)}
          locale={locale}
        />
      </CardBody>

      <CardFooter className={styles.cardFooter}>
        {showComments && hasMore && (
          <LoadContentButton
            name={isExpanded ? t('post.loadMoreComments', locale) : t('post.viewMoreComments', locale)}
            className={styles.loadMoreComments}
            onClick={() => void loadCommentsPage(isExpanded ? page + 1 : 1)}
          />
        )}
      </CardFooter>
    </Card>
  )
}

export default PostCard
