import type { SupportedLocale } from '@/lib/localization'
import { t } from '@/lib/translations'

export type ReactionTypeKey = 'like' | 'love' | 'care' | 'haha' | 'wow' | 'sad' | 'angry'

export const REACTION_TYPES: ReactionTypeKey[] = ['like', 'love', 'care', 'haha', 'wow', 'sad', 'angry']

export const REACTION_COLORS: Record<ReactionTypeKey, string> = {
  like: '#1877f2',
  love: '#f43f5e',
  care: '#f59e0b',
  haha: '#facc15',
  wow: '#06b6d4',
  sad: '#8b5cf6',
  angry: '#ef4444',
}

export const REACTION_EMOJIS: Record<ReactionTypeKey, string> = {
  like: '👍',
  love: '❤️',
  care: '🥰',
  haha: '😂',
  wow: '😮',
  sad: '😢',
  angry: '😡',
}

export const CHART_PALETTE = ['#177dc1', '#ba7bff', '#fecb01', '#0cbc87', '#e76f51', '#151515', '#4f9ef8', '#64748b']

export function todayISO() {
  return new Date().toISOString().slice(0, 10)
}

export function daysAgoISO(days: number) {
  const d = new Date()
  d.setDate(d.getDate() - days)
  return d.toISOString().slice(0, 10)
}

export function formatStatNum(n: number, locale: SupportedLocale = 'ar') {
  try {
    return new Intl.NumberFormat(locale === 'ar' ? 'ar' : 'en').format(n)
  } catch {
    return String(n)
  }
}

export function eventLabel(ev: string, locale: SupportedLocale) {
  switch (ev) {
    case 'post_impression':
      return t('stats.event.impressions', locale)
    case 'post_view':
      return t('stats.event.views', locale)
    case 'post_share':
      return t('stats.event.shares', locale)
    case 'post_call':
      return t('stats.event.calls', locale)
    case 'post_chat_open':
      return t('stats.event.chats', locale)
    case 'post_like':
      return t('stats.event.likes', locale)
    case 'post_unlike':
      return t('stats.event.unlikes', locale)
    case 'post_comment':
      return t('stats.event.comments', locale)
    default:
      return ev
  }
}

export function reactionLabel(key: ReactionTypeKey, locale: SupportedLocale) {
  if (locale === 'ar') {
    const map: Record<ReactionTypeKey, string> = {
      like: 'أعجبني',
      love: 'أحببته',
      care: 'مهتم',
      haha: 'أضحكني',
      wow: 'أدهشني',
      sad: 'أحزنني',
      angry: 'أغضبني',
    }
    return map[key]
  }
  const map: Record<ReactionTypeKey, string> = {
    like: 'Like',
    love: 'Love',
    care: 'Care',
    haha: 'Haha',
    wow: 'Wow',
    sad: 'Sad',
    angry: 'Angry',
  }
  return map[key]
}

export const listItemVariants = {
  hidden: { opacity: 0, y: 14 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: 0.04 * i, type: 'spring' as const, stiffness: 380, damping: 28 },
  }),
}

export const PROMOTION_KPI_META: Record<string, { ar: string; en: string; color: string }> = {
  featured_impressions: { ar: 'ظهور مميز', en: 'Featured impressions', color: '#f59e0b' },
  homepage_pin_views: { ar: 'مشاهدات الرئيسية', en: 'Homepage pin views', color: '#d97706' },
  popup_shown: { ar: 'عرض منبثق', en: 'Popup views', color: '#b45309' },
  popup_click: { ar: 'نقرات منبثق', en: 'Popup clicks', color: '#92400e' },
  listing_boost_impressions: { ar: 'تعزيز القوائم', en: 'Listing boost', color: '#ca8a04' },
}

export type StatsKpi = { key: string; label: string; value: number; color: string; hint?: string }
