'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'

import { simulateCampaign } from '@/lib/experience/campaignSimulation'
import { suggestSectionName } from '@/lib/experience/suggestSection'
import type { SupportedLocale } from '@/lib/localization'

import styles from './ExperienceRoom.module.css'

export type ExperienceKind = 'live' | 'reels' | 'matching' | 'intelligence' | 'seller' | 'business' | 'assistant'

const MATCH_KEY = 'ananas.match.intent'

export default function ExperienceRoom({ locale, kind }: { locale: SupportedLocale; kind: ExperienceKind }) {
  const ar = locale === 'ar'
  const [saved, setSaved] = useState(false)
  const [wish, setWish] = useState('')
  const [price, setPrice] = useState('')
  const [question, setQuestion] = useState('')
  const [answer, setAnswer] = useState('')
  const [objective, setObjective] = useState<'messages' | 'views'>('messages')
  const estimate = simulateCampaign({ objective, placement: 'home', tier: 'free', budget: 10, days: 7 })

  useEffect(() => {
    if (kind !== 'matching') return
    const raw = window.localStorage.getItem(MATCH_KEY)
    if (!raw) return
    try {
      const parsed = JSON.parse(raw) as { wish?: string; price?: string }
      setWish(parsed.wish || '')
      setPrice(parsed.price || '')
      setSaved(Boolean(parsed.wish))
    } catch {
      /* ignore a damaged local note */
    }
  }, [kind])

  const saveWish = () => {
    window.localStorage.setItem(MATCH_KEY, JSON.stringify({ wish, price }))
    setSaved(true)
  }

  const ask = () => {
    const hint = suggestSectionName(question, ['سيارات', 'عقارات', 'موبايل', 'وظائف', 'أثاث'])
    setAnswer(
      hint
        ? ar
          ? `تلميح كلمات فقط: قد يناسب قسم «${hint}». هذا ليس نموذجاً متصلاً.`
          : `Keyword hint only: “${hint}” may fit. This is not a connected model.`
        : ar
          ? 'لا تلميح من الكلمات. ابحث في الإعلانات الحقيقية.'
          : 'No keyword hint. Search the real listings.',
    )
  }

  const copy = {
    live: {
      title: ar ? 'تجارة مباشرة' : 'Live commerce',
      lead: ar
        ? 'غرفة واجهة. لا يوجد بث، ولا مشاهدون، ولا بيع من هنا.'
        : 'An interface room. There is no stream, no audience, and no purchase from here.',
    },
    reels: {
      title: ar ? 'اكتشاف الفيديو' : 'Video discovery',
      lead: ar
        ? 'إطار عمودي للتجربة. لا ملف فيديو منشور، ولا تفاعل يُحسب.'
        : 'A vertical preview frame. No published video and no counted reactions.',
    },
    matching: {
      title: ar ? 'مطابقة النية' : 'Intent matching',
      lead: ar
        ? 'احفظ ما تبحث عنه على هذا الجهاز. لا مشترين حقيقيين في هذه القائمة.'
        : 'Save what you want on this device. This list has no real buyers.',
    },
    intelligence: {
      title: ar ? 'نبض السوق' : 'Market intelligence',
      lead: ar
        ? 'التفاصيل الأعمق للنبض. الأرقام هنا أمثلة عرض، والقوائم الحقيقية في البحث والمزادات والمتاجر.'
        : 'A deeper pulse. Figures here are demo examples. Real lists live in search, auctions, and stores.',
    },
    seller: {
      title: ar ? 'مركز البائع' : 'Seller center',
      lead: ar
        ? 'مسار واجهة من الفكرة إلى النشر. العملاء غير مربوطين.'
        : 'An interface path from idea to publishing. Leads are not connected.',
    },
    business: {
      title: ar ? 'مركز الأعمال' : 'Business center',
      lead: ar
        ? 'محاكاة حملة بلا سعر وبدون دفع. الناتج ليس توقعاً.'
        : 'A campaign simulation with no price and no payment. The result is not a forecast.',
    },
    assistant: {
      title: ar ? 'مساعد أناناس' : 'ANANAS assistant',
      lead: ar
        ? 'مدخل واحد للمساعدة. الرد من كلمات معروفة، وليس من نموذج ذكاء.'
        : 'One help entry. Replies come from known words, not an intelligence model.',
    },
  }[kind]

  return (
    <main className={styles.room} dir={ar ? 'rtl' : 'ltr'}>
      <p className={styles.kicker}>{ar ? 'وضع العرض' : 'Demo mode'}</p>
      <h1>{copy.title}</h1>
      <p className={styles.lead}>{copy.lead}</p>

      {kind === 'reels' || kind === 'live' ? (
        <div className={styles.reel}>
          <strong>
            {kind === 'live' ? <span className={styles.liveDot} /> : null}
            {kind === 'live' ? (ar ? 'جلسة مجدولة للعرض' : 'A scheduled demo session') : ar ? 'قصة منتج' : 'A product story'}
          </strong>
          <p>{ar ? 'لا عدّاد مشاهدين. الزر يحفظ اهتمامك على هذا الجهاز فقط.' : 'No viewer count. The button only saves interest on this device.'}</p>
        </div>
      ) : null}

      {kind === 'intelligence' ? (
        <div className={styles.grid}>
          {[
            [ar ? '١٢٬٨٥٠ إعلان نشط' : '12,850 active listings', ar ? 'مثال تاريخي، ليس إحصاء اليوم.' : 'A historical example, not today’s count.'],
            [ar ? '٨٫٦ ألف متصلون' : '8.6K online', ar ? 'ليس قياساً حياً.' : 'Not a live measurement.'],
            [ar ? 'كامري في البحث' : 'Camry in search', ar ? 'مثال رائج للعرض.' : 'A demo trend example.'],
          ].map(([title, note]) => (
            <article key={title} className={styles.card}>
              <strong>{title}</strong>
              <p>{note}</p>
            </article>
          ))}
        </div>
      ) : null}

      {kind === 'matching' ? (
        <form
          className={styles.card}
          onSubmit={(event) => {
            event.preventDefault()
            saveWish()
          }}
        >
          <label className={styles.field}>
            {ar ? 'ماذا تريد؟' : 'What do you want?'}
            <input value={wish} onChange={(event) => setWish(event.target.value)} />
          </label>
          <label className={styles.field}>
            {ar ? 'السعر الذي يناسبك' : 'A price that suits you'}
            <input value={price} onChange={(event) => setPrice(event.target.value)} inputMode="decimal" />
          </label>
          <div className={styles.row}>
            {(ar ? ['تويوتا كامري 2024', 'شقة في عبدون', 'آيفون'] : ['Toyota Camry 2024', 'Apartment in Abdoun', 'iPhone']).map((sample) => (
              <button key={sample} type="button" onClick={() => setWish(sample)}>
                {sample}
              </button>
            ))}
          </div>
          <div className={styles.row}>
            <button type="submit">{ar ? 'احفظ النية' : 'Save intent'}</button>
            <Link href={wish.trim() ? `/${locale}/search?q=${encodeURIComponent(wish.trim())}` : `/${locale}/search`}>
              {ar ? 'ابحث في الإعلانات الحقيقية' : 'Search real listings'}
            </Link>
          </div>
          {saved ? <p className={styles.note}>{ar ? 'حُفظت على هذا الجهاز. لا تنبيه يُرسل.' : 'Saved on this device. No alert is sent.'}</p> : null}
        </form>
      ) : null}

      {kind === 'seller' ? (
        <ol className={styles.grid}>
          <li className={styles.card}>
            <strong>{ar ? '١. الفكرة' : '1. The idea'}</strong>
            <p>{ar ? 'صف السلعة في الاستوديو. لا اقتراح سعر من خادم.' : 'Describe the item in the studio. There is no server price suggestion.'}</p>
          </li>
          <li className={styles.card}>
            <strong>{ar ? '٢. النشر' : '2. Publishing'}</strong>
            <p>{ar ? 'النشر المجاني يبقى مسار الإعلان الحالي.' : 'Free publishing stays on the current listing path.'}</p>
          </li>
          <li className={styles.card}>
            <strong>{ar ? '٣. العملاء' : '3. Leads'}</strong>
            <p>{ar ? 'لا صندوق عملاء. الرسائل الحقيقية تبقى في المحادثات.' : 'No lead inbox. Real messages stay in conversations.'}</p>
          </li>
        </ol>
      ) : null}

      {kind === 'business' ? (
        <section className={styles.card}>
          <strong>{ar ? 'محاكاة هدف' : 'Objective simulation'}</strong>
          <div className={styles.row}>
            <button type="button" data-on={objective === 'messages' ? '1' : '0'} onClick={() => setObjective('messages')}>
              {ar ? 'رسائل' : 'Messages'}
            </button>
            <button type="button" data-on={objective === 'views' ? '1' : '0'} onClick={() => setObjective('views')}>
              {ar ? 'مشاهدات' : 'Views'}
            </button>
          </div>
          <p className={styles.note}>
            {ar
              ? `${estimate.impressions.toLocaleString('ar-JO')} ظهور محاكى من ميزانية ١٠ لأيام ٧. ليست حملة ولا سعراً.`
              : `${estimate.impressions.toLocaleString('en-US')} simulated impressions from a budget of 10 for 7 days. Not a campaign and not a price.`}
          </p>
        </section>
      ) : null}

      {kind === 'assistant' ? (
        <form
          className={styles.card}
          onSubmit={(event) => {
            event.preventDefault()
            ask()
          }}
        >
          <label className={styles.field}>
            {ar ? 'اكتب ما تريد بيعه أو إيجاده' : 'Write what you want to sell or find'}
            <textarea value={question} onChange={(event) => setQuestion(event.target.value)} rows={3} />
          </label>
          <div className={styles.row}>
            <button type="submit">{ar ? 'تلميح' : 'Hint'}</button>
          </div>
          {answer ? <p className={styles.note}>{answer}</p> : null}
        </form>
      ) : null}

      <div className={styles.row}>
        <Link href={`/${locale}`}>{ar ? 'السوق' : 'Market'}</Link>
        <Link href={`/${locale}/pages/auction`}>{ar ? 'المزادات' : 'Auctions'}</Link>
        <Link href={`/${locale}/stores`}>{ar ? 'المتاجر' : 'Stores'}</Link>
        <Link href={`/${locale}/membership`}>{ar ? 'العضوية' : 'Membership'}</Link>
      </div>
    </main>
  )
}
