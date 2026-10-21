'use client'

import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import Image from 'next/image'

import host from '@/assets/images/avatar/ananas-host.svg'
import coffee from '@/assets/images/avatar/ananas-coffee.svg'
import auction from '@/assets/images/avatar/ananas-auction.svg'
import searcher from '@/assets/images/avatar/ananas-search.svg'
import type { SupportedLocale } from '@/lib/localization'

import styles from './MarketplaceStories.module.css'

type Story = {
  id: string
  nameAr: string
  nameEn: string
  kindAr: string
  kindEn: string
  bodyAr: string
  bodyEn: string
  live?: boolean
  draft?: boolean
  expiresAr: string
  expiresEn: string
  image: 'sit' | 'alt'
}

const STORIES: Story[] = [
  {
    id: 'cars',
    nameAr: 'متجر النخبة',
    nameEn: 'Nokhba Store',
    kindAr: 'قصة متجر · تجريبي',
    kindEn: 'Store story · demo',
    bodyAr: 'عرض واجهة لمتجر. ليس بثاً، ولا حساباً حقيقياً.',
    bodyEn: 'A store-story preview. It is not a broadcast or a real account.',
    expiresAr: 'معاينة واجهة',
    expiresEn: 'Interface preview',
    image: 'sit',
  },
  {
    id: 'homes',
    nameAr: 'عرض جديد',
    nameEn: 'New offer',
    kindAr: 'عرض · تجريبي',
    kindEn: 'Offer · demo',
    bodyAr: 'تمييز لعرض جديد. لا يغيّر إعلانات السوق الحقيقية.',
    bodyEn: 'A highlight for a new offer. It does not change real listings.',
    expiresAr: 'معاينة واجهة',
    expiresEn: 'Interface preview',
    image: 'alt',
  },
  {
    id: 'phones',
    nameAr: 'مزاد اليوم',
    nameEn: 'Today’s auction',
    kindAr: 'مزاد · تجريبي',
    kindEn: 'Auction · demo',
    bodyAr: 'قصة مزاد للواجهة. المزايدة الحقيقية تبقى في صفحة المزادات.',
    bodyEn: 'An auction story for the interface. Real bidding stays on the auctions page.',
    expiresAr: 'معاينة واجهة',
    expiresEn: 'Interface preview',
    image: 'sit',
  },
  {
    id: 'jobs',
    nameAr: 'بائع موثّق',
    nameEn: 'Verified seller',
    kindAr: 'بائع · تجريبي',
    kindEn: 'Seller · demo',
    bodyAr: 'مثال لقصة بائع. الشارة لا تمنح توثيقاً حقيقياً.',
    bodyEn: 'A seller-story example. The badge does not grant real verification.',
    draft: true,
    expiresAr: 'لن تُنشر حتى يتوفر مسار القصص',
    expiresEn: 'It will not publish until a stories route exists',
    image: 'alt',
  },
]

