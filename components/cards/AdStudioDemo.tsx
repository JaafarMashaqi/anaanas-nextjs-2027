'use client'

import { useEffect, useMemo, useState } from 'react'

import styles from './AdStudioDemo.module.css'

type Mode = 'sale' | 'wanted' | 'auction'

const SUGGESTIONS = {
  ar: ['خزانة خشب للبيع في عمّان', 'أبحث عن دراجة بحالة جيدة', 'مزاد على طقم كنب'],
  en: ['Wooden cabinet for sale in Amman', 'Looking for a bicycle in good condition', 'Auction for a sofa set'],
}

export default function AdStudioDemo({
  locale,
  mode,
  title,
  onUseTitle,
}: {
  locale: string
  mode: Mode
  title: string
  onUseTitle: (value: string) => void
}) {
  const ar = locale === 'ar'
  const storageKey = `ananas.demoComposer.${mode}`
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState('')
  const [place, setPlace] = useState('')
  const [category, setCategory] = useState('')
  const [budget, setBudget] = useState('15')
  const [days, setDays] = useState('7')
  const [status, setStatus] = useState<string | null>(null)

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(storageKey)
      if (!raw) return
      const saved = JSON.parse(raw) as { description?: string; price?: string; place?: string; category?: string }
      setDescription(saved.description || '')
      setPrice(saved.price || '')
      setPlace(saved.place || '')
      setCategory(saved.category || '')
    } catch {
      /* ignore a broken local draft */
    }
  }, [storageKey])

  const progress = useMemo(() => {
    const checks = [title.trim(), description.trim(), price.trim(), place.trim(), category.trim()]
    return Math.round((checks.filter(Boolean).length / checks.length) * 100)
  }, [title, description, price, place, category])

  const saveDraft = () => {
    sessionStorage.setItem(
      storageKey,
      JSON.stringify({ description, price, place, category, savedAt: new Date().toISOString() }),
    )
    setStatus(
      ar
        ? 'محفوظ في هذا المتصفح فقط. لم يُرسل إلى الخادم ولم يُنشر.'
        : 'Saved in this browser only. Nothing was sent to the server or published.',
    )
  }

  return (
    <div className={styles.studio}>
      <p className={styles.banner}>
        {mode === 'sale'
          ? ar
            ? 'استوديو متقدم — تجريبي. النشر الحقيقي يبقى زر «أضف إعلان».'
            : 'Advanced studio — demo. Real publishing stays on Add listing.'
          : ar
            ? 'مسار تجريبي. هذا الوضع لا ينشر إعلاناً.'
            : 'Demo flow. This mode does not publish a listing.'}
      </p>
      <div className={styles.progress} aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100} role="meter">
        <span style={{ width: `${progress}%` }} />
      </div>
      <p className={styles.hint}>{ar ? `اكتمال المسودة التجريبية ${progress}٪` : `Demo draft ${progress}% complete`}</p>
      <div className={styles.suggestions} aria-label={ar ? 'نصوص جاهزة' : 'Ready phrases'}>
        {(ar ? SUGGESTIONS.ar : SUGGESTIONS.en).map((line) => (
          <button key={line} type="button" onClick={() => onUseTitle(line)}>
            {line}
          </button>
        ))}
      </div>
      <p className={styles.hint}>
        {ar ? 'النصوص جاهزة وليست ناتجة عن نموذج.' : 'These phrases are prepared text, not a model output.'}
      </p>
      {mode !== 'sale' ? (
        <>
          <label className={styles.field}>
            <span>{ar ? 'الوصف' : 'Description'}</span>
            <textarea value={description} onChange={(event) => setDescription(event.target.value)} rows={3} />
          </label>
          <div className={styles.row}>
            <label className={styles.field}>
              <span>{ar ? 'السعر' : 'Price'}</span>
              <input value={price} onChange={(event) => setPrice(event.target.value)} inputMode="decimal" />
            </label>
            <label className={styles.field}>
              <span>{ar ? 'المكان' : 'Place'}</span>
              <input value={place} onChange={(event) => setPlace(event.target.value)} />
            </label>
          </div>
          <label className={styles.field}>
            <span>{ar ? 'القسم' : 'Category'}</span>
            <input value={category} onChange={(event) => setCategory(event.target.value)} />
          </label>
        </>
      ) : null}
      <div className={styles.row}>
        <label className={styles.field}>
          <span>{ar ? 'ميزانية تجريبية' : 'Demo budget'}</span>
          <select value={budget} onChange={(event) => setBudget(event.target.value)}>
            <option value="15">15</option>
            <option value="30">30</option>
            <option value="60">60</option>
          </select>
        </label>
        <label className={styles.field}>
          <span>{ar ? 'المدة' : 'Duration'}</span>
          <select value={days} onChange={(event) => setDays(event.target.value)}>
            <option value="3">3</option>
            <option value="7">7</option>
            <option value="14">14</option>
          </select>
        </label>
      </div>
      <p className={styles.hint}>
        {ar
          ? `لا يوجد نموذج يحسب نتيجة لميزانية ${budget} لمدة ${days} أيام. عضويات Gold وPro غير مربوطة.`
          : `No model estimates an outcome for a budget of ${budget} over ${days} days. Gold and Pro memberships are not connected.`}
      </p>
      <div className={styles.actions}>
        {mode === 'sale' ? null : (
          <button type="button" className={styles.primary} onClick={saveDraft}>
            {ar ? 'احفظ المسودة التجريبية' : 'Save demo draft'}
          </button>
        )}
        <button
          type="button"
          className={styles.quiet}
          onClick={() =>
            setStatus(
              ar
                ? 'المعاينة شكل فقط. لا يوجد إعلان منشور لعرضه.'
                : 'Preview is a sketch only. There is no published listing to show.',
            )
          }
        >
          {ar ? 'معاينة الشكل' : 'Preview the layout'}
        </button>
      </div>
      {status ? <p className={styles.status}>{status}</p> : null}
    </div>
  )
}
