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
  onDescribe,
  onContinue,
}: {
  locale: string
  mode: Mode
  title: string
  onUseTitle: (value: string) => void
  onDescribe?: (value: string) => void
  onContinue?: () => void
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

  const [photos, setPhotos] = useState<{ id: string; url: string; name: string }[]>([])

  const addPhotos = (list: FileList | null) => {
    if (!list) return
    const next = [...list].slice(0, 6).map((file) => ({
      id: `${file.name}-${file.size}-${file.lastModified}`,
      url: URL.createObjectURL(file),
      name: file.name,
    }))
    setPhotos((current) => [...current, ...next].slice(0, 6))
    setStatus(
      ar
        ? 'معاينة محلية فقط. الرفع الحقيقي يبدأ في خطوة الصور بعد اكتمال العنوان والوصف.'
        : 'Local preview only. The real upload starts on the photo step after the title and description are valid.',
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
      <label className={styles.field}>
        <span>{ar ? 'الوصف' : 'Description'}</span>
        <textarea
          value={description}
          onChange={(event) => {
            setDescription(event.target.value)
            onDescribe?.(event.target.value)
          }}
          rows={3}
        />
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
      <div className={styles.suggestions} aria-label={ar ? 'باقات' : 'Plans'}>
        {[
          { id: 'free', ar: 'مجاني', en: 'Free', live: true },
          { id: 'featured', ar: 'مميز', en: 'Featured', live: false },
          { id: 'gold', ar: 'ذهبي', en: 'Gold', live: false },
          { id: 'pro', ar: 'برو', en: 'PRO', live: false },
          { id: 'elite', ar: 'إيليت', en: 'Elite', live: false },
        ].map((plan) => (
          <button
            key={plan.id}
            type="button"
            onClick={() =>
              setStatus(
                plan.live
                  ? ar
                    ? 'النشر المجاني هو زر «أضف إعلان». هذه المسودة لا تُرسل وحدها.'
                    : 'Free publishing is the Add listing button. This draft is not sent by itself.'
                  : ar
                    ? `${plan.ar} غير مربوط. لا توجد باقة أو سعر.`
                    : `${plan.en} is not connected. There is no package or price.`,
              )
            }
          >
            {ar ? plan.ar : plan.en}
          </button>
        ))}
      </div>
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
      <label className={styles.field}>
        <span>{ar ? 'صور للمعاينة' : 'Preview photos'}</span>
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={(event) => {
            addPhotos(event.target.files)
            event.target.value = ''
          }}
        />
      </label>
      {photos.length > 0 ? (
        <div className={styles.suggestions}>
          {photos.map((photo, index) => (
            <button
              key={photo.id}
              type="button"
              onClick={() => setPhotos((current) => current.filter((item) => item.id !== photo.id))}
            >
              {index + 1}. {photo.name} · {ar ? 'إزالة' : 'Remove'}
            </button>
          ))}
        </div>
      ) : null}
      <p className={styles.hint}>
        {ar
          ? `اكتمال المسودة ${progress}٪. هذا ليس تقييم جودة من نموذج. أفضل نافذة مقترحة من الواجهة: مساءً بعد السادسة بتوقيت عمّان، وليست نتيجة حملات.`
          : `Draft completeness ${progress}%. This is not a model quality score. The interface suggests evenings after 18:00 Amman time, not a campaign result.`}
      </p>
      <div className={styles.actions}>
        {onContinue ? (
          <button type="button" className={styles.primary} onClick={onContinue}>
            {ar ? 'إلى الصور الحقيقية' : 'Continue to real photos'}
          </button>
        ) : null}
        <button type="button" className={styles.primary} onClick={saveDraft}>
          {ar ? 'احفظ المسودة هنا' : 'Save the draft here'}
        </button>
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
