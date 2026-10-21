import ExperienceRoom from '@/components/experience/ExperienceRoom'
import { DEFAULT_LOCALE, isSupportedLocale, type SupportedLocale } from '@/lib/localization'

export default async function MatchingPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: localeRaw } = await params
  const locale: SupportedLocale = isSupportedLocale(localeRaw) ? localeRaw : DEFAULT_LOCALE
  return <ExperienceRoom locale={locale} kind="matching" />
}
