'use client'

import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useRef, useState, type FormEvent } from 'react'
import { BsSearch } from 'react-icons/bs'

import searchAvatar from '@/assets/images/icon/s200.png'
import type { SupportedLocale } from '@/lib/localization'
import { rememberSearch, SmartSearchPanel, useSearchDismiss, useSearchFieldToggle, useSmartSearchAssist } from '@/components/search/SmartSearchPanel'

import styles from './MobileHeaderSearchBar.module.css'

type Props = {
  locale: SupportedLocale
}

const MobileHeaderSearchBar = ({ locale }: Props) => {
  const router = useRouter()
  const anchorRef = useRef<HTMLFormElement | null>(null)
  const [query, setQuery] = useState('')
  const assist = useSmartSearchAssist(locale, query)
  const listId = 'ananas-mobile-smart-search'
  const fieldToggle = useSearchFieldToggle(assist.open, assist.setOpen)
  useSearchDismiss(assist.open, assist.setOpen, anchorRef, listId, true)

  const isArabic = locale === 'ar'
  const placeholder = isArabic ? 'ابحث في الأقسام والإعلانات' : 'Search sections and listings'
  const submitLabel = isArabic ? 'بحث' : 'Search'

  const goToSearch = (value: string) => {
    const trimmed = value.trim()
    if (trimmed) rememberSearch(trimmed)
    assist.setOpen(false)
    router.push(trimmed ? `/${locale}/search?q=${encodeURIComponent(trimmed)}` : `/${locale}/search`)
  }

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const selected = assist.suggestions[assist.active]
    if (assist.open && selected && selected.group !== 'query') {
      assist.choose(selected)
      return
    }
    goToSearch(query)
  }

  return (
    <>
      <form
        ref={anchorRef}
        className={styles.bar}
        role="search"
        onSubmit={handleSubmit}
      >
        <button type="submit" className={styles.submit} aria-label={submitLabel} title={submitLabel}>
          <BsSearch aria-hidden />
        </button>

        <input
          type="search"
          className={styles.input}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            assist.setOpen(true)
          }}
          onMouseDown={fieldToggle.onMouseDown}
          onFocus={fieldToggle.onFocus}
          onClick={fieldToggle.onClick}
          onKeyDown={(event) => assist.onKeyDown(event)}
          placeholder={placeholder}
          aria-label={placeholder}
          aria-expanded={assist.open}
          aria-controls={listId}
          aria-autocomplete="list"
          autoComplete="off"
        />

        <span className={styles.avatar} aria-hidden>
          <Image src={searchAvatar} alt="" width={26} height={26} priority className={styles.avatarImg} />
        </span>
      </form>
      <SmartSearchPanel
        locale={locale}
        open={assist.open}
        suggestions={assist.suggestions}
        active={assist.active}
        anchorRef={anchorRef}
        listId={listId}
        onHover={assist.setActive}
        onPick={(suggestion) => assist.choose(suggestion)}
      />
    </>
  )
}

export default MobileHeaderSearchBar
