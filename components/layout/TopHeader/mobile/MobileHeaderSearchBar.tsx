'use client'

import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState, type FormEvent } from 'react'
import { BsCamera, BsMic, BsStars } from 'react-icons/bs'

import searchAvatar from '@/assets/images/icon/s200.png'
import type { SupportedLocale } from '@/lib/localization'
import { rememberSearch, SmartSearchPanel, useSearchDismiss, useSearchFieldToggle, useSmartSearchAssist } from '@/components/search/SmartSearchPanel'

import styles from './MobileHeaderSearchBar.module.css'

type Props = {
  locale: SupportedLocale
}

const PROMPTS = {
  ar: [
    'ماذا تريد أن تبيع أو تشتري اليوم؟',
    'أبحث عن كامري 2024 في عمّان',
    'أريد شقة للإيجار بالقرب مني',
    'كم سعر آيفون 15 مستعمل؟',
    'أبحث عن فرصة بيع مناسبة',
  ],
  en: [
    'What are you looking for today?',
    'Looking for a car at a fair price?',
    'See what is newly listed',
    'What are people offering in your city?',
    'Search a home, a job, or a service',
    'Looking for something used, in good shape?',
  ],
} as const

type SpeechCtor = new () => {
  lang: string
  start: () => void
  onresult: ((event: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null
  onerror: (() => void) | null
}

function speechCtor(): SpeechCtor | null {
  if (typeof window === 'undefined') return null
  const host = window as Window & { SpeechRecognition?: SpeechCtor; webkitSpeechRecognition?: SpeechCtor }
  return host.SpeechRecognition || host.webkitSpeechRecognition || null
}

const MobileHeaderSearchBar = ({ locale }: Props) => {
  const router = useRouter()
  const anchorRef = useRef<HTMLFormElement | null>(null)
  const [query, setQuery] = useState('')
  const [focused, setFocused] = useState(false)
  const [promptIndex, setPromptIndex] = useState(0)
  const [toolNote, setToolNote] = useState<'camera' | 'assistant' | 'voice' | null>(null)
  const assist = useSmartSearchAssist(locale, query)
  const listId = 'ananas-mobile-smart-search'
  const fieldToggle = useSearchFieldToggle(assist.open, assist.setOpen)
  useSearchDismiss(assist.open, assist.setOpen, anchorRef, listId, true)

  const isArabic = locale === 'ar'
  const prompts = PROMPTS[isArabic ? 'ar' : 'en']
  const stableLabel = isArabic ? 'ابحث في الأقسام والإعلانات' : 'Search sections and listings'
  const submitLabel = isArabic ? 'بحث' : 'Search'
  const showPrompt = !query && !focused
  const placeholder = showPrompt ? prompts[promptIndex] : stableLabel

  useEffect(() => {
    if (!showPrompt) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const timer = window.setInterval(() => {
      setPromptIndex((index) => (index + 1) % prompts.length)
    }, 4200)
    return () => window.clearInterval(timer)
  }, [showPrompt, prompts.length])

  const goToSearch = (value: string) => {
    const trimmed = value.trim()
    if (trimmed) rememberSearch(trimmed)
    assist.setOpen(false)
    setToolNote(null)
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

  const startVoice = () => {
    const Ctor = speechCtor()
    if (!Ctor) {
      setToolNote('voice')
      return
    }
    const recognition = new Ctor()
    recognition.lang = isArabic ? 'ar-JO' : 'en-US'
    recognition.onresult = (event) => {
      const transcript = event.results[0]?.[0]?.transcript?.trim()
      if (!transcript) return
      setQuery(transcript)
      goToSearch(transcript)
    }
    recognition.onerror = () => setToolNote('voice')
    recognition.start()
  }

  return (
    <div className={styles.wrap}>
      <form ref={anchorRef} className={styles.bar} role="search" onSubmit={handleSubmit}>
        <button type="submit" className={styles.srSubmit}>
          {submitLabel}
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
          onFocus={(event) => {
            setFocused(true)
            fieldToggle.onFocus()
            event.currentTarget.placeholder = stableLabel
          }}
          onBlur={() => setFocused(false)}
          onClick={fieldToggle.onClick}
          onKeyDown={(event) => assist.onKeyDown(event)}
          placeholder={placeholder}
          aria-label={stableLabel}
          aria-expanded={assist.open}
          aria-controls={listId}
          aria-autocomplete="list"
          autoComplete="off"
        />
        <span className={styles.tools} role="group" aria-label={isArabic ? 'أدوات البحث' : 'Search tools'}>
          <button type="button" className={styles.iconBtn} onClick={() => setToolNote(toolNote === 'camera' ? null : 'camera')} aria-label={isArabic ? 'بحث بالصورة' : 'Photo search'}>
            <BsCamera aria-hidden />
          </button>
          <button type="button" className={styles.iconBtn} onClick={startVoice} aria-label={isArabic ? 'صوت الجهاز' : 'Device voice'}>
            <BsMic aria-hidden />
          </button>
          <button type="button" className={styles.iconBtn} onClick={() => setToolNote(toolNote === 'assistant' ? null : 'assistant')} aria-label={isArabic ? 'بحث بالمحادثة' : 'Chat search'}>
            <BsStars aria-hidden />
          </button>
        </span>
        <span className={styles.avatar} title={isArabic ? 'محقق أناناس' : 'ANANAS detective'}>
          <Image src={searchAvatar} alt={isArabic ? 'محقق أناناس' : 'ANANAS detective'} width={26} height={26} priority className={styles.avatarImg} />
        </span>
      </form>
      {toolNote ? (
        <p className={styles.toolNote} role="status">
          {toolNote === 'camera'
            ? isArabic
              ? 'التعرف على الصور غير مربوط. اكتب ما تبحث عنه وسيُستخدم بحث الكلمات.'
              : 'Photo recognition is not connected. Type what you want and keyword search will be used.'
            : toolNote === 'assistant'
              ? isArabic
                ? 'المحادثة الذكية غير مربوطة بخدمة. الاقتراحات الحالية من الأقسام والمدن وبحث هذا الجهاز.'
                : 'Conversational search is not connected. Current suggestions come from sections, cities, and this device.'
              : isArabic
                ? 'الميكروفون غير متاح في هذا المتصفح. اكتب البحث بدلاً من ذلك.'
                : 'The microphone is not available in this browser. Type the search instead.'}
        </p>
      ) : null}
      <SmartSearchPanel
        locale={locale}
        open={assist.open}
        suggestions={assist.suggestions}
        active={assist.active}
        anchorRef={anchorRef}
        listId={listId}
        onHover={assist.setActive}
        onPick={(suggestion) => assist.choose(suggestion)}
        onForget={assist.forget}
        onClearRecents={assist.clearRecents}
        query={query}
      />
    </div>
  )
}

export default MobileHeaderSearchBar
