'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

import { simulateCampaign, type CampaignTier } from '@/lib/experience/campaignSimulation'
import { suggestSectionName } from '@/lib/experience/suggestSection'
import { iso2ForCountryId, resolveCurrencyForCountry } from '@/lib/seo/countryCurrency'

import styles from './StudioJourney.module.css'

type Mode = 'sale' | 'wanted' | 'auction'
type CatalogOption = { id: number; name: string }
type StudioField = {
  key: string
  name: string
  options: { id: number; name: string }[]
}

export type StudioCatalog = {
  sections: CatalogOption[]
  categories: CatalogOption[]
  cities: CatalogOption[]
  countries: CatalogOption[]
  sectionId: number | null
  categoryId: number | null
  cityId: string | null
  countryId: number | null
  price: string
  countryName: string
  fields: StudioField[]
  attributeValues: Record<string, string>
  onSection: (id: number) => void
  onCategory: (id: number) => void
  onCity: (id: string) => void
  onCountry: (id: number) => void
  onPrice: (value: string) => void
  onAttribute: (key: string, value: string) => void
}

const STEPS = [
  { id: 'story', ar: 'النص', en: 'Story' },
  { id: 'place', ar: 'المكان', en: 'Place' },
  { id: 'media', ar: 'الصور', en: 'Photos' },
  { id: 'offer', ar: 'العرض', en: 'Offer' },
  { id: 'insight', ar: 'التقدير', en: 'Estimate' },
  { id: 'preview', ar: 'المعاينة', en: 'Preview' },
] as const

