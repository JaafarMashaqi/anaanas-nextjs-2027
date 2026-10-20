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

function arabicCount(value: number): string {
  try {
    return new Intl.NumberFormat('ar-JO', { maximumFractionDigits: 0 }).format(value)
  } catch {
    return String(value)
  }
}

/** Explicit Arabic so a missing ICU locale cannot fall back to reversed English. */
function arabicRelative(diffSec: number): string {
  const past = diffSec <= 0
  const abs = Math.abs(diffSec)
  if (abs < 10) return 'الآن'
  if (past && abs >= 20 * 3600 && abs < 36 * 3600) return 'أمس'

  const forms: Array<[number, [string, string, string, string]]> = [
    [31536000, ['سنة', 'سنتين', 'سنوات', 'سنة']],
    [2592000, ['شهر', 'شهرين', 'أشهر', 'شهرًا']],
    [604800, ['أسبوع', 'أسبوعين', 'أسابيع', 'أسبوعًا']],
    [86400, ['يوم', 'يومين', 'أيام', 'يومًا']],
    [3600, ['ساعة', 'ساعتين', 'ساعات', 'ساعة']],
    [60, ['دقيقة', 'دقيقتين', 'دقائق', 'دقيقة']],
    [1, ['ثانية', 'ثانيتين', 'ثوانٍ', 'ثانية']],
  ]

  for (const [size, labels] of forms) {
    if (abs < size && size !== 1) continue
    const count = Math.max(1, Math.round(abs / size))
    const phrase =
      count === 1 ? labels[0] : count === 2 ? labels[1] : count <= 10 ? `${arabicCount(count)} ${labels[2]}` : `${arabicCount(count)} ${labels[3]}`
    return past ? `قبل ${phrase}` : `بعد ${phrase}`
  }

  return 'الآن'
}

/**
 * Locale-aware relative time. Default stays English so older English-only
 * callers do not change. Pass `ar` on marketplace surfaces.
 */
export const timeSince = (date: Date | string | number, locale: string = 'en') => {
  const parsed = date instanceof Date ? date : new Date(date)
  if (Number.isNaN(parsed.valueOf())) return ''

  const diffSec = Math.round((parsed.valueOf() - Date.now()) / 1000)
  if (locale.toLowerCase().startsWith('ar')) return arabicRelative(diffSec)

  const abs = Math.abs(diffSec)
  const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' })
  if (abs < 10) return rtf.format(0, 'second')

  for (const [unit, size] of RELATIVE_UNITS) {
    if (abs >= size || unit === 'second') {
      const value = Math.round(diffSec / size)
      return rtf.format(value === 0 ? (diffSec < 0 ? -1 : 1) : value, unit)
    }
  }

  return rtf.format(0, 'second')
}
