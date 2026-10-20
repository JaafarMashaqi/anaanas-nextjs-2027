'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { BsHammer, BsSearch, BsShop } from 'react-icons/bs'

import type { SupportedLocale } from '@/lib/localization'

import styles from './HomeCommandStrip.module.css'

type Props = {
  locale: SupportedLocale
  countryLabel: string
}

function timeGreeting(locale: SupportedLocale, countryLabel: string) {
  const hour = new Date().getHours()
  if (locale === 'ar') {
    const part = hour < 12 ? 'صباح الخير' : hour < 17 ? 'نهارك سعيد' : 'مساء الخير'
    return `${part} في ${countryLabel}`
  }
  const part = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'
  return `${part} in ${countryLabel}`
}

export default function HomeCommandStrip({ locale, countryLabel }: Props) {
  const isArabic = locale === 'ar'
  const stable = isArabic ? `سوق أناناس في ${countryLabel}` : `ANANAS market in ${countryLabel}`
  const [greeting, setGreeting] = useState(stable)

  useEffect(() => {
    setGreeting(timeGreeting(locale, countryLabel))
  }, [locale, countryLabel])

  const links = [
    {
      href: `/${locale}/search`,
      label: isArabic ? 'بحث' : 'Search',
      icon: BsSearch,
    },
    {
      href: `/${locale}/pages/auction`,
      label: isArabic ? 'مزادات' : 'Auctions',
      icon: BsHammer,
    },
    {
      href: `/${locale}/stores`,
      label: isArabic ? 'متاجر' : 'Stores',
      icon: BsShop,
    },
  ]

  return (
    <section className={styles.strip} dir={isArabic ? 'rtl' : 'ltr'} aria-label={isArabic ? 'بداية السوق' : 'Market start'}>
      <p className={styles.greeting}>{greeting}</p>
      <div className={styles.rail}>
        {links.map((item) => {
          const Icon = item.icon
          return (
            <Link key={item.href} href={item.href} className={styles.chip}>
              <Icon aria-hidden />
              <span>{item.label}</span>
            </Link>
          )
        })}
      </div>
    </section>
  )
}
