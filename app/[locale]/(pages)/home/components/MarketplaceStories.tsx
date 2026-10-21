'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'

import { getApiUrl } from '@/lib/api/config'
import { resolveMediaUrl } from '@/lib/media/resolveMediaUrl'
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
    nameAr: 'سيارات',
    nameEn: 'Cars',
    kindAr: 'قسم',
    kindEn: 'Category',
    bodyAr: 'قصة واجهة للسيارات. ليست حساب بائع، وتفتح البحث الحقيقي عن السيارات.',
    bodyEn: 'A cars interface story. It is not a seller account, and it opens a real car search.',
    expiresAr: 'معاينة واجهة',
    expiresEn: 'Interface preview',
    image: 'sit',
  },
  {
    id: 'homes',
    nameAr: 'عقارات',
    nameEn: 'Homes',
    kindAr: 'قسم',
    kindEn: 'Category',
    bodyAr: 'قصة واجهة للعقارات. لا يوجد بث، ولا تُعرض كحساب حقيقي.',
    bodyEn: 'A homes interface story. There is no live stream, and it is not shown as a real account.',
    expiresAr: 'معاينة واجهة',
    expiresEn: 'Interface preview',
    image: 'alt',
  },
  {
    id: 'phones',
    nameAr: 'موبايلات',
    nameEn: 'Phones',
    kindAr: 'قسم',
    kindEn: 'Category',
    bodyAr: 'قصة واجهة للموبايلات. ليست إعلاناً منشوراً.',
    bodyEn: 'A phones interface story. It is not a published listing.',
    expiresAr: 'معاينة واجهة',
    expiresEn: 'Interface preview',
    image: 'sit',
  },
  {
    id: 'jobs',
    nameAr: 'وظائف',
    nameEn: 'Jobs',
    kindAr: 'قسم',
    kindEn: 'Category',
    bodyAr: 'قصة واجهة للوظائف. المسودة تبقى على هذا الجهاز.',
    bodyEn: 'A jobs interface story. A draft stays on this device.',
    draft: true,
    expiresAr: 'لن تُنشر حتى يتوفر مسار القصص',
    expiresEn: 'It will not publish until a stories route exists',
    image: 'alt',
  },
]

function sectionIcon(icon?: string | null) {
  if (!icon) return null
  if (icon.startsWith('http://') || icon.startsWith('https://') || icon.startsWith('//')) return resolveMediaUrl(icon)
  const path = icon.startsWith('/') ? icon : `/${icon}`
  return resolveMediaUrl(getApiUrl(path))
}

export default function MarketplaceStories({
  locale,
  sections = [],
}: {
  locale: SupportedLocale
  sections?: { id: number; slug: string; name: string; icon: string | null }[]
}) {
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
        <h2>{ar ? 'قصص الأقسام' : 'Category stories'}</h2>
      </div>
      <div className={styles.row}>
        <button type="button" className={styles.item} onClick={add}>
          <span className={`${styles.ring} ${styles.add}`}>+</span>
          <span>{ar ? 'أضف قصة' : 'Add story'}</span>
        </button>
        {sections.slice(0, 8).map((section) => {
          const icon = sectionIcon(section.icon)
          return (
            <Link key={section.id} href={`/${locale}/sections/${section.slug}`} className={styles.item}>
              <span className={styles.ring}>
                {icon ? (
                  <Image src={icon} alt="" width={52} height={52} unoptimized />
                ) : (
                  <span className={styles.letter}>{(section.name || 'أ').slice(0, 1)}</span>
                )}
              </span>
              <span>{section.name}</span>
            </Link>
          )
        })}
        {sections.length === 0
          ? STORIES.map((item) => (
              <button key={item.id} type="button" className={styles.item} onClick={() => setOpenId(item.id)}>
                <span className={`${styles.ring} ${item.draft ? styles.draft : ''}`}>
                  <span className={styles.letter}>{(ar ? item.nameAr : item.nameEn).slice(0, 1)}</span>
                </span>
                <span>{ar ? item.nameAr : item.nameEn}</span>
              </button>
            ))
          : null}
      </div>
      {viewer}
    </section>
  )
}
