'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'

import styles from './AdStudioDemo.module.css'

type Mode = 'sale' | 'wanted' | 'auction'
type CatalogOption = { id: number; name: string }

export type StudioCatalog = {
  sections: CatalogOption[]
  categories: CatalogOption[]
  cities: CatalogOption[]
  sectionId: number | null
  categoryId: number | null
  cityId: string | null
  price: string
  countryName: string
  onSection: (id: number) => void
  onCategory: (id: number) => void
  onCity: (id: string) => void
  onPrice: (value: string) => void
}

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
  files = [],
  onFilesChange,
  catalog,
}: {
  locale: string
  mode: Mode
  title: string
  onUseTitle: (value: string) => void
  onDescribe?: (value: string) => void
  onContinue?: () => void
  files?: File[]
  onFilesChange?: (files: File[]) => void
  catalog?: StudioCatalog
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
  const sampleReach = Number(budget) * Number(days) * 40

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

  const [objective, setObjective] = useState('messages')
  const [placement, setPlacement] = useState('home')
  const previews = useMemo(() => files.map((file) => ({ file, url: URL.createObjectURL(file) })), [files])

  useEffect(() => {
    return () => {
      previews.forEach((item) => URL.revokeObjectURL(item.url))
    }
  }, [previews])

  const addPhotos = (list: FileList | null) => {
    if (!list || !onFilesChange) return
    const accepted: File[] = []
    for (const file of [...list]) {
      const okType = ['image/jpeg', 'image/png', 'image/webp'].includes(file.type)
      if (!okType || file.size > 5 * 1024 * 1024) continue
      accepted.push(file)
    }
    const next = [...files, ...accepted].slice(0, 5)
    onFilesChange(next)
    setStatus(
      accepted.length === 0
        ? ar
          ? 'لم تُقبل الصور. المسموح JPEG أو PNG أو WebP حتى 5 ميغابايت، وبحد 5 صور.'
          : 'No photos were accepted. JPEG, PNG, or WebP up to 5 MB, and at most 5 photos.'
        : ar
          ? 'هذه الملفات نفسها ستُرفع في خطوة الصور. لم تُنشر بعد.'
          : 'These are the same files the photo step will upload. They are not published yet.',
    )
  }

  const movePhoto = (index: number, direction: -1 | 1) => {
    if (!onFilesChange) return
    const target = index + direction
    if (target < 0 || target >= files.length) return
    const next = [...files]
    const [item] = next.splice(index, 1)
    next.splice(target, 0, item)
    onFilesChange(next)
  }

  return (
    <div className={styles.studio}>
      <p className={styles.banner}>
        {catalog
          ? ar
            ? 'القسم والمدينة والسعر يُكتبان في نموذج النشر الحالي. لم يُنشر شيء.'
            : 'Section, city, and price are written into the current publish form. Nothing is published.'
          : mode === 'sale'
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
      {catalog ? (
        <>
          <label className={styles.field}>
            <span>{ar ? 'القسم' : 'Section'}</span>
            <select
              value={catalog.sectionId ?? ''}
              onChange={(event) => {
                const id = Number(event.target.value)
                if (id) catalog.onSection(id)
              }}
            >
              <option value="">{ar ? 'اختر القسم' : 'Choose a section'}</option>
              {catalog.sections.map((section) => (
                <option key={section.id} value={section.id}>
                  {section.name}
                </option>
              ))}
            </select>
          </label>
          <label className={styles.field}>
            <span>{ar ? 'الفئة' : 'Category'}</span>
            <select
              value={catalog.categoryId ?? ''}
              disabled={!catalog.sectionId}
              onChange={(event) => {
                const id = Number(event.target.value)
                if (id) catalog.onCategory(id)
              }}
            >
              <option value="">{ar ? 'اختر الفئة' : 'Choose a category'}</option>
              {catalog.categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </label>
          <div className={styles.row}>
            <label className={styles.field}>
              <span>{ar ? 'المدينة' : 'City'}</span>
              <select value={catalog.cityId ?? ''} onChange={(event) => catalog.onCity(event.target.value)}>
                <option value="">{catalog.countryName || (ar ? 'اختر المدينة' : 'Choose a city')}</option>
                {catalog.cities.map((city) => (
                  <option key={city.id} value={city.id}>
                    {city.name}
                  </option>
                ))}
              </select>
            </label>
            <label className={styles.field}>
              <span>{ar ? 'السعر' : 'Price'}</span>
              <input
                value={catalog.price}
                onChange={(event) => catalog.onPrice(event.target.value)}
                inputMode="decimal"
              />
            </label>
          </div>
        </>
      ) : (
        <>
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
      )}
      <section className={styles.panel}>
        <h3>{ar ? 'معاينة المسودة' : 'Draft preview'}</h3>
        <p>{title.trim() || (ar ? 'بدون عنوان' : 'No title')}</p>
        <p>{description.trim() || (ar ? 'بدون وصف' : 'No description')}</p>
        <p>
          {(catalog?.price || price || (ar ? 'بدون سعر' : 'No price')) +
            ' · ' +
            (catalog?.cities.find((city) => String(city.id) === catalog.cityId)?.name ||
              place ||
              (ar ? 'بدون مدينة' : 'No city'))}
        </p>
        <p>
          {ar
            ? `${files.length} صور جاهزة للرفع. ليست منشورة.`
            : `${files.length} photos are ready to upload. They are not published.`}
        </p>
      </section>
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
        <span>{ar ? 'صور الإعلان' : 'Listing photos'}</span>
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          onChange={(event) => {
            addPhotos(event.target.files)
            event.target.value = ''
          }}
        />
      </label>
      {previews.length > 0 ? (
        <div className={styles.thumbs}>
          {previews.map((photo, index) => (
            <div key={`${photo.file.name}-${photo.file.size}-${index}`} className={styles.thumb}>
              <img src={photo.url} alt="" />
              <div>
                <button type="button" onClick={() => movePhoto(index, -1)} aria-label={ar ? 'تقديم' : 'Move earlier'}>
                  ‹
                </button>
                <button type="button" onClick={() => movePhoto(index, 1)} aria-label={ar ? 'تأخير' : 'Move later'}>
                  ›
                </button>
                <button type="button" onClick={() => onFilesChange?.(files.filter((_, item) => item !== index))}>
                  {ar ? 'إزالة' : 'Remove'}
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : null}
      <section className={styles.panel}>
        <h3>{ar ? 'ذكاء معلّم كتجربة' : 'Labeled intelligence'}</h3>
        <p>
          {ar
            ? 'لا طلب ولا أسعار مشابهة من الخادم. لن يُحسب سعر مقترح.'
            : 'The server has no demand and no similar prices. No price is suggested.'}
        </p>
        <p>
          {ar
            ? `وصول افتراضي: ${sampleReach.toLocaleString('ar-JO')}. الحساب هو الميزانية × الأيام × 40. الرقم 40 ثابت هنا وليس من حملات.`
            : `Assumed reach: ${sampleReach.toLocaleString('en-US')}. The sum is budget × days × 40. The 40 is fixed here and does not come from campaigns.`}
        </p>
        <p>{ar ? 'لا سجل لأوقات النشر، لذلك لا توجد ساعة أفضل.' : 'There is no posting-time history, so there is no best hour.'}</p>
        {title.trim() ? (
          <Link href={`/${locale}/search?q=${encodeURIComponent(title.trim())}`}>
            {ar ? 'ابحث عن إعلانات بهذا العنوان' : 'Search listings with this title'}
          </Link>
        ) : null}
      </section>
      <section className={styles.panel}>
        <h3>{ar ? 'حملة غير مربوطة' : 'Unconnected campaign'}</h3>
        <div className={styles.row}>
          <label className={styles.field}>
            <span>{ar ? 'الهدف' : 'Objective'}</span>
            <select value={objective} onChange={(event) => setObjective(event.target.value)}>
              <option value="messages">{ar ? 'رسائل' : 'Messages'}</option>
              <option value="views">{ar ? 'مشاهدات' : 'Views'}</option>
            </select>
          </label>
          <label className={styles.field}>
            <span>{ar ? 'الموضع' : 'Placement'}</span>
            <select value={placement} onChange={(event) => setPlacement(event.target.value)}>
              <option value="home">{ar ? 'الرئيسية' : 'Home'}</option>
              <option value="search">{ar ? 'البحث' : 'Search'}</option>
            </select>
          </label>
        </div>
        <p>
          {ar
            ? 'لا أسعار للباقات ولا استهداف مدينة. الاختيار يبقى في هذا المتصفح.'
            : 'There are no package prices and no city targeting. The choice stays in this browser.'}
        </p>
      </section>
      <div className={styles.actions}>
        {onContinue ? (
          <button type="button" className={styles.primary} onClick={onContinue}>
            {ar ? 'إلى خطوة الصور' : 'Continue to the photo step'}
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
