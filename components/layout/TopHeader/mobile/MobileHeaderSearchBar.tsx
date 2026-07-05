'use client'

import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useState, type FormEvent } from 'react'
import { IoMicOutline, IoScanOutline } from 'react-icons/io5'
import { BsSearch } from 'react-icons/bs'

import searchAvatar from '@/assets/images/icon/s200.png'
import type { SupportedLocale } from '@/lib/localization'

import styles from './MobileHeaderSearchBar.module.css'

type Props = {
  locale: SupportedLocale
}

/**
 * Mobile search row. The submit handler matches the desktop `TopHeader`:
 * it pushes to `/${locale}/search` (with the `q` query when there's a term).
 *
 * The mic/scan buttons are placeholders for voice and visual search; they
 * surface the affordances in the design but currently fall back to the same
 * search route so they remain interactive instead of being decorative.
 */
const MobileHeaderSearchBar = ({ locale }: Props) => {
  const router = useRouter()
  const [query, setQuery] = useState('')

  const isArabic = locale === 'ar'

  const placeholder = isArabic
    ? 'ما الذي تبحث عنه؟'
    : 'What are you looking for?'

  const submitLabel = isArabic ? 'بحث' : 'Search'
  const micLabel = isArabic ? 'بحث صوتي' : 'Voice search'
  const scanLabel = isArabic ? 'بحث بالصورة' : 'Visual search'

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const trimmed = query.trim()
    router.push(
      trimmed ? `/${locale}/search?q=${encodeURIComponent(trimmed)}` : `/${locale}/search`,
    )
  }

  return (
    <form className={styles.bar} role="search" onSubmit={handleSubmit}>
      <button type="submit" className={styles.submit} aria-label={submitLabel} title={submitLabel}>
        <BsSearch aria-hidden />
      </button>

      <input
        type="search"
        className={styles.input}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
        autoComplete="off"
      />

      {/* <button
        type="button"
        className={styles.iconBtn}
        aria-label={scanLabel}
        title={scanLabel}
        onClick={() => router.push(`/${locale}/search`)}
      >
        <IoScanOutline aria-hidden />
      </button> */}

      {/* <button
        type="button"
        className={styles.iconBtn}
        aria-label={micLabel}
        title={micLabel}
        onClick={() => router.push(`/${locale}/search`)}
      >
        <IoMicOutline aria-hidden />
      </button> */}

      <span className={styles.avatar} aria-hidden>
        <Image
          src={searchAvatar}
          alt=""
          width={26}
          height={26}
          priority
          className={styles.avatarImg}
        />
      </span>
    </form>
  )
}

export default MobileHeaderSearchBar
