import LoadContentButton from '@/components/LoadContentButton'
import type { CommentType } from '@/types/data'
import { timeSince } from '@/utils/date'
import Image from 'next/image'
import Link from 'next/link'
import { t } from '@/lib/translations'
import type { SupportedLocale } from '@/lib/localization'
import { resolveMediaUrl } from '@/lib/media/resolveMediaUrl'
import defaultUserAvatar from '@/assets/images/avatar/user-default.svg'
import styles from './CommentItem.module.css'

type CommentItemProps = CommentType & {
  locale?: SupportedLocale
  onToggleLike?: (commentId: string) => void
  onReplyClick?: (commentId: string) => void
  onViewRepliesClick?: (commentId: string) => void
  showReplyBox?: boolean
  replyValue?: string
  onReplyValueChange?: (commentId: string, value: string) => void
  onSubmitReply?: (commentId: string) => void
  loadingReplies?: boolean
  hasMoreReplies?: boolean
  onLoadMoreReplies?: (commentId: string) => void
}

const CommentItem = ({
  id,
  comment,
  likesCount,
  likedByMe,
  repliesCount,
  children,
  socialUser,
  createdAt,
  image,
  onToggleLike,
  onReplyClick,
  onViewRepliesClick,
  showReplyBox,
  replyValue,
  onReplyValueChange,
  onSubmitReply,
  loadingReplies,
  hasMoreReplies,
  onLoadMoreReplies,
  locale = 'ar',
}: CommentItemProps) => {
  // The parent (`PostCard`/`UserComments`) already passes a fully-resolved
  // avatar URL — either a CDN/API URL or the default static SVG path
  // (`/_next/static/media/user-default.*.svg`).  Calling `resolveMediaUrl`
  // again here would mistakenly rewrite the `/_next/...` path to the Laravel
  // host.  We only resolve when we genuinely receive a raw API path (no
  // leading slash, no protocol) — that path comes through if a caller forgot
  // to map the comment.  The `image` attachment, on the other hand, is still
  // raw from the API and must always be normalised.
  // Note: legacy `CommentType.socialUser.avatar` is typed as `StaticImageData`
  // but at runtime the API returns a string, so cast defensively.
  const rawAvatar = (socialUser?.avatar as unknown as string | undefined) ?? undefined
  const rawImage = (image as unknown as string | undefined) ?? undefined

  let avatarSrc = defaultUserAvatar.src
  if (rawAvatar) {
    const looksAbsolute = /^(https?:|data:|blob:|\/)/i.test(rawAvatar)
    avatarSrc = looksAbsolute ? rawAvatar : resolveMediaUrl(rawAvatar) || defaultUserAvatar.src
  }
  const attachmentSrc = rawImage ? resolveMediaUrl(rawImage) : ''
  return (
    <li className={styles.item}>
      {socialUser && (
        <>
          <div className={styles.row}>
            <div>
              <span role="button">
                <Image
                  className={styles.avatar}
                  src={avatarSrc}
                  alt={(socialUser?.name || 'user') + '-avatar'}
                  width={34}
                  height={34}
                  unoptimized
                />
              </span>
            </div>
            <div className={styles.body}>
              <div className={styles.bubble}>
                <h6 className={styles.name}>
                  <Link href="#" className={styles.nameLink}>
                    {socialUser.name}
                  </Link>
                </h6>
                <p className={styles.comment}>{comment}</p>
                {attachmentSrc && (
                  <Image
                    width={172}
                    height={277}
                    src={attachmentSrc}
                    alt=""
                    className={styles.attachmentImg}
                    unoptimized
                  />
                )}
              </div>

              <div className={styles.actions}>
                <span className={styles.time}>{timeSince(createdAt, locale)}</span>
                <span className={styles.actionSep} aria-hidden>
                  ·
                </span>
                <button
                  type="button"
                  className={styles.actionBtn}
                  onClick={() => onToggleLike?.(String(id))}
                >
                  {likedByMe ? t('post.unlike', locale) : t('post.likeComment', locale)} ({likesCount})
                </button>
                <span className={styles.actionSep} aria-hidden>
                  ·
                </span>
                <button
                  type="button"
                  className={styles.actionBtn}
                  onClick={() => onReplyClick?.(String(id))}
                >
                  {t('post.reply', locale)}
                </button>
                {((repliesCount ?? 0) > 0 || (children?.length ?? 0) > 0) && (
                  <>
                    <span className={styles.actionSep} aria-hidden>
                      ·
                    </span>
                    <button
                      type="button"
                      className={styles.actionBtn}
                      onClick={() => onViewRepliesClick?.(String(id))}
                      disabled={loadingReplies}
                    >
                      {t('post.viewReplies', locale)} ({repliesCount ?? children?.length ?? 0})
                    </button>
                  </>
                )}
              </div>

              {showReplyBox && (
                <div className={styles.replyWrap}>
                  <div className={styles.replyRow}>
                    <input
                      className={styles.replyInput}
                      placeholder={t('post.writeReply', locale)}
                      value={replyValue ?? ''}
                      onChange={(e) => onReplyValueChange?.(String(id), e.target.value)}
                    />
                    <button
                      type="button"
                      className={styles.replySend}
                      disabled={!replyValue?.trim()}
                      onClick={() => onSubmitReply?.(String(id))}
                    >
                      {t('post.send', locale)}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          <ul className={styles.nested}>
            {children?.map((childComment) => (
              <CommentItem
                key={childComment.id}
                {...(childComment as any)}
                onToggleLike={onToggleLike}
                onReplyClick={onReplyClick}
                onViewRepliesClick={onViewRepliesClick}
                onLoadMoreReplies={onLoadMoreReplies}
                locale={locale}
              />
            ))}
          </ul>
          {(hasMoreReplies || children?.length === 2) && (
            <LoadContentButton
              name={loadingReplies ? t('post.loadingReplies', locale) : t('post.loadMoreReplies', locale)}
              className={styles.loadMoreNested}
              onClick={() => onLoadMoreReplies?.(String(id))}
            />
          )}
        </>
      )}
    </li>
  )
}

export default CommentItem
