'use client'

import { useEffect, useMemo, useState, type KeyboardEvent, type RefObject } from 'react'
import { createPortal } from 'react-dom'
import { useRouter } from 'next/navigation'

import { useAppData } from '@/context/AppDataContext'
import type { SupportedLocale } from '@/lib/localization'

import {
  buildSmartSuggestions,
  clearRecentSearches,
  forgetSearch,
  readRecentSearches,
  rememberSearch,
  type SmartSuggestion,
} from './smartSearchModel'
import styles from './SmartSearchPanel.module.css'

type Box = { top: number; left: number; width: number }

export function useSmartSearchAssist(locale: SupportedLocale, query: string) {
  const { sections, cities } = useAppData()
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState(0)
  const [recents, setRecents] = useState<string[]>([])

  useEffect(() => {
    if (!open) return
    setRecents(readRecentSearches())
  }, [open])

  const suggestions = useMemo(
    () => buildSmartSuggestions({ locale, query, sections, cities, recents }),
    [locale, query, sections, cities, recents],
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

  const refreshRecents = () => setRecents(readRecentSearches())
  const forget = (label: string) => {
    forgetSearch(label)
    refreshRecents()
  }
  const clearRecents = () => {
    clearRecentSearches()
    refreshRecents()
  }

  return { open, setOpen, active, setActive, suggestions, choose, onKeyDown, forget, clearRecents, query }
}

/** Focus and click always open the panel. Closing is outside the field or Escape. */
export function useSearchFieldToggle(_open: boolean, setOpen: (next: boolean) => void) {
  return {
    onMouseDown: () => {
      setOpen(true)
    },
    onFocus: () => {
      setOpen(true)
    },
    onClick: () => {
      setOpen(true)
    },
  }
}

export function useSearchDismiss(
  open: boolean,
  setOpen: (next: boolean) => void,
  anchorRef: RefObject<HTMLElement | null>,
  listId: string,
  historyBack: boolean,
) {
  useEffect(() => {
    if (!open) return
    const onPointer = (event: PointerEvent) => {
      const target = event.target
      if (!(target instanceof Node)) return
      if (anchorRef.current?.contains(target)) return
      if (target instanceof Element && target.closest('[data-search-toggle]')) return
      const panel = document.getElementById(listId)
      if (panel?.contains(target)) return
      setOpen(false)
    }
    const onKey = (event: globalThis.KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        setOpen(false)
      }
    }
    document.addEventListener('pointerdown', onPointer)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('pointerdown', onPointer)
      document.removeEventListener('keydown', onKey)
    }
  }, [open, setOpen, anchorRef, listId])

  useEffect(() => {
    if (!open || !historyBack) return
    const marker = { ananasSearchOverlay: listId }
    window.history.pushState(marker, '')
    let closedByPop = false
    const onPop = () => {
      closedByPop = true
      setOpen(false)
    }
    window.addEventListener('popstate', onPop)
    return () => {
      window.removeEventListener('popstate', onPop)
      if (!closedByPop && window.history.state?.ananasSearchOverlay === listId) {
        window.history.back()
      }
    }
  }, [open, setOpen, listId, historyBack])
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
  onForget,
  onClearRecents,
  query,
}: {
  locale: SupportedLocale
  open: boolean
  suggestions: SmartSuggestion[]
  active: number
  anchorRef: RefObject<HTMLElement | null>
  listId: string
  onHover: (index: number) => void
  onPick: (suggestion: SmartSuggestion) => void
  onForget: (label: string) => void
  onClearRecents: () => void
  query: string
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

  if (!open || !box || suggestions.length === 0 || typeof document === 'undefined') return null

  let lastGroup = ''
  const groupLabel = (group: SmartSuggestion['group']) => {
    if (group === 'recent') return isArabic ? 'عمليات بحث سابقة' : 'Recent searches'
    if (group === 'trend') return isArabic ? 'أمثلة رائجة' : 'Example trends'
    if (group === 'section') return isArabic ? 'أقسام' : 'Sections'
    if (group === 'city') return isArabic ? 'مدن' : 'Cities'
    if (group === 'go') return isArabic ? 'انتقال' : 'Go to'
    return isArabic ? 'بحث' : 'Search'
  }

  return createPortal(
    <div
      className={styles.panel}
      id={listId}
      data-search-panel=""
      role="listbox"
      dir={isArabic ? 'rtl' : 'ltr'}
      style={{ top: box.top, left: box.left, width: box.width }}
    >
      {suggestions.map((suggestion, index) => {
        const showGroup = suggestion.group !== lastGroup
        lastGroup = suggestion.group
        return (
          <div key={suggestion.id}>
            {showGroup ? (
              <div className={styles.group}>
                <span>{groupLabel(suggestion.group)}</span>
                {suggestion.group === 'recent' ? (
                  <button type="button" className={styles.clear} onMouseDown={(event) => event.preventDefault()} onClick={onClearRecents}>
                    {isArabic ? 'مسح' : 'Clear'}
                  </button>
                ) : null}
              </div>
            ) : null}
            <div className={styles.optionRow}>
              <button
                type="button"
                role="option"
                aria-selected={index === active}
                className={`${styles.option} ${index === active ? styles.optionActive : ''}`}
                onMouseEnter={() => onHover(index)}
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => onPick(suggestion)}
              >
                <span className={styles.label}>{highlightMatch(suggestion.label, query)}</span>
                <span className={styles.hint}>{suggestion.hint}</span>
              </button>
              {suggestion.group === 'recent' ? (
                <button
                  type="button"
                  className={styles.forget}
                  aria-label={isArabic ? `حذف ${suggestion.label}` : `Remove ${suggestion.label}`}
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => onForget(suggestion.label)}
                >
                  ×
                </button>
              ) : null}
            </div>
          </div>
        )
      })}
      <p className={styles.honest}>
        {isArabic
          ? 'أمثلة الرواج للعرض فقط وليست حجم بحث حقيقياً. الأقسام والمدن وعمليات هذا الجهاز حقيقية.'
          : 'Trend examples are for demonstration, not measured search volume. Sections, cities, and this device’s searches are real.'}
      </p>
    </div>,
    document.body,
  )
}

function highlightMatch(label: string, query: string) {
  const needle = query.trim()
  if (!needle) return label
  const index = label.toLocaleLowerCase().indexOf(needle.toLocaleLowerCase())
  if (index < 0) return label
  const end = index + needle.length
  return (
    <>
      {label.slice(0, index)}
      <mark>{label.slice(index, end)}</mark>
      {label.slice(end)}
    </>
  )
}

export { rememberSearch }