export default function StudioJourney({
  locale,
  mode,
  title,
  description: descriptionProp = '',
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
  description?: string
  onUseTitle: (value: string) => void
  onDescribe?: (value: string) => void
  onContinue?: () => void
  files?: File[]
  onFilesChange?: (files: File[]) => void
  catalog?: StudioCatalog
}) {
  const ar = locale === 'ar'
  const [step, setStep] = useState(0)
  const [description, setDescription] = useState(descriptionProp)
  useEffect(() => {
    if (descriptionProp && !description) setDescription(descriptionProp)
  }, [descriptionProp, description])
  const [area, setArea] = useState('')
  const [condition, setCondition] = useState('used')
  const [negotiable, setNegotiable] = useState(false)
  const [budget, setBudget] = useState(15)
  const [days, setDays] = useState(7)
  const [objective, setObjective] = useState<'messages' | 'views'>('messages')
  const [placement, setPlacement] = useState<'home' | 'search'>('home')
  const [tier, setTier] = useState<CampaignTier>('free')
  const [note, setNote] = useState<string | null>(null)
  const [heldVideo, setHeldVideo] = useState<string | null>(null)
  const [previews, setPreviews] = useState<{ file: File; url: string }[]>([])

  useEffect(() => {
    const next = files.map((file) => ({ file, url: URL.createObjectURL(file) }))
    setPreviews(next)
    return () => next.forEach((item) => URL.revokeObjectURL(item.url))
  }, [files])
  const suggestion = suggestSectionName(`${title} ${description}`, catalog?.sections.map((section) => section.name) || [])
  const suggested = catalog?.sections.find((section) => section.name === suggestion) || null
  const currency = resolveCurrencyForCountry(iso2ForCountryId(catalog?.countryId))
  const cityName = catalog?.cities.find((city) => String(city.id) === catalog.cityId)?.name || ''
  const estimate = simulateCampaign({ objective, placement, tier, budget, days })

  const addPhotos = (list: FileList | null) => {
    if (!list || !onFilesChange) return
    const accepted = [...list].filter(
      (file) => ['image/jpeg', 'image/png', 'image/webp'].includes(file.type) && file.size <= 5 * 1024 * 1024,
    )
    onFilesChange([...files, ...accepted].slice(0, 5))
    setNote(
      accepted.length
        ? ar
          ? 'هذه الصور ستُرفع في خطوة الصور. لم تُنشر.'
          : 'These photos will upload on the photo step. They are not published.'
        : ar
          ? 'المقبول JPEG أو PNG أو WebP حتى 5 ميغابايت، وبحد 5 صور.'
          : 'JPEG, PNG, or WebP up to 5 MB, and at most 5 photos.',
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

  const current = STEPS[step]

  return (
    <div className={styles.studio}>
      <div className={styles.steps} role="tablist" aria-label={ar ? 'خطوات الاستوديو' : 'Studio steps'}>
        {STEPS.map((item, index) => (
          <button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={index === step}
            className={index === step ? styles.stepOn : styles.step}
            onClick={() => setStep(index)}
          >
            {ar ? item.ar : item.en}
          </button>
        ))}
      </div>

      {current.id === 'story' ? (
        <section className={styles.panel}>
          <label className={styles.field}>
            <span>{ar ? 'الوصف' : 'Description'}</span>
            <textarea
              rows={4}
              value={description}
              onChange={(event) => {
                setDescription(event.target.value)
                onDescribe?.(event.target.value)
              }}
            />
          </label>
          <div className={styles.row}>
            {(ar
              ? ['خزانة خشب للبيع في عمّان', 'أبحث عن دراجة', 'تويوتا كامري']
              : ['Wooden cabinet for sale in Amman', 'Looking for a bicycle', 'Toyota Camry']
            ).map((line) => (
              <button key={line} type="button" className={styles.quiet} onClick={() => onUseTitle(line)}>
                {line}
              </button>
            ))}
          </div>
          <p className={styles.hint}>{ar ? 'جمل جاهزة، ليست ناتجة عن نموذج.' : 'Prepared lines, not a model output.'}</p>
          {suggested ? (
            <button
              type="button"
              className={styles.quiet}
              onClick={() => {
                catalog?.onSection(suggested.id)
                setNote(ar ? 'اقتراح من كلمات النص، وليس من نموذج.' : 'A keyword hint, not a model.')
              }}
            >
              {ar ? `اقتراح من الكلمات: ${suggested.name}` : `Keyword hint: ${suggested.name}`}
            </button>
          ) : (
            <p className={styles.hint}>{ar ? 'لا اقتراح قسم من هذه الكلمات.' : 'These words do not hint a section.'}</p>
          )}
        </section>
      ) : null}

      {current.id === 'place' && catalog ? (
        <section className={styles.panel}>
          <label className={styles.field}>
            <span>{ar ? 'الدولة' : 'Country'}</span>
            <select
              value={catalog.countryId ?? ''}
              onChange={(event) => {
                const id = Number(event.target.value)
                if (!id || id === catalog.countryId) return
                catalog.onCountry(id)
                setNote(
                  ar
                    ? 'تغيّرت الدولة، فمُسحت المدينة إن كانت محددة. السعر بقي.'
                    : 'The country changed, so the city was cleared if one was set. The price stayed.',
                )
              }}
            >
              <option value="">{ar ? 'اختر الدولة' : 'Choose a country'}</option>
              {catalog.countries.map((country) => (
                <option key={country.id} value={country.id}>
                  {country.name}
                </option>
              ))}
            </select>
          </label>
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
          <label className={styles.field}>
            <span>{ar ? 'المدينة' : 'City'}</span>
            <select value={catalog.cityId ?? ''} onChange={(event) => catalog.onCity(event.target.value)}>
              <option value="">{ar ? 'اختر المدينة' : 'Choose a city'}</option>
              {catalog.cities.map((city) => (
                <option key={city.id} value={city.id}>
                  {city.name}
                </option>
              ))}
            </select>
          </label>
          <label className={styles.field}>
            <span>{ar ? 'الحي — لا يُرسل' : 'Area — not sent'}</span>
            <input value={area} onChange={(event) => setArea(event.target.value)} />
          </label>
        </section>
      ) : null}

      {current.id === 'media' ? (
        <section className={styles.panel}>
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
                <div key={`${photo.file.name}-${index}`} className={styles.thumb}>
                  <img src={photo.url} alt="" />
                  <div>
                    <button type="button" onClick={() => movePhoto(index, -1)} aria-label={ar ? 'تقديم' : 'Earlier'}>
                      ‹
                    </button>
                    <button type="button" onClick={() => movePhoto(index, 1)} aria-label={ar ? 'تأخير' : 'Later'}>
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
          <label className={styles.field}>
            <span>{ar ? 'فيديو — لن يُرفع' : 'Video — will not upload'}</span>
            <input
              type="file"
              accept="video/*"
              onChange={(event) => {
                const file = event.target.files?.[0]
                setHeldVideo(file ? file.name : null)
                setNote(ar ? 'لا مسار فيديو. الملف لم يُرفع.' : 'There is no video route. The file was not uploaded.')
                event.target.value = ''
              }}
            />
          </label>
          {heldVideo ? <p className={styles.hint}>{heldVideo}</p> : null}
        </section>
      ) : null}

      {current.id === 'offer' && catalog ? (
        <section className={styles.panel}>
          <label className={styles.field}>
            <span>{ar ? 'السعر' : 'Price'}</span>
            <input value={catalog.price} inputMode="decimal" onChange={(event) => catalog.onPrice(event.target.value)} />
          </label>
          <p className={styles.hint}>
            {currency
              ? ar
                ? `العملة المعروضة ${currency} من جدول الدولة. النموذج يرسل الرقم فقط.`
                : `Shown currency is ${currency} from the country table. The form sends the number only.`
              : ar
                ? 'لا عملة معروفة لهذه الدولة. النموذج يرسل الرقم فقط.'
                : 'No known currency for this country. The form sends the number only.'}
          </p>
          <label className={styles.field}>
            <span>{ar ? 'الحالة — لا تُرسل' : 'Condition — not sent'}</span>
            <select value={condition} onChange={(event) => setCondition(event.target.value)}>
              <option value="new">{ar ? 'جديد' : 'New'}</option>
              <option value="used">{ar ? 'مستعمل' : 'Used'}</option>
            </select>
          </label>
          <label className={styles.check}>
            <input type="checkbox" checked={negotiable} onChange={(event) => setNegotiable(event.target.checked)} />
            <span>{ar ? 'قابل للتفاوض — لا يُرسل' : 'Negotiable — not sent'}</span>
          </label>
          {catalog.fields.length === 0 ? (
            <p className={styles.hint}>
              {ar
                ? 'لا خصائص بقائمة خيارات بعد. الخصائص المتداخلة تبقى في خطوة النشر بعد الصور.'
                : 'No option lists yet. Nested attributes stay on the publish step after photos.'}
            </p>
          ) : (
            catalog.fields.map((field) => (
              <label key={field.key} className={styles.field}>
                <span>{field.name}</span>
                <select
                  value={catalog.attributeValues[field.key] || ''}
                  onChange={(event) => catalog.onAttribute(field.key, event.target.value)}
                >
                  <option value="">{ar ? 'اختر' : 'Choose'}</option>
                  {field.options.map((option) => (
                    <option key={option.id} value={option.id}>
                      {option.name}
                    </option>
                  ))}
                </select>
              </label>
            ))
          )}
        </section>
      ) : null}

      {current.id === 'insight' ? (
        <section className={styles.panel}>
          <h3>{ar ? 'جهّز الحملة' : 'Prepare the campaign'}</h3>
          <p className={styles.hint}>
            {ar
              ? `${[title.trim(), description.trim(), catalog?.sectionId, catalog?.cityId, files.length].filter(Boolean).length} من ٥ عناصر جاهزة. هذا اكتمال المسودة، وليس درجة طلب.`
              : `${[title.trim(), description.trim(), catalog?.sectionId, catalog?.cityId, files.length].filter(Boolean).length} of 5 pieces are ready. This is draft completeness, not demand.`}
          </p>
          <p className={styles.hint}>
            {ar
              ? `الجمهور الظاهر: ${cityName || 'المدينة التي تختارها'} · ${catalog?.sections.find((section) => section.id === catalog.sectionId)?.name || 'القسم الذي تختاره'}. النشر المسائي اقتراح للواجهة.`
              : `Visible audience: ${cityName || 'the city you choose'} · ${catalog?.sections.find((section) => section.id === catalog.sectionId)?.name || 'the section you choose'}. Evening is an interface suggestion.`}
          </p>
          <p className={styles.hint}>
            <Link href={`/${locale}/membership`}>{ar ? 'ميزة Elite: أدوات الحملات المتقدمة من صفحة العضوية.' : 'Elite: the advanced campaign tools live on the membership page.'}</Link>
          </p>
          {title.trim() ? (
            <Link href={`/${locale}/search?q=${encodeURIComponent(title.trim())}`}>
              {ar ? 'إعلانات بنفس العنوان' : 'Listings with this title'}
            </Link>
          ) : null}
          <div className={styles.row}>
            <label className={styles.field}>
              <span>{ar ? 'الهدف' : 'Objective'}</span>
              <select value={objective} onChange={(event) => setObjective(event.target.value as 'messages' | 'views')}>
                <option value="messages">{ar ? 'رسائل' : 'Messages'}</option>
                <option value="views">{ar ? 'مشاهدات' : 'Views'}</option>
              </select>
            </label>
            <label className={styles.field}>
              <span>{ar ? 'الموضع' : 'Placement'}</span>
              <select value={placement} onChange={(event) => setPlacement(event.target.value as 'home' | 'search')}>
                <option value="home">{ar ? 'الرئيسية' : 'Home'}</option>
                <option value="search">{ar ? 'البحث' : 'Search'}</option>
              </select>
            </label>
            <label className={styles.field}>
              <span>{ar ? 'وحدات الميزانية' : 'Budget units'}</span>
              <input
                inputMode="numeric"
                value={String(budget)}
                onChange={(event) => setBudget(Number(event.target.value) || 0)}
              />
            </label>
            <label className={styles.field}>
              <span>{ar ? 'الأيام' : 'Days'}</span>
              <input inputMode="numeric" value={String(days)} onChange={(event) => setDays(Number(event.target.value) || 1)} />
            </label>
          </div>
          <div className={styles.row}>
            {(['free', 'featured', 'gold', 'pro', 'elite'] as CampaignTier[]).map((item) => (
              <button key={item} type="button" className={tier === item ? styles.stepOn : styles.quiet} onClick={() => setTier(item)}>
                {item === 'free' ? (ar ? 'مجاني' : 'Free') : item}
              </button>
            ))}
          </div>
          <p className={styles.hint}>
            {ar
              ? `محاكاة: ${estimate.impressions.toLocaleString('ar-JO')} ظهور، ${estimate.reach.toLocaleString('ar-JO')} وصول، ${estimate.interactions.toLocaleString('ar-JO')} تفاعل، ${estimate.leads.toLocaleString('ar-JO')} أثر. ليست توقعاً ولا سعراً.`
              : `Simulation: ${estimate.impressions.toLocaleString('en-US')} impressions, ${estimate.reach.toLocaleString('en-US')} reach, ${estimate.interactions.toLocaleString('en-US')} interactions, ${estimate.leads.toLocaleString('en-US')} leads. Not a forecast and not a price.`}
          </p>
        </section>
      ) : null}

      {current.id === 'preview' ? (
        <section className={styles.preview}>
          <p className={styles.kicker}>{ar ? 'مسودة غير منشورة' : 'Unpublished draft'}</p>
          <h3>{title.trim() || (ar ? 'بدون عنوان' : 'No title')}</h3>
          <p>{description.trim() || (ar ? 'بدون وصف' : 'No description')}</p>
          <p>
            {(catalog?.price || (ar ? 'بدون سعر' : 'No price')) +
              (currency ? ` ${currency}` : '') +
              ' · ' +
              (cityName || (ar ? 'بدون مدينة' : 'No city')) +
              (area.trim() ? ` · ${area.trim()}` : '')}
          </p>
          <p>
            {ar
              ? `${files.length} صور جاهزة للرفع. الحالة والتفاوض والحي لا تُرسل.`
              : `${files.length} photos are ready to upload. Condition, negotiation, and area are not sent.`}
          </p>
          {mode === 'sale' && onContinue ? (
            <button type="button" className={styles.primary} onClick={onContinue}>
              {ar ? 'تابع إلى الصور والنشر' : 'Continue to photos and publishing'}
            </button>
          ) : (
            <p className={styles.hint}>
              {ar ? 'هذا الوضع لا ينشر إعلاناً من هنا.' : 'This mode does not publish a listing from here.'}
            </p>
          )}
        </section>
      ) : null}

      {note ? <p className={styles.note}>{note}</p> : null}
      <div className={styles.nav}>
        <button type="button" className={styles.quiet} disabled={step === 0} onClick={() => setStep((value) => Math.max(0, value - 1))}>
          {ar ? 'السابق' : 'Back'}
        </button>
        <button
          type="button"
          className={styles.primary}
          disabled={step === STEPS.length - 1}
          onClick={() => setStep((value) => Math.min(STEPS.length - 1, value + 1))}
        >
          {ar ? 'التالي' : 'Next'}
        </button>
      </div>
    </div>
  )
}
