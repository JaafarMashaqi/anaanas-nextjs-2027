type AddOrSubtractFromDate = (days: number, add?: boolean, startingDate?: Date) => Date

export const addOrSubtractDaysFromDate: AddOrSubtractFromDate = (days, add, startingDate = new Date()) => {
  if (add) return new Date(new Date().setDate(startingDate.getDate() + days))
  else return new Date(new Date().setDate(startingDate.getDate() - days))
}

export const addOrSubtractMinutesFromDate: AddOrSubtractFromDate = (minutes, add, startingDate = new Date()) => {
  if (add) return new Date(new Date().setMinutes(startingDate.getMinutes() + minutes))
  else return new Date(new Date().setMinutes(startingDate.getMinutes() - minutes))
}

const RELATIVE_UNITS: Array<[Intl.RelativeTimeFormatUnit, number]> = [
  ['year', 31536000],
  ['month', 2592000],
  ['week', 604800],
  ['day', 86400],
  ['hour', 3600],
  ['minute', 60],
  ['second', 1],
]

/**
 * Locale-aware relative time. Default stays English so older English-only
 * callers (notification slice, mock activity) do not change. Pass `ar` on
 * marketplace surfaces so Arabic cards do not show reversed English.
 */
export const timeSince = (date: Date | string | number, locale: string = 'en') => {
  const parsed = date instanceof Date ? date : new Date(date)
  if (Number.isNaN(parsed.valueOf())) return ''

  const diffSec = Math.round((parsed.valueOf() - Date.now()) / 1000)
  const abs = Math.abs(diffSec)
  const lang = locale.toLowerCase().startsWith('ar') ? 'ar' : 'en'
  const rtf = new Intl.RelativeTimeFormat(lang, { numeric: 'auto' })

  if (abs < 10) return rtf.format(0, 'second')

  for (const [unit, size] of RELATIVE_UNITS) {
    if (abs >= size || unit === 'second') {
      const value = Math.round(diffSec / size)
      return rtf.format(value === 0 ? (diffSec < 0 ? -1 : 1) : value, unit)
    }
  }

  return rtf.format(0, 'second')
}