export default function MarketplaceStories({
  locale,
  sections = [],
}: {
  locale: SupportedLocale
  sections?: { id: number; slug: string; name: string; icon: string | null }[]
}) {
  void sections
  const ar = locale === 'ar'
  const [openId, setOpenId] = useState<string | null>(null)
  const [liked, setLiked] = useState(false)
  const [reply, setReply] = useState('')
  const [sent, setSent] = useState(false)
  const [hold, setHold] = useState(false)
  const [videoNote, setVideoNote] = useState(false)
  const [mounted, setMounted] = useState(false)
  const index = STORIES.findIndex((story) => story.id === openId)
  const story = index >= 0 ? STORIES[index] : null

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    setLiked(false)
    setReply('')
    setSent(false)
    setVideoNote(false)
    setHold(false)
  }, [openId])

  useEffect(() => {
    if (!story || hold) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const timer = window.setTimeout(() => {
      const next = STORIES[index + 1]
      setOpenId(next ? next.id : null)
    }, 7000)
    return () => window.clearTimeout(timer)
  }, [story, index, hold])

  useEffect(() => {
    if (!story) return
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpenId(null)
      if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
        const forward = ar ? event.key === 'ArrowLeft' : event.key === 'ArrowRight'
        const nextIndex = forward ? index + 1 : index - 1
        if (nextIndex < 0 || nextIndex >= STORIES.length) {
          if (forward) setOpenId(null)
          return
        }
        setOpenId(STORIES[nextIndex].id)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = previous
      window.removeEventListener('keydown', onKey)
    }
  }, [story, index, ar])

  const add = () => {
    document.documentElement.dataset.composerIntent = 'sale'
    window.dispatchEvent(new CustomEvent('ananas:composer-intent', { detail: 'sale' }))
    document.getElementById('ananas-composer')?.setAttribute('data-expanded', '1')
    document.getElementById('ananas-composer')?.scrollIntoView({ block: 'center' })
  }

  const go = (nextIndex: number) => {
    if (nextIndex < 0 || nextIndex >= STORIES.length) {
      setOpenId(null)
      return
    }
    setOpenId(STORIES[nextIndex].id)
  }

  const viewer =
    mounted && story
      ? createPortal(
          <div className={styles.overlay} role="presentation" onClick={() => setOpenId(null)}>
            <div
              className={styles.viewer}
              role="dialog"
              aria-modal="true"
              aria-label={ar ? story.nameAr : story.nameEn}
              onClick={(event) => event.stopPropagation()}
            >
              <div className={styles.bars} aria-hidden>
                {STORIES.map((item, itemIndex) => (
                  <span key={item.id} data-on={itemIndex <= index ? '1' : '0'} />
                ))}
              </div>
              <div className={styles.viewerTop}>
                <strong>{ar ? story.nameAr : story.nameEn}</strong>
                <span>{ar ? story.kindAr : story.kindEn}</span>
                {story.live ? <em className={styles.liveMark}>LIVE</em> : null}
                <button type="button" onClick={() => setOpenId(null)} aria-label={ar ? 'إغلاق' : 'Close'}>
                  ×
                </button>
              </div>
              <div className={styles.art}>
                <span className={styles.letter}>{((ar ? story.nameAr : story.nameEn) || 'أ').slice(0, 1)}</span>
                <button type="button" className={styles.zonePrev} onClick={() => go(index - 1)} aria-label={ar ? 'السابق' : 'Previous'} />
                <button type="button" className={styles.zoneNext} onClick={() => go(index + 1)} aria-label={ar ? 'التالي' : 'Next'} />
              </div>
              <p className={styles.body}>{ar ? story.bodyAr : story.bodyEn}</p>
              <p className={styles.expires}>{ar ? story.expiresAr : story.expiresEn}</p>
              {videoNote ? (
                <p className={styles.note}>
                  {ar ? 'لا يوجد ملف فيديو في هذه القصة التجريبية.' : 'This demo story has no video file.'}
                </p>
              ) : null}
              <div className={styles.tools}>
                <button type="button" aria-pressed={liked} onClick={() => setLiked((value) => !value)}>
                  {liked ? (ar ? 'أعجبك' : 'Liked') : ar ? 'تفاعل' : 'React'}
                </button>
                <button type="button" onClick={() => setVideoNote(true)}>
                  {ar ? 'فيديو' : 'Video'}
                </button>
                <button type="button" onClick={() => go(index - 1)} disabled={index === 0}>
                  {ar ? 'السابق' : 'Previous'}
                </button>
                <button type="button" onClick={() => go(index + 1)}>
                  {ar ? 'التالي' : 'Next'}
                </button>
              </div>
              <form
                className={styles.reply}
                onSubmit={(event) => {
                  event.preventDefault()
                  if (!reply.trim()) return
                  setSent(true)
                }}
              >
                <input
                  value={reply}
                  onChange={(event) => {
                    setReply(event.target.value)
                    setSent(false)
                  }}
                  onFocus={() => setHold(true)}
                  onBlur={() => setHold(false)}
                  placeholder={ar ? 'رد يبقى على هذا الجهاز' : 'Reply stays on this device'}
                />
                <button type="submit">{ar ? 'إرسال' : 'Send'}</button>
              </form>
              {sent ? (
                <p className={styles.note}>{ar ? 'حُفظ الرد هنا فقط. لم يُرسل.' : 'The reply is saved here only. It was not sent.'}</p>
              ) : null}
            </div>
          </div>,
          document.body,
        )
      : null

  return (
    <section className={styles.wrap} aria-label={ar ? 'قصص السوق' : 'Marketplace stories'}>
      <div className={styles.head}>
        <h2>{ar ? 'قصص' : 'Stories'}</h2>
      </div>
      <div className={styles.row}>
        <button type="button" className={styles.item} onClick={add}>
          <span className={`${styles.ring} ${styles.add}`}>+</span>
          <span>{ar ? 'أضف قصة' : 'Add story'}</span>
        </button>
        {STORIES.map((item) => (
          <button key={item.id} type="button" className={styles.item} onClick={() => setOpenId(item.id)}>
            <span className={`${styles.ring} ${item.draft ? styles.draft : ''}`} data-tone={item.id}>
              <Image src={item.id === 'homes' ? coffee : item.id === 'phones' ? auction : item.id === 'jobs' ? searcher : host} alt="" width={48} height={48} />
            </span>
            <span>{ar ? item.nameAr : item.nameEn}</span>
          </button>
        ))}
      </div>
      {viewer}
    </section>
  )
}
