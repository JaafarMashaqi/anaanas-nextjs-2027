'use client'

import { useEffect, useMemo, useState, type KeyboardEvent, type RefObject } from 'react'
import { useRouter } from 'next/navigation'

import { useAppData } from '@/context/AppDataContext'
import type { SupportedLocale } from '@/lib/localization'

import {
  buildSmartSuggestions,
  readRecentSearches,
  rememberSearch,
  type SmartSuggestion,
} from './smartSearchModel'
import styles from './SmartSearchPanel.module.css'

type Box = { top: number; left: number; width: number }

export function useSmartSearchAssist(locale: SupportedLocale, query: string) {
  const { sections } = useAppData()
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState(0)
  const [recents, setRecents] = useState<string[]>([])

  useEffect(() => {
    if (!open) return
    setRecents(readRecentSearches())
  }, [open])

  const suggestions = useMemo(
    () => buildSmartSuggestions({ locale, query, sections, recents }),
    [locale, query, sections, recents],
  )

  useEffect(() => {
    setActive(0)
  }, [query])

  const choose = (suggestion: SmartSuggestion, onNavigate?: () => void) => {
    if (suggestion.group === 'query' || suggestion.group === 'recent') {
      rememberSearch(suggestion.label)
    }
    setOpen(false)
    onNavigate?.()
    router.push(suggestion.href)
  }

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>, onNavigate?: () => void) => {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault()
      if (!open) {
        setOpen(true)
        return
      }
      if (suggestions.length === 0) return
      setActive((index) => {
        if (event.key === 'ArrowDown') return (index + 1) % suggestions.length
        return (index - 1 + suggestions.length) % suggestions.length
      })
      return
    }
    if (event.key === 'Escape') {
      setOpen(false)
      return
    }
    if (event.key === 'Enter' && open) {
      const suggestion = suggestions[active]
      if (suggestion && suggestion.group !== 'query') {
        event.preventDefault()
        choose(suggestion, onNavigate)
      }
    }
  }

  return { open, setOpen, active, setActive, suggestions, choose, onKeyDown }
}

export function SmartSearchPanel({
  locale,
  open,
  suggestions,
  active,
  anchorRef,
  listId,
  onHover,
  onPick,
}: {
  locale: SupportedLocale
  open: boolean
  suggestions: SmartSuggestion[]
  active: number
  anchorRef: RefObject<HTMLElement | null>
  listId: string
  onHover: (index: number) => void
  onPick: (suggestion: SmartSuggestion) => void
}) {
  const [box, setBox] = useState<Box | null>(null)
  const isArabic = locale === 'ar'

  useEffect(() => {
    if (!open) return
    const update = () => {
      const node = anchorRef.current
      if (!node) return
      const rect = node.getBoundingClientRect()
      setBox({ top: rect.bottom + 6, left: rect.left, width: Math.max(rect.width, 240) })
    }
    update()
    window.addEventListener('resize', update)
    window.addEventListener('scroll', update, true)
    return () => {
      window.removeEventListener('resize', update)
      window.removeEventListener('scroll', update, true)
    }
  }, [open, anchorRef, suggestions.length])

  if (!open || !box || suggestions.length === 0) return null

  let lastGroup = ''
  const groupLabel = (group: SmartSuggestion['group']) => {
    if (group === 'recent') return isArabic ? 'عمليات بحث سابقة' : 'Recent searches'
    if (group === 'section') return isArabic ? 'أقسام' : 'Sections'
    if (group === 'go') return isArabic ? 'انتقال' : 'Go to'
    return isArabic ? 'بحث' : 'Search'
  }

  return (
    <div
      className={styles.panel}
      id={listId}
      role="listbox"
      dir={isArabic ? 'rtl' : 'ltr'}
      style={{ top: box.top, left: box.left, width: box.width }}
    >
      {suggestions.map((suggestion, index) => {
        const showGroup = suggestion.group !== lastGroup
        lastGroup = suggestion.group
        return (
          <div key={suggestion.id}>
            {showGroup ? <div className={styles.group}>{groupLabel(suggestion.group)}</div> : null}
            <button
              type="button"
              role="option"
              aria-selected={index === active}
              className={`${styles.option} ${index === active ? styles.optionActive : ''}`}
              onMouseEnter={() => onHover(index)}
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => onPick(suggestion)}
            >
              <span className={styles.label}>{suggestion.label}</span>
              <span className={styles.hint}>{suggestion.hint}</span>
            </button>
          </div>
        )
      })}
    </div>
  )
}

export { rememberSearch }
