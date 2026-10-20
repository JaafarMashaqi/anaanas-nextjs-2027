'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useState } from 'react'

import mascot from '@/assets/uiux/mascot_sitting.png'
import type { SupportedLocale } from '@/lib/localization'
import styles from './HomeConceptSequence.module.css'

const CONCEPTS = [
  {
    id: 'coffee',
    query: 'قهوة',
    arTitle: 'بن العميد',
    enTitle: 'Al Ameed Coffee',
    arLine: 'فكرة صباحية. الزر يفتح بحث «قهوة» في الإعلانات الحقيقية.',
    enLine: 'A morning concept. The button searches real listings for coffee.',
  },
  {
    id: 'car',
    query: 'سيارات',
    arTitle: 'BYD SHARK',
    enTitle: 'BYD SHARK',
    arLine: 'فكرة سيارات. الزر يفتح بحث «سيارات»، وليس صفحة الوكيل.',
    enLine: 'A car concept. The button searches real listings for cars, not a dealer page.',
  },
  {
    id: 'travel',
    query: 'سفر',
    arTitle: 'الخطوط الجوية القطرية',
    enTitle: 'Qatar Airways',
    arLine: 'فكرة سفر. الزر يفتح بحث «سفر». لا توجد حجز طيران مربوط.',
    enLine: 'A travel concept. The button searches listings for travel. No flight booking is connected.',
  },
] as const

export default function HomeConceptSequence({ locale }: { locale: SupportedLocale }) {
  const [index, setIndex] = useState(0)
  const isArabic = locale === 'ar'
  const concept = CONCEPTS[index]

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const timer = window.setInterval(() => setIndex((value) => (value + 1) % CONCEPTS.length), 7000)
    return () => window.clearInterval(timer)
  }, [])

  return (
    <section className={styles.card} aria-label={isArabic ? 'أفكار حملات' : 'Campaign concepts'}>
      <Image src={mascot} alt="" width={48} height={48} className={styles.mascot} />
      <div className={styles.copy}>
        <p className={styles.kicker}>{isArabic ? 'مفهوم إبداعي · ليست شراكة' : 'Creative concept · not a partnership'}</p>
        <h2>{isArabic ? concept.arTitle : concept.enTitle}</h2>
        <p>{isArabic ? concept.arLine : concept.enLine}</p>
      </div>
      <Link className={styles.go} href={`/${locale}/search?q=${encodeURIComponent(concept.query)}`}>
        {isArabic ? 'ابحث' : 'Search'}
      </Link>
    </section>
  )
}
