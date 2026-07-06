'use client'
import Image from 'next/image'
import {
  Button,
  Card,
  Col,
  Row,
} from 'react-bootstrap'
import * as yup from 'yup'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'

import defaultUserAvatar from '@/assets/images/avatar/user-default.svg'
import { resolveMediaUrl } from '@/lib/media/resolveMediaUrl'
import { useCurrentUser } from '@/context/useCurrentUser'
import Link from 'next/link'
import Select from 'react-select'
import { useRouter } from 'next/navigation'

import {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
  startTransition,
  type ReactNode,
  type InputHTMLAttributes,
  type ChangeEvent,
  type RefObject,
} from 'react'
import { fetchCategoriesBySectionId, type Category } from '@/lib/api/categories'
import { fetchFields, fetchSubFields, type Field, type SubField, type AttributeOption } from '@/lib/api/fields'
import { useAppData } from '@/context/AppDataContext'
import type { Section } from '@/lib/api/sections'
import { createPost, deletePostImage, updatePost, type CreatePostData, type PostRecord } from '@/lib/api/posts'
import { useSession } from 'next-auth/react'
import LoginRequiredDialog from '@/components/dialogs/LoginRequiredDialog'
import PostSuccessCelebrationModal from '@/components/dialogs/PostSuccessCelebrationModal'
import { dispatchPostCreated } from '@/lib/postCreated'
import WizardPostPhotosStep from './WizardPostPhotosStep'
import clsx from 'clsx'
import {
  BsBullseye,
  BsBrush,
  BsCamera,
  BsCheck2,
  BsArrowLeft,
  BsArrowRight,
  BsCurrencyDollar,
  BsGraphUp,
  BsGrid3X3Gap,
  BsPencilSquare,
  BsPeople,
  BsPlus,
  BsRocketTakeoff,
  BsTag,
  BsTags,
} from 'react-icons/bs'
import { useParams } from 'next/navigation'
import { t } from '@/lib/translations'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { CreatePostWizardStepper, wizardStepMotion } from './CreatePostWizardUI'
import styles from './CreatePostCard.module.css'
import { toast } from 'react-toastify'
import { playWizardStepChime } from '@/lib/ui/wizardStepChime'
import { usePostCreationLimit } from '@/hooks/usePostCreationLimit'
import PostCreationLimitOverlay from './PostCreationLimitOverlay'
import { useEmailVerificationGate } from '@/context/EmailVerificationProvider'

type CreatePostCardProps = {
  mode?: 'create' | 'edit'
  initialPost?: any
  postId?: number | string
  locale?: string
}

const WIZARD_GLASS_TINT_CLASSES = [
  styles.wizardGlassTint0,
  styles.wizardGlassTint1,
  styles.wizardGlassTint2,
  styles.wizardGlassTint3,
  styles.wizardGlassTint4,
  styles.wizardGlassTint5,
  styles.wizardGlassTint6,
  styles.wizardGlassTint7,
] as const

function pickWizardGlassTintClass(id: number | string) {
  let hash = 0
  if (typeof id === 'number' && Number.isFinite(id)) {
    hash = Math.abs(Math.trunc(id))
  } else {
    const s = String(id)
    for (let i = 0; i < s.length; i++) {
      hash = (hash * 31 + s.charCodeAt(i)) | 0
    }
  }
  return WIZARD_GLASS_TINT_CLASSES[Math.abs(hash) % WIZARD_GLASS_TINT_CLASSES.length]
}

const SMART_CHIP_COMING_ICONS = [BsGraphUp, BsBullseye, BsPeople, BsCurrencyDollar] as const
const SMART_CHIP_COMING_MIN_WIDTHS = [88, 108, 96, 92] as const

/** غلاف بسيط بدون صندوق خارجي — المظهر من الكبسولة الداخلية فقط */
function ComposerCardAtmosphere({ children }: { children: ReactNode }) {
  return <div className={styles.composerCardAtmosphere}>{children}</div>
}

/** اقتراحات ذكية «قريباً»: أيقونة واضحة + شريط نص مموّه بدون نص في DOM */
function SmartChipsComingSoonTeaser() {
  return (
    <div className={`${styles.smartChips} ${styles.smartChipsComing}`} aria-hidden="true">
      {SMART_CHIP_COMING_MIN_WIDTHS.map((minW, idx) => {
        const Icon = SMART_CHIP_COMING_ICONS[idx]
        return (
          <span
            key={idx}
            className={styles.smartChipComing}
            style={{ minWidth: `${minW}px` }}
          >
            <span className={styles.smartChipComingIcon}>
              <Icon size={14} aria-hidden />
            </span>
            <span className={styles.smartChipComingCipher} />
          </span>
        )
      })}
    </div>
  )
}

type CreatePostHeroShellProps = {
  locale: string
  isWizardRtl: boolean
  title: string
  onChange: (e: ChangeEvent<HTMLInputElement>) => void
  inputRef?: RefObject<HTMLInputElement | null>
  inputProps: Omit<InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange' | 'className' | 'ref'>
  errorText?: string | null
  showTags: boolean
  onAddAdClick: () => void
  limitOverlay?: ReactNode
}

/** واجهة البطل الافتراضية (ضيف / عنوان فارغ) — تصميم موحّد للموبايل والشاشات العريضة */
function CreatePostHeroShell({
  locale,
  isWizardRtl,
  title,
  onChange,
  inputRef,
  inputProps,
  errorText,
  showTags,
  onAddAdClick,
  limitOverlay,
}: CreatePostHeroShellProps) {
  const shellDir = isWizardRtl ? 'rtl' : 'ltr'
  const rowDir = isWizardRtl ? 'rtl' : 'ltr'
  const tagItems = [
    { Icon: BsPencilSquare, label: t('createPost.heroTagTitle', locale as any) },
    { Icon: BsBrush, label: t('createPost.heroTagDesc', locale as any) },
    { Icon: BsTag, label: t('createPost.heroTagPrice', locale as any) },
    { Icon: BsCamera, label: t('createPost.heroTagPhotos', locale as any) },
  ] as const

  return (
    <div className={styles.composerHeroShell} dir={shellDir}>
    

      <div className={styles.composerHeroTop} dir={rowDir}>
        <div className={styles.composerHeroCopy}>
          <h2 className={styles.composerHeroHeading}>{t('createPost.heroTitle', locale as any)}</h2>
          <p className={styles.composerHeroSub}>{t('createPost.heroSubtitle', locale as any)}</p>
        </div>

        <div className={styles.composerHeroFieldCol}>
          <label className={styles.composerSrOnly} htmlFor={inputProps.id ?? 'create-post-hero-title'}>
            {t('createPost.heroTitle', locale as any)}
          </label>
          <div
            className={clsx(
              styles.composerHeroInlineShell,
              errorText ? styles.composerHeroInlineShellInvalid : undefined,
            )}
            dir={rowDir}
          >
            <input
              {...inputProps}
              ref={inputRef}
              id={inputProps.id ?? 'create-post-hero-title'}
              className={styles.composerHeroInlineField}
              value={title}
              onChange={onChange}
              placeholder={t('createPost.heroPlaceholder', locale as any)}
              aria-invalid={errorText ? true : undefined}
              aria-describedby={errorText ? 'create-post-hero-title-err' : undefined}
            />


{
  !title && 
            <span
              className={styles.composerHeroInlineAffix}
              onClick={onAddAdClick}
              onKeyDown={(e) => {
                if (e.key !== 'Enter' && e.key !== ' ') return
                e.preventDefault()
                onAddAdClick()
              }}
              role="button"
              tabIndex={0}
              title={t('createPost.heroAddAd', locale as any)}
            >
              <BsPlus size={15} strokeWidth={1} aria-hidden />
              <span>{t('createPost.heroAddAd', locale as any)}</span>
            </span>
          }


          </div>
          {errorText ? (
            <div id="create-post-hero-title-err" className="text-danger small mt-1">
              {errorText}
            </div>
          ) : null}
        </div>
      </div>

      {showTags ? (
        <div className={styles.composerHeroTags}>
          {tagItems.map(({ Icon, label }) => (
            <span key={label} className={styles.composerHeroTag}>
              <span className={styles.composerHeroTagIcon}>
                <Icon size={14} aria-hidden />
              </span>
              {label}
            </span>
          ))}
        </div>
      ) : null}
      {limitOverlay}
    </div>
  )
}

/** أنماط react-select ناعمة متوافقة مع حقول المعالج */
function buildWizardSelectStyles(hasError: boolean) {
  return {
    control: (base: Record<string, unknown>, state: { isFocused: boolean }) => ({
      ...base,
      minHeight: 46,
      borderRadius: 14,
      borderWidth: 1.5,
      borderColor: hasError
        ? '#e8a0a0'
        : state.isFocused
          ? 'rgba(254, 203, 1, 0.82)'
          : 'rgba(21, 21, 21, 0.08)',
      backgroundColor: '#fff',
      boxShadow: state.isFocused && !hasError ? '0 0 0 3px rgba(254, 203, 1, 0.2)' : 'none',
      '&:hover': {
        borderColor: hasError ? '#e8a0a0' : 'rgba(21, 21, 21, 0.12)',
      },
    }),
    menu: (base: Record<string, unknown>) => ({
      ...base,
      borderRadius: 12,
      overflow: 'hidden',
      boxShadow: '0 16px 44px rgba(21, 21, 21, 0.12)',
    }),
    menuList: (base: Record<string, unknown>) => ({ ...base, padding: 4 }),
    option: (base: Record<string, unknown>, state: { isSelected: boolean; isFocused: boolean }) => ({
      ...base,
      cursor: 'pointer',
      backgroundColor: state.isSelected
        ? '#151515'
        : state.isFocused
          ? 'rgba(254, 203, 1, 0.18)'
          : 'transparent',
      color: state.isSelected ? '#fecb01' : '#151515',
    }),
  }
}

const CreatePostCard = ({ mode = 'create', initialPost, postId, locale: localeProp }: CreatePostCardProps) => {
  // الحصول على الجلسة أولاً
  const { data: session, status } = useSession()
  const { ensureEmailVerified } = useEmailVerificationGate()
  const emailVerifiedForComposerRef = useRef(false)
  const [showLoginAlert, setShowLoginAlert] = useState(false)
  // Current user avatar comes from the shared CurrentUserProvider — one fetch, global state.
  const { user: _currentUser, avatarUrl: _resolvedAvatarUrl } = useCurrentUser()
  const currentUserAvatar = _currentUser ? _resolvedAvatarUrl : null
  const [postSuccessOpen, setPostSuccessOpen] = useState(false)
  const [postSuccessMeta, setPostSuccessMeta] = useState<{
    id?: number | string
    title?: string
    variant?: 'published' | 'pending_review'
  } | null>(null)
  const router = useRouter()
  const params = useParams<{ locale?: string }>()
  const isEdit = mode === 'edit'
  
  // Get locale from prop, params, or default to 'ar'
  const locale = localeProp || (Array.isArray(params?.locale) ? params.locale[0] : params?.locale) || 'ar'

  const limitCheckReady = status === 'authenticated' && Boolean(session?.accessToken)
  const creationLimit = usePostCreationLimit(!isEdit && limitCheckReady, locale, session?.accessToken)

  const isSessionPending = !isEdit && status === 'loading'
  const isAwaitingAccessToken = !isEdit && status === 'authenticated' && !session?.accessToken
  const isRateLimitActive =
    !isEdit &&
    creationLimit.hasChecked &&
    !creationLimit.canCreate &&
    !creationLimit.isAccountVerified

  const showHeroRateLimitOverlay =
    !isEdit &&
    !creationLimit.isAccountVerified &&
    (isSessionPending ||
      isAwaitingAccessToken ||
      creationLimit.loading ||
      isRateLimitActive)

  const overlayLoading =
    isSessionPending || isAwaitingAccessToken || creationLimit.loading

  const isCreationBlocked = !isEdit && (showHeroRateLimitOverlay || isRateLimitActive)

  const guardComposerEmailVerification = useCallback(async () => {
    if (status !== 'authenticated') {
      setShowLoginAlert(true)
      return false
    }
    if (emailVerifiedForComposerRef.current) return true
    const ok = await ensureEmailVerified()
    if (ok) emailVerifiedForComposerRef.current = true
    return ok
  }, [status, ensureEmailVerified])

  const initialSectionId = Number(initialPost?.section_id ?? initialPost?.section?.id ?? 0) || null
  const initialCategoryId = Number(initialPost?.category_id ?? initialPost?.category?.id ?? 0) || null
  const initialCountryId = Number(initialPost?.country_id ?? 0) || null
  const initialCityId = Number(initialPost?.city_id ?? 0) || null
  const initialPrice = initialPost?.price != null ? Number(initialPost.price) : null

  const initialAttributes = useMemo(() => {
    if (!isEdit) return [] as Array<{ attributeId: number; optionId: number | number[] }>
    const raw = initialPost?.post_data?.attributes ?? initialPost?.post_data?.attributes ?? initialPost?.attributes
    if (!raw) return []
    if (typeof raw === 'string') {
      try {
        const parsed = JSON.parse(raw)
        return Array.isArray(parsed) ? parsed : []
      } catch {
        return []
      }
    }
    return Array.isArray(raw) ? raw : []
  }, [isEdit, initialPost])

const [step, setStep] = useState(1)
  const [subStep, setSubStep] = useState(1)
  const FIELDS_PER_SUBSTEP = 5

  // استخدام Context للبيانات المشتركة
  const {
    sections,
    loadingSections,
    countries,
    loadingCountries,
    selectedCountry,
    setSelectedCountry,
    cities,
    loadingCities,
  } = useAppData()

  // Debug: التحقق من بيانات المدن
  useEffect(() => {
    console.log('CreatePostCard - Cities state:', {
      cities,
      citiesLength: cities?.length,
      loadingCities,
      selectedCountry,
      isArray: Array.isArray(cities),
    })
  }, [cities, loadingCities, selectedCountry])

  // Note: currentUserAvatar is now provided by CurrentUserProvider (see top of file).

  const [selectedSection, setSelectedSection] = useState<Section | null>(null)
  const [sectionCategories, setSectionCategories] = useState<Category[]>([])
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null)
  const [loadingCategories, setLoadingCategories] = useState(false)
  const [fields, setFields] = useState<Field[]>([])
  const [loadingFields, setLoadingFields] = useState(false)
  const [formValues, setFormValues] = useState<Record<string, any>>({})
  const [nestedFields, setNestedFields] = useState<Record<string, SubField[]>>({})
  const [description, setDescription] = useState('')
  const [title, setTitle] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [images, setImages] = useState<File[]>([])
  const [dropzoneKey, setDropzoneKey] = useState(0)
  const [didPrefillAttributes, setDidPrefillAttributes] = useState(false)
  const [existingImages, setExistingImages] = useState<Array<{ id: number | string; url: string }>>(() => {
    if (!isEdit) return []
    const arr = Array.isArray((initialPost as any)?.post_images) ? (initialPost as any).post_images : []
    return arr
      .map((img: any) => ({
        id: img?.id,
        url: img?.image_full_url || img?.image,
      }))
      .filter((x: any) => x.id != null && x.url)
  })

  const smartCopy = useMemo(() => {
    return {
      title: t('createPost.smartTitle', locale as any),
      launch: t('createPost.launch', locale as any),
      placeholder: t('createPost.placeholder', locale as any),
    }
  }, [locale])

  const wizardStepLabels = useMemo(
    () => [
      t('createPost.wizard.step1', locale as any),
      t('createPost.wizard.step2', locale as any),
      t('createPost.wizard.step3', locale as any),
      t('createPost.wizard.step4', locale as any),
      t('createPost.wizard.step5', locale as any),
      t('createPost.wizard.step6', locale as any),
    ],
    [locale],
  )

  const reduceMotion = useReducedMotion()
  const fieldChunkTotal = Math.max(1, Math.ceil(fields.length / FIELDS_PER_SUBSTEP))

  const showWizardStepper =
    !isCreationBlocked &&
    (step > 1 ||
      (typeof title === 'string' && title.trim().length > 0) ||
      (typeof description === 'string' && description.trim().length > 0))

  /** صف المعالج أسفل البطل: عند وجود عنوان أو تجاوز الخطوة 1، أو وضع التعديل */
  const showComposerDock =
    isEdit || (!isCreationBlocked && (title.trim().length > 0 || step > 1))

  /** شارات المميزات أسفل البطل — فقط إنشاء جديد والخطوة 1 والعنوان فارغ */
  const showHeroFeatureTags = !isEdit && step === 1 && title.trim() === '' && !isCreationBlocked

  const isWizardRtl = locale === 'ar'

  const wizardNav = useMemo(
    () => ({
      prev: t('createPost.wizard.navPrev', locale as any),
      next: t('createPost.wizard.navNext', locale as any),
      submit: t('createPost.wizard.navSubmit', locale as any),
      submitting: t('createPost.wizard.navSubmitting', locale as any),
    }),
    [locale],
  )

  const navPrevIcon = isWizardRtl ? (
    <BsArrowRight className={styles.wizardBtnIcon} aria-hidden />
  ) : (
    <BsArrowLeft className={styles.wizardBtnIcon} aria-hidden />
  )
  const navNextIcon = isWizardRtl ? (
    <BsArrowLeft className={styles.wizardBtnIcon} aria-hidden />
  ) : (
    <BsArrowRight className={styles.wizardBtnIcon} aria-hidden />
  )

  const navSubmitIcon = (
    <BsCheck2 className={styles.wizardBtnIcon} aria-hidden />
  )

  const [deletingImageId, setDeletingImageId] = useState<string | null>(null)

  const handleRequestVerification = useCallback(async () => {
    try {
      const message = await creationLimit.requestVerification()
      if (message) {
        toast.success(message)
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t('createPost.rateLimit.requestVerificationFailed', locale as any))
    }
  }, [creationLimit, locale])

  const handleDeleteExistingImage = useCallback(
    async (img: { id: number | string; url: string }) => {
      if (!postId) return
      const accessToken = session?.accessToken
      if (!accessToken) {
        setShowLoginAlert(true)
        return
      }
      const ok = confirm(t('createPost.photos.confirmDelete', locale as any))
      if (!ok) return
      try {
        setDeletingImageId(String(img.id))
        await deletePostImage(postId, img.id, accessToken)
        setExistingImages((prev) => prev.filter((x) => String(x.id) !== String(img.id)))
      } catch (e) {
        console.error('Delete image failed', e)
        alert(e instanceof Error ? e.message : t('createPost.photos.deleteFailed', locale as any))
      } finally {
        setDeletingImageId(null)
      }
    },
    [postId, session?.accessToken, locale],
  )

  // مرجع للمكون الرئيسي لعمل scroll to top
  const cardRef = useRef<HTMLDivElement>(null)
  const titleInputRef = useRef<HTMLInputElement>(null)

  // إنشاء schema ديناميكي للـ validation
  const validationSchema = useMemo(() => {
    const schema: Record<string, any> = {}

    schema.title = yup
      .string()
      .trim()
      .required('يرجى إدخال عنوان الإعلان')
      .min(1, 'يرجى إدخال عنوان الإعلان')

    if (step === 1) {
      schema.description = yup.string().required('يرجى إدخال وصف الإعلان')
    }

    // Step 3: validation لاختيار القسم
    if (step === 3) {
      schema.section_id = yup.number().required('يرجى اختيار القسم')
    }

    // Step 4: validation لاختيار الفئة
    if (step === 4) {
      schema.section_id = yup.number().required('يرجى اختيار القسم')
      schema.category_id = yup.number().required('يرجى اختيار الفئة')
    }

    // إضافة validation للحقول الديناميكية
    const addFieldValidation = (field: Field | SubField) => {
      // تجنب إضافة نفس الحقل مرتين
      if (schema[field.key_name]) return

      if (field.required) {
        if (field.input_type === 'select' && field.multiselect) {
          schema[field.key_name] = yup.array().min(1, `${field.name} مطلوب`).required(`${field.name} مطلوب`)
        } else if (field.input_type === 'number') {
          schema[field.key_name] = yup.number().required(`${field.name} مطلوب`)
        } else {
          schema[field.key_name] = yup.string().required(`${field.name} مطلوب`)
        }
      } else {
        if (field.input_type === 'select' && field.multiselect) {
          schema[field.key_name] = yup.array().optional()
        } else if (field.input_type === 'number') {
          schema[field.key_name] = yup.number().optional()
        } else {
          schema[field.key_name] = yup.string().optional()
        }
      }
    }

    // إضافة validation لجميع الحقول الرئيسية (فقط في step 5)
    if (step === 5) {
      fields.forEach(addFieldValidation)

      // إضافة validation للحقول المتداخلة (sub-fields)
      const processedSubFields = new Set<string>()
      Object.values(nestedFields).forEach((subFieldsArray) => {
        if (Array.isArray(subFieldsArray)) {
          subFieldsArray.forEach((subField) => {
            if (!processedSubFields.has(subField.key_name)) {
              addFieldValidation(subField)
              processedSubFields.add(subField.key_name)
            }
          })
        }
      })
    }

    // Step 6: المدينة مطلوبة — السعر اختياري
    if (step === 6) {
      schema.city = yup.string().required('يرجى اختيار المدينة').nullable()
      schema.price = yup
        .number()
        .nullable()
        .optional()
        .transform((value, originalValue) =>
          originalValue === '' || originalValue == null ? undefined : value,
        )
        .min(0, 'السعر يجب أن يكون أكبر من أو يساوي 0')
    }

    return yup.object(schema)
  }, [fields, nestedFields, step])

  const {
    control,
    handleSubmit,
    formState: { errors },
    setValue,
    getValues,
    watch,
    trigger,
    reset,
    clearErrors,
  } = useForm({
    resolver: yupResolver(validationSchema),
    mode: 'onChange',
    defaultValues: {
      title: '',
      description: '',
      section_id: undefined,
      category_id: undefined,
      city: undefined,
      price: undefined,
    },
  })

  // Prefill basic fields in edit mode
  useEffect(() => {
    if (!isEdit || !initialPost) return

    const nextTitle = String(initialPost?.title ?? '')
    const nextDescription = String(initialPost?.description ?? '')
    setTitle(nextTitle)
    setDescription(nextDescription)
    setValue('title', nextTitle, { shouldValidate: false })
    setValue('description', nextDescription, { shouldValidate: false })

    if (initialPrice != null) {
      setFormValues((prev) => ({ ...prev, price: String(initialPrice) }))
      setValue('price', initialPrice, { shouldValidate: false })
    }
    if (initialCityId != null && initialCityId > 0) {
      setFormValues((prev) => ({ ...prev, city: String(initialCityId) }))
      setValue('city', String(initialCityId), { shouldValidate: false })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEdit, initialPost])

  // Ensure city select shows once cities are loaded
  useEffect(() => {
    if (!isEdit) return
    if (!initialCityId || Number(initialCityId) <= 0) return
    if (!Array.isArray(cities) || cities.length === 0) return

    setFormValues((prev) => ({ ...prev, city: String(initialCityId) }))
    setValue('city', String(initialCityId), { shouldValidate: false })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEdit, initialCityId, cities])

  // Prefill locked section/category/country in edit mode (do NOT allow changing them)
  useEffect(() => {
    if (!isEdit || !initialPost) return

    if (initialCountryId && Array.isArray(countries) && countries.length > 0) {
      const found = countries.find((c) => Number(c.id) === Number(initialCountryId))
      if (found) setSelectedCountry(found)
    }

    if (initialSectionId && Array.isArray(sections) && sections.length > 0 && !selectedSection) {
      const foundSection = sections.find((s) => Number(s.id) === Number(initialSectionId))
      if (foundSection) {
        setSelectedSection(foundSection)
        setValue('section_id', foundSection.id, { shouldValidate: false })
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEdit, initialPost, initialCountryId, countries, initialSectionId, sections])

  useEffect(() => {
    if (!isEdit || !initialPost) return
    if (!initialCategoryId) return
    if (selectedCategory) return
    if (!Array.isArray(sectionCategories) || sectionCategories.length === 0) return

    const foundCategory = sectionCategories.find((c) => Number(c.id) === Number(initialCategoryId))
    if (foundCategory) {
      setSelectedCategory(foundCategory)
      setValue('category_id', foundCategory.id, { shouldValidate: false })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEdit, initialPost, initialCategoryId, sectionCategories])

  // إعادة تهيئة الأخطاء عند تغيير step + إبقاء التحقق من العنوان نشطاً في كل الخطوات
  useEffect(() => {
    clearErrors()
    void trigger('title')
  }, [step, clearErrors, trigger])

  useEffect(() => {
    if (!isRateLimitActive || isEdit) return
    if (step > 1 || title.trim() || description.trim()) {
      setStep(1)
      setSubStep(1)
      setTitle('')
      setDescription('')
      setValue('title', '', { shouldValidate: false })
      clearErrors('title')
    }
  }, [
    isRateLimitActive,
    isEdit,
    step,
    title,
    description,
    setValue,
    clearErrors,
  ])

  // عمل scroll to top عند تغيير step
  useEffect(() => {
    if (cardRef.current) {
      cardRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }, [step])

  // إعادة تهيئة الحقول الديناميكية عند تغيير القسم أو الفئة — دون مسح العنوان/الوصف في RHF
  // (كان reset() بدون قيم يفرغ react-hook-form بينما title/description تبقى في useState فيظهر الحقل مملوءاً والتحقق يفشل)
  useEffect(() => {
    if (isEdit) return
    if (selectedSection) {
      setFormValues({})
      setNestedFields({})
      reset({
        title: (getValues('title') as string | undefined) ?? title ?? '',
        description: (getValues('description') as string | undefined) ?? description ?? '',
        section_id: selectedSection.id,
        category_id: undefined,
        city: undefined,
        price: undefined,
      })
      setSubStep(1)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- يشغّل عند تغيير معرّف القسم فقط؛ title/description من آخر إغلاق للـ effect
  }, [selectedSection?.id, reset, getValues])

  useEffect(() => {
    if (isEdit) return
    if (selectedCategory) {
      setFormValues({})
      setNestedFields({})
      reset({
        title: (getValues('title') as string | undefined) ?? title ?? '',
        description: (getValues('description') as string | undefined) ?? description ?? '',
        section_id: selectedSection?.id,
        category_id: selectedCategory.id,
        city: undefined,
        price: undefined,
      })
      setSubStep(1)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- يشغّل عند تغيير معرّف الفئة فقط
  }, [selectedCategory?.id, reset, getValues])

  // عند العودة لخطوة النص: مزامنة RHF مع الحالة المعروضة (يغطي أي فقدان سابق)
  useEffect(() => {
    if (step !== 1) return
    setValue('title', title, { shouldValidate: false })
    setValue('description', description, { shouldValidate: false })
  }, [step, title, description, setValue])

  // عند فتح خطوة القسم/الفئة: التأكد من أن معرفات RHF تطابق الاختيار البصري
  useEffect(() => {
    if (isEdit) return
    if (step !== 3 || !selectedSection) return
    setValue('section_id', selectedSection.id, { shouldValidate: false })
  }, [step, selectedSection?.id, isEdit, setValue])

  useEffect(() => {
    if (isEdit) return
    if (step !== 4 || !selectedSection || !selectedCategory) return
    setValue('section_id', selectedSection.id, { shouldValidate: false })
    setValue('category_id', selectedCategory.id, { shouldValidate: false })
  }, [step, selectedSection?.id, selectedCategory?.id, isEdit, setValue])

  const loadCategoriesForSection = useCallback(
    async (sectionId: number) => {
      setLoadingCategories(true)
      try {
        const categoriesData = await fetchCategoriesBySectionId(sectionId, locale)
        setSectionCategories(categoriesData)
      } catch (error) {
        console.error('Error fetching categories:', error)
      } finally {
        setLoadingCategories(false)
      }
    },
    [locale],
  )

  // جلب الفئات عند تغيير القسم (نفس القسم بدون تغيير لا يعيد التشغيل — لا نفرغ القائمة عند الرجوع من خطوة الفئات)
  useEffect(() => {
    if (selectedSection) {
      void loadCategoriesForSection(selectedSection.id)
    }
  }, [selectedSection, loadCategoriesForSection])

  // جلب الحقول عند الوصول لـ step 4
  useEffect(() => {
    if (step === 5 && selectedSection && selectedCategory) {
      const loadFields = async () => {
        setLoadingFields(true)
        try {
          const fieldsData = await fetchFields(selectedSection.id, selectedCategory.id, locale)
          setFields(fieldsData)
          setSubStep(1) // إعادة تعيين sub-step عند تحميل الحقول
        } catch (error) {
          console.error('Error fetching fields:', error)
        } finally {
          setLoadingFields(false)
        }
      }
      loadFields()
    }
  }, [step, selectedSection, selectedCategory])

  // Prefill dynamic attribute fields in edit mode once fields are loaded (including nested sub-fields)
  useEffect(() => {
    if (!isEdit || didPrefillAttributes) return
    if (!initialPost) return
    if (!Array.isArray(initialAttributes) || initialAttributes.length === 0) {
      setDidPrefillAttributes(true)
      return
    }
    if (!Array.isArray(fields) || fields.length === 0) return

    const attrs = initialAttributes

    const getAttrForFieldId = (fieldId: number) => {
      return attrs.find((a: any) => Number(a?.attributeId) === Number(fieldId))
    }

    const prefillOne = async (field: Field | SubField, parentPath: string) => {
      const attr = getAttrForFieldId(field.id)
      if (!attr) return

      const fieldKey = field.key_name
      const currentPath = parentPath ? `${parentPath}.${fieldKey}` : fieldKey
      const nestedKey = `${currentPath}_${field.id}`

      const optionId = (attr as any).optionId
      const value = Array.isArray(optionId) ? optionId.map((x: any) => String(x)) : String(optionId)

      setFormValues((prev) => ({ ...prev, [fieldKey]: value }))
      try {
        setValue(fieldKey, value as any, { shouldValidate: false, shouldDirty: false })
      } catch {
        // ignore
      }

      // Only single-select fields can have nested sub-fields in the current backend model
      if (Array.isArray(optionId)) return
      const optionIdNum = Number(optionId)
      if (!optionIdNum) return

      const selectedOpt = (field as any)?.attributeOptions?.find((o: any) => Number(o?.id) === optionIdNum)
      const childrenCount = Number(selectedOpt?.children_count ?? 0)
      if (childrenCount <= 0) return

      const subFieldsKey = `${nestedKey}_${optionIdNum}`
      const subFields = await loadSubFields(optionIdNum, field.id, subFieldsKey)
      if (!Array.isArray(subFields) || subFields.length === 0) return

      for (const subField of subFields) {
        await prefillOne(subField, currentPath)
      }
    }

    ;(async () => {
      try {
        for (const f of fields) {
          await prefillOne(f, '')
        }
      } finally {
        setDidPrefillAttributes(true)
      }
    })()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEdit, didPrefillAttributes, fields, initialAttributes, initialPost])

  // دالة لجلب الخيارات الفرعية
  const loadSubFields = async (optionId: number, attributeId: number, nestedKey: string) => {
    try {
      console.log('Loading subfields for:', { optionId, attributeId, nestedKey })
      const subFieldsData = await fetchSubFields(optionId, attributeId, locale)
      console.log('Subfields loaded:', subFieldsData)
      setNestedFields((prev) => {
        const updated = {
          ...prev,
          [nestedKey]: subFieldsData,
        }
        console.log('Updated nestedFields:', updated)
        return updated
      })
      return subFieldsData
    } catch (error) {
      console.error('Error fetching subfields:', error)
      return []
    }
  }

  // دالة لإزالة جميع التفرعات والتفرعات الفرعية بشكل متكرر
  const clearAllNestedFields = (baseKey: string) => {
    setNestedFields((prev) => {
      const newFields = { ...prev }
      // إزالة جميع المفاتيح التي تبدأ بـ baseKey
      Object.keys(newFields).forEach((key) => {
        if (key.startsWith(baseKey)) {
          delete newFields[key]
          // إزالة التفرعات الفرعية بشكل متكرر
          clearNestedFieldsRecursive(key, newFields)
        }
      })
      return newFields
    })
  }

  // دالة مساعدة لإزالة التفرعات بشكل متكرر
  const clearNestedFieldsRecursive = (parentKey: string, fields: Record<string, SubField[]>) => {
    Object.keys(fields).forEach((key) => {
      if (key.startsWith(`${parentKey}_`)) {
        delete fields[key]
        clearNestedFieldsRecursive(key, fields)
      }
    })
  }

  // دالة لإزالة جميع القيم الفرعية بشكل متكرر
  const clearAllNestedValues = (fieldKey: string) => {
    setFormValues((prev) => {
      const newValues = { ...prev }
      // إزالة جميع القيم التي تبدأ بـ fieldKey
      Object.keys(newValues).forEach((key) => {
        if (key.startsWith(`${fieldKey}.`) || key === fieldKey) {
          delete newValues[key]
        }
      })
      return newValues
    })
  }

  // دالة لتحديث قيمة الحقل وإزالة الحقول الفرعية التابعة
  const handleFieldChange = (fieldKey: string, value: any, currentPath: string = '', shouldClearNested: boolean = true) => {
    setFormValues((prev) => {
      const newValues = { ...prev }
      // إزالة جميع القيم الفرعية التابعة لهذا الحقل
      Object.keys(newValues).forEach((key) => {
        if (key.startsWith(`${fieldKey}.`)) {
          delete newValues[key]
        }
      })
      newValues[fieldKey] = value
      return newValues
    })

    // تحديث react-hook-form
    try {
      setValue(fieldKey, value, { shouldValidate: true, shouldDirty: true })
    } catch (error) {
      // تجاهل الأخطاء إذا كان الحقل غير موجود في schema
      console.warn(`Field ${fieldKey} not in schema:`, error)
    }

    // إزالة الحقول الفرعية من nestedFields فقط إذا كان يجب ذلك
    if (shouldClearNested && currentPath) {
      const keysToRemove = Object.keys(nestedFields).filter((key) => key.startsWith(`${currentPath}_`))
      if (keysToRemove.length > 0) {
        setNestedFields((prev) => {
          const newFields = { ...prev }
          keysToRemove.forEach((key) => delete newFields[key])
          return newFields
        })
      }
    }
  }

  // دالة لإرسال البيانات
  const onSubmit = async (data: any) => {
    if (!isEdit && !creationLimit.canCreate) {
      setSubmitError(creationLimit.message || t('createPost.rateLimit.title', locale as any))
      return
    }

    if (!(await guardComposerEmailVerification())) {
      return
    }

    if (!selectedSection || !selectedCategory) {
      setSubmitError('يرجى اختيار القسم والفئة')
      return
    }

    if (!formValues.city) {
      setSubmitError('يرجى اختيار المدينة')
      return
    }

    setIsSubmitting(true)
    setSubmitError(null)

    try {
      // جمع جميع القيم بما فيها المتداخلة في شكل array
      const attributes: Array<{ attributeId: number; optionId: number | number[] }> = []

      // دالة مساعدة لإضافة attribute (للمفرد)
      const addAttribute = (attributeId: number, optionId: number | string) => {
        const optionIdNum = typeof optionId === 'string' ? parseInt(optionId) : optionId
        if (!isNaN(optionIdNum)) {
          attributes.push({
            attributeId,
            optionId: optionIdNum,
          })
        }
      }

      // دالة مساعدة لإضافة attribute (للمتعدد - multiselect)
      const addMultiAttribute = (attributeId: number, optionIds: (string | number)[]) => {
        const optionIdsNum = optionIds
          .map((id) => (typeof id === 'string' ? parseInt(id) : id))
          .filter((id) => !isNaN(id))

        if (optionIdsNum.length > 0) {
          attributes.push({
            attributeId,
            optionId: optionIdsNum,
          })
        }
      }

      // إضافة الحقول الرئيسية
      fields.forEach((field) => {
        const fieldKey = field.key_name
        const value = formValues[fieldKey]

        if (value !== undefined && value !== null && value !== '') {
          // للحقول التي لها خيارات (select, radio, multiselect)
          if (field.input_type === 'select' || field.input_type === 'radio') {
            if (field.multiselect && Array.isArray(value)) {
              // multiselect: إضافة attribute واحد مع array من optionIds
              addMultiAttribute(field.id, value)
            } else if (!field.multiselect && typeof value === 'string') {
              // select/radio عادي: إضافة خيار واحد
              addAttribute(field.id, value)
            }
          }
          // للحقول النصية (text, textarea, number) - نتجاهلها لأنها لا تحتوي على optionId
        }
      })

      // إضافة الحقول المتداخلة (sub-fields)
      Object.keys(nestedFields).forEach((nestedKey) => {
        const subFields = nestedFields[nestedKey]
        if (Array.isArray(subFields)) {
          subFields.forEach((subField) => {
            const value = formValues[subField.key_name]
            if (value !== undefined && value !== null && value !== '') {
              // للحقول التي لها خيارات (select, radio, multiselect)
              if (subField.input_type === 'select' || subField.input_type === 'radio') {
                if (subField.multiselect && Array.isArray(value)) {
                  // multiselect: إضافة attribute واحد مع array من optionIds
                  addMultiAttribute(subField.id, value)
                } else if (!subField.multiselect && typeof value === 'string') {
                  // select/radio عادي: إضافة خيار واحد
                  addAttribute(subField.id, value)
                }
              }
              // للحقول النصية (text, textarea, number) - نتجاهلها لأنها لا تحتوي على optionId
            }
          })
        }
      })

      if (!selectedCountry) {
        setSubmitError('يرجى تحديد الدولة أولاً')
        setIsSubmitting(false)
        return
      }

      const priceRaw = formValues.price
      const priceParsed =
        priceRaw !== undefined && priceRaw !== null && String(priceRaw).trim() !== ''
          ? parseFloat(String(priceRaw))
          : undefined

      const postData: CreatePostData = {
        section_id: selectedSection.id,
        category_id: selectedCategory.id,
        city_id: parseInt(formValues.city, 10),
        country_id: selectedCountry.id,
        description: description || undefined,
        title: title || undefined,
        attributes,
        ...(priceParsed != null && !Number.isNaN(priceParsed) ? { price: priceParsed } : {}),
      }

      console.log('Sending post data:', postData)
      
      // الحصول على التوكن من الجلسة
      const accessToken = session?.accessToken
      if (!accessToken) {
        setSubmitError('يرجى تسجيل الدخول أولاً')
        setIsSubmitting(false)
        return
      }

      const response = isEdit && postId ? await updatePost(postId, postData, accessToken, images) : await createPost(postData, accessToken, images)
      console.log('Post response:', response)

      if (response.success) {
        if (isEdit && postId) {
          toast.success(t('createPost.success.updated', locale as any))
          const nextLocale = locale || (typeof window !== 'undefined' ? window.location.pathname.split('/')[1] : '')
          const target = nextLocale ? `/${nextLocale}/post/${postId}` : `/post/${postId}`
          router.push(target)
          return
        }

        const created = response.data as PostRecord | undefined
        const isPendingReview =
          created?.status === 'pending_review' ||
          (response as { moderation_status?: string }).moderation_status === 'pending_review'
        if (created && created.id != null && !isPendingReview) {
          dispatchPostCreated(created)
        }
        startTransition(() => {
          router.refresh()
        })

        // نجح الإرسال - إعادة تعيين النموذج
        setFormValues({})
        setNestedFields({})
        setDescription('')
        setTitle('')
        setSelectedSection(null)
        setSelectedCategory(null)
        setFields([])
        setSubStep(1)
        setStep(1)
        setImages([])
        setDropzoneKey((prev) => prev + 1)
        reset()
        setPostSuccessMeta({
          id: created?.id,
          title: (created?.title as string | undefined) || title || undefined,
          variant: isPendingReview ? 'pending_review' : 'published',
        })
        setPostSuccessOpen(true)
        void creationLimit.refresh()
      } else {
        setSubmitError(response.message || 'حدث خطأ أثناء حفظ البيانات')
      }
    } catch (error) {
      console.error('Error submitting form:', error)
      setSubmitError(error instanceof Error ? error.message : 'حدث خطأ أثناء إرسال البيانات')
      if (!isEdit) {
        void creationLimit.refresh()
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  // مكون لعرض الحقل مع دعم الخيارات المتداخلة
  const renderField = (
    field: Field | SubField,
    level: number = 0,
    parentPath: string = ''
  ) => {
    const fieldKey = field.key_name
    const currentPath = parentPath ? `${parentPath}.${fieldKey}` : fieldKey
    const value = formValues[fieldKey]
    const nestedKey = `${currentPath}_${field.id}`

    const fieldError = errors[fieldKey]

    return (
      <div
        key={`${field.id}_${currentPath}`}
        className={clsx(
          styles.wizardFieldGroup,
          level > 0 && styles.wizardNestedPanel,
          level > 1 && styles.wizardNestedPanelDeep,
        )}
      >
        <label className={styles.wizardLabel}>
          {field.name}
          {field.required && <span className={styles.wizardRequired}>*</span>}
        </label>
        {fieldError && (
          <div className="text-danger small mb-1">{fieldError.message as string}</div>
        )}

        {field.input_type === 'select' && (
          <Select
            options={field.attributeOptions?.map((option) => ({
              value: option.id.toString(),
              label: option.name,
            }))}
            value={
              field.multiselect
                ? field.attributeOptions
                  ?.filter((opt) => {
                    const val = Array.isArray(value) ? value : []
                    return val.includes(opt.id.toString())
                  })
                  .map((opt) => ({
                    value: opt.id.toString(),
                    label: opt.name,
                  })) || []
                : field.attributeOptions?.find((opt) => opt.id.toString() === value)
                  ? {
                    value: value,
                    label: field.attributeOptions.find((opt) => opt.id.toString() === value)?.name || '',
                  }
                  : null
            }
            onChange={async (selectedOption) => {
              // إذا تم إلغاء التحديد (null)
              if (!selectedOption) {
                // إزالة جميع التفرعات والتفرعات الفرعية بشكل متكرر
                clearAllNestedFields(nestedKey)
                clearAllNestedValues(fieldKey)
                handleFieldChange(fieldKey, field.multiselect ? [] : null, nestedKey, false)
                return
              }

              // معالجة القيمة المختارة
              let selectedValue: string | string[] | null
              let selectedOptionValue: string | null = null

              if (field.multiselect) {
                // في حالة multiselect
                if (Array.isArray(selectedOption)) {
                  selectedValue = selectedOption.map((opt) => opt.value)
                } else {
                  selectedValue = []
                }
              } else {
                // في حالة select عادي
                const singleOption = selectedOption as { value: string; label: string } | null
                if (singleOption && !Array.isArray(singleOption)) {
                  selectedValue = singleOption.value
                  selectedOptionValue = singleOption.value
                } else {
                  selectedValue = null
                }
              }

              // إزالة الحقول الفرعية القديمة إذا تم تغيير الاختيار
              if (value && value !== selectedValue) {
                if (field.multiselect) {
                  // في حالة multiselect، إزالة الخيارات التي لم تعد محددة
                  const oldValues = Array.isArray(value) ? value : []
                  const newValues = Array.isArray(selectedValue) ? selectedValue : []
                  oldValues.forEach((oldVal) => {
                    if (!newValues.includes(oldVal)) {
                      const oldSubFieldsKey = `${nestedKey}_${oldVal}`
                      clearAllNestedFields(oldSubFieldsKey)
                    }
                  })
                } else {
                  const oldSubFieldsKey = `${nestedKey}_${value}`
                  clearAllNestedFields(oldSubFieldsKey)
                }
              }

              // تحديث القيمة أولاً
              handleFieldChange(fieldKey, selectedValue, nestedKey, false)

              // إذا كان هناك خيارات فرعية، جلبها
              if (!field.multiselect && selectedOptionValue) {
                const selectedOpt = field.attributeOptions?.find(
                  (opt) => opt.id.toString() === selectedOptionValue
                )
                console.log('Selected option:', selectedOpt)
                if (selectedOpt) {
                  console.log('Children count:', selectedOpt.children_count)
                  if (selectedOpt.children_count && selectedOpt.children_count > 0) {
                    const subFieldsKey = `${nestedKey}_${selectedOptionValue}`
                    console.log('Loading subfields with key:', subFieldsKey)
                    await loadSubFields(selectedOpt.id, field.id, subFieldsKey)
                  } else {
                    console.log('No children for this option')
                  }
                } else {
                  console.log('Option not found')
                }
              }
            }}
            isMulti={field.multiselect}
            isSearchable={true}
            isClearable={true}
            placeholder={`اختر ${field.name}`}
            noOptionsMessage={() => 'لا توجد خيارات متاحة'}
            className="react-select-container"
            classNamePrefix="react-select"
            required={field.required}
            styles={buildWizardSelectStyles(!!fieldError) as any}
          />
        )}

        {field.input_type === 'radio' && (
          <div className="d-flex flex-wrap gap-2">
            {field.attributeOptions?.map((option) => (
              <button
                key={option.id}
                type="button"
                className={clsx(
                  'btn',
                  styles.wizardRadioChip,
                  value === option.id.toString() && styles.wizardRadioChipActive,
                )}
                onClick={async () => {
                  const selectedValue = option.id.toString()

                  // إزالة الحقول الفرعية القديمة إذا تم تغيير الاختيار
                  if (value && value !== selectedValue) {
                    const oldSubFieldsKey = `${nestedKey}_${value}`
                    clearAllNestedFields(oldSubFieldsKey)
                  }

                  // تحديث القيمة أولاً
                  handleFieldChange(fieldKey, selectedValue, nestedKey, false)

                  // إذا كان هناك خيارات فرعية، جلبها
                  if (selectedValue) {
                    const selectedOpt = field.attributeOptions?.find(
                      (opt) => opt.id.toString() === selectedValue
                    )
                    console.log('Selected radio option:', selectedOpt)
                    if (selectedOpt) {
                      console.log('Children count:', selectedOpt.children_count)
                      if (selectedOpt.children_count && selectedOpt.children_count > 0) {
                        const subFieldsKey = `${nestedKey}_${selectedValue}`
                        console.log('Loading subfields with key:', subFieldsKey)
                        await loadSubFields(selectedOpt.id, field.id, subFieldsKey)
                      } else {
                        console.log('No children for this option')
                      }
                    } else {
                      console.log('Option not found')
                    }
                  }
                }}
              >
                {option.name}
              </button>
            ))}
          </div>
        )}

        {field.input_type === 'text' && (
          <input
            type="text"
            className={styles.wizardInput}
            value={value || ''}
            onChange={(e) => handleFieldChange(fieldKey, e.target.value, nestedKey)}
            required={field.required}
          />
        )}

        {field.input_type === 'textarea' && (
          <textarea
            className={styles.wizardTextarea}
            rows={3}
            value={value || ''}
            onChange={(e) => handleFieldChange(fieldKey, e.target.value, nestedKey)}
            required={field.required}
          />
        )}

        {field.input_type === 'number' && (
          <input
            type="number"
            className={styles.wizardInput}
            value={value || ''}
            onChange={(e) => handleFieldChange(fieldKey, e.target.value, nestedKey)}
            required={field.required}
          />
        )}

        {/* عرض الخيارات الفرعية إذا كانت موجودة */}
        {value && (() => {
          const lookupKey = `${nestedKey}_${value}`
          const subFields = nestedFields[lookupKey]
          console.log('Rendering nested fields:', {
            value,
            nestedKey,
            lookupKey,
            availableKeys: Object.keys(nestedFields),
            found: subFields,
          })
          return subFields?.map((subField) =>
            renderField(subField, level + 1, currentPath)
          )
        })()}
      </div>
    )
  }

  if (status === 'unauthenticated') {
    return (
      <>
        <Card className={clsx('card-body', 'w-100', styles.composerCard)}>
          <ComposerCardAtmosphere>
            <CreatePostHeroShell
              locale={locale}
              isWizardRtl={isWizardRtl}
              title=""
              onChange={() => {}}
              inputProps={{
                readOnly: true,
                onClick: () => setShowLoginAlert(true),
                onFocus: (e) => (e.target as HTMLInputElement).blur(),
                id: 'create-post-hero-title-guest',
              }}
              showTags
              onAddAdClick={() => setShowLoginAlert(true)}
            />
          </ComposerCardAtmosphere>
        </Card>

        <LoginRequiredDialog
          show={showLoginAlert}
          onHide={() => setShowLoginAlert(false)}
          locale={locale}
        />
      </>
    )
  }

  return (
    <>
      <Card
        ref={cardRef}
        className={clsx('card-body', 'w-100', styles.composerCard)}
      >
        <ComposerCardAtmosphere>
          {!isEdit && step === 1 && (
              <CreatePostHeroShell
                locale={locale}
                isWizardRtl={isWizardRtl}
                title={title}
                onChange={(e) => {
                  if (isCreationBlocked) return
                  setTitle(e.target.value)
                  setValue('title', e.target.value, { shouldValidate: true })
                }}
                inputRef={titleInputRef}
                inputProps={{
                  id: 'create-post-title',
                  name: 'title',
                  autoComplete: 'off',
                  readOnly: isCreationBlocked,
                  tabIndex: isCreationBlocked ? -1 : undefined,
                  onFocus: async (e) => {
                    if (isCreationBlocked) return
                    if (!(await guardComposerEmailVerification())) {
                      e.target.blur()
                    }
                  },
                }}
                errorText={(errors.title?.message as string | undefined) || null}
                showTags={showHeroFeatureTags}
                onAddAdClick={async () => {
                  if (isCreationBlocked) return
                  if (!(await guardComposerEmailVerification())) return
                  titleInputRef.current?.focus()
                }}
                limitOverlay={
                  <PostCreationLimitOverlay
                    visible={showHeroRateLimitOverlay}
                    loading={overlayLoading}
                    locale={locale}
                    reason={creationLimit.reason}
                    remainingSeconds={Math.max(
                      creationLimit.remainingSeconds,
                      creationLimit.retryAfterSeconds,
                    )}
                    postsInLastHour={creationLimit.postsInLastHour}
                    hourlyLimit={creationLimit.hourlyLimit}
                    intervalMinutes={creationLimit.intervalMinutes}
                    message={creationLimit.message}
                    verificationRequestStatus={creationLimit.verificationRequestStatus}
                    submittingVerification={creationLimit.submittingVerification}
                    onRequestVerification={handleRequestVerification}
                  />
                }
              />
          )}
          {(isEdit || showComposerDock) && (
            <div className={clsx(!isEdit && styles.composerWizardDock)}>
        <div className={clsx(styles.smartRow, step === 1 && styles.smartRowComposer)}>
          <div
            className={clsx(
              styles.composerAvatar,
              !isEdit && step === 1 && styles.composerHeroAvatarHidden,
              step !== 1 && styles.composerAvatarHideWhenWizard,
            )}
          >
            <span role="button">
              {currentUserAvatar ? (
                <Image
                  key={currentUserAvatar}
                  className={styles.composerAvatarImg}
                  src={currentUserAvatar}
                  alt={session?.user?.name || 'avatar'}
                  width={40}
                  height={40}
                  unoptimized
                />
              ) : (
                <Image
                  className={styles.composerAvatarImg}
                  src={defaultUserAvatar}
                  alt={session?.user?.name || 'avatar'}
                  width={40}
                  height={40}
                />
              )}
            </span>
          </div>

          <div
            className={styles.smartContent}
            dir={isWizardRtl ? 'rtl' : 'ltr'}
          >
{/* 
          <AnimatePresence initial={false}>
            {showWizardStepper && (
              <motion.div
                key="wizard-stepper"
                initial={reduceMotion ? false : { opacity: 0, y: -12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reduceMotion ? undefined : { opacity: 0, y: -10 }}
                transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                className={styles.wizardStepperSticky}
              >
                <CreatePostWizardStepper
                  currentStep={step}
                  stepLabels={wizardStepLabels}
                  subStep={subStep}
                  subStepTotal={fieldChunkTotal}
                  subStepPartLabel={`${t('createPost.wizard.dynamicFields', locale as any)} · ${subStep}/${fieldChunkTotal}`}
                  dir={isWizardRtl ? 'rtl' : 'ltr'}
                />
              </motion.div>
            )}
          </AnimatePresence> */}

          <div className={clsx(styles.wizardScroll, styles.wizardScrollComposer)}>
          <form className="w-100">
          <AnimatePresence mode="wait">
{
  step === 1 && (
    <motion.div key="w-1" className={styles.wizardStepSurface} {...wizardStepMotion(reduceMotion)}>
                  {isEdit ? (
                    <div className={styles.composerTitleSection}>
                      <label className={styles.composerSrOnly} htmlFor="create-post-title">
                        عنوان الإعلان
                        <span className={styles.wizardRequired}>*</span>
                      </label>
                      <div className={clsx(styles.composerFieldRow, styles.composerFieldRowCompact)}>
                        <div
                          className={clsx(
                            styles.composerInlineShell,
                            errors.title && styles.composerInlineShellInvalid,
                          )}
                        >
                          <span className={styles.composerInputLead} aria-hidden>
                            <BsPencilSquare size={18} />
                          </span>
                          <input
                            ref={titleInputRef}
                            id="create-post-title"
                            className={clsx(styles.composerInlineField, errors.title && 'is-invalid')}
                            name="title"
                            placeholder={smartCopy.placeholder}
                            value={title || ''}
                            onChange={(e) => {
                              setTitle(e.target.value)
                              setValue('title', e.target.value, { shouldValidate: true })
                            }}
                            autoComplete="off"
                          />
                        </div>
                        {title.trim().length === 0 ? (
                          <button
                            type="button"
                            className={styles.composerLaunchChip}
                            onClick={() => titleInputRef.current?.focus()}
                            title={smartCopy.launch}
                          >
                            <BsRocketTakeoff className={styles.composerLaunchIcon} size={17} aria-hidden />
                            <span className={styles.composerLaunchText}>{smartCopy.launch}</span>
                          </button>
                        ) : null}
                      </div>
                      {errors.title && (
                        <div className="text-danger small mt-1">{errors.title.message as string}</div>
                      )}
                    </div>
                  ) : null}

                  <AnimatePresence initial={false}>
                    {title.trim().length > 0 ? (
                      <motion.div
                        key="step1-body"
                        className={styles.composerExpandedBody}
                        initial={reduceMotion ? false : { opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={reduceMotion ? undefined : { opacity: 0, y: 6 }}
                        transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                      >
                        {/* <p className={styles.wizardLead}>
                          {t('createPost.wizard.lead', locale as any)}
                        </p> */} 
                          

                        <div className={styles.wizardFieldGroup}>
                          <label className={styles.wizardLabel} htmlFor="create-post-description">
                            وصف الإعلان
                            <span className={styles.wizardRequired}>*</span>
                          </label>
                          <textarea
                            id="create-post-description"
                            className={clsx(styles.wizardTextarea, errors.description && 'is-invalid')}
                            rows={4}
                            name="description"
                            placeholder="اكتب وصفاً يوضّح الحالة، المواصفات، وما يميّز إعلانك"
                            value={description || ''}
                            onChange={(e) => {
                              setDescription(e.target.value)
                              setValue('description', e.target.value, { shouldValidate: true })
                            }}
                            required
                          />
                          {errors.description && (
                            <div className="text-danger small mt-1">
                              {errors.description.message as string}
                            </div>
                          )}
                        </div>

                        <SmartChipsComingSoonTeaser />

                        <div className={styles.wizardNavRow}>
                          <span aria-hidden="true" />
                          <button
                            type="button"
                            className={styles.wizardBtnPrimary}
                            onClick={async () => {
                              playWizardStepChime()
                              const titleValid = await trigger('title')
                              const descriptionValid = await trigger('description')
                              if (titleValid && descriptionValid) {
                                setStep(step + 1)
                              }
                            }}
                          >
                            <span className={styles.wizardBtnInner}>
                              {wizardNav.next}
                              {navNextIcon}
                            </span>
                          </button>
                        </div>
                      </motion.div>
                    ) : null}
                  </AnimatePresence>

    </motion.div>
  )
}
{
  step === 2 && (
    <motion.div key="w-2" className={styles.wizardStepSurface} {...wizardStepMotion(reduceMotion)}>
      <WizardPostPhotosStep
        locale={locale}
        dir={isWizardRtl ? 'rtl' : 'ltr'}
        classNames={{
          section: styles.wizardSection,
          sectionTitle: styles.wizardSectionTitle,
          sectionHint: styles.wizardSectionHint,
          badgeSoft: styles.wizardBadgeSoft,
        }}
        images={images}
        onImagesChange={setImages}
        dropzoneKey={dropzoneKey}
        isEdit={isEdit}
        existingImages={existingImages}
        deletingImageId={deletingImageId}
        onDeleteExistingImage={isEdit ? handleDeleteExistingImage : undefined}
      />

      <div className={styles.wizardNavRow}>
        <button
          type="button"
          className={styles.wizardBtnSecondary}
          onClick={() => {
            playWizardStepChime()
            setStep(1)
          }}
        >
          <span className={styles.wizardBtnInner}>
            {navPrevIcon}
            {wizardNav.prev}
          </span>
        </button>
        <button
          type="button"
          className={styles.wizardBtnPrimary}
          onClick={() => {
            playWizardStepChime()
            setStep(3)
          }}
        >
          <span className={styles.wizardBtnInner}>
            {wizardNav.next}
            {navNextIcon}
          </span>
        </button>
      </div>
    </motion.div>
  )
}
{
  step === 3 && (
    <motion.div key="w-3" className={styles.wizardStepSurface} {...wizardStepMotion(reduceMotion)}>
<Row className="position-relative">
          <Col xl={12} lg={11} className="mx-auto px-1 px-sm-2">
                      <div className={styles.wizardPickStep}>
                        <div className={styles.wizardSectionHead}>
                          <span className={styles.wizardSectionHeadIcon} aria-hidden>
                            <BsGrid3X3Gap size={22} />
                          </span>
                          <div className={styles.wizardSectionHeadText}>
                            <h3 className={styles.wizardSectionTitle}>اختر القسم</h3>
                            <p className={styles.wizardSectionHint}>
                              القسم يحدد أين يظهر إعلانك ضمن أقسام المنصة المبوبة.
                            </p>
                          </div>
                        </div>
                      </div>
                      {errors.section_id && (
                        <div className="alert alert-danger">
                          {errors.section_id.message as string}
                        </div>
                      )}
                      {isEdit ? (
                        <div className="alert alert-info">
                          لا يمكن تغيير القسم أثناء تعديل المنشور.
                          <div className="mt-2 fw-semibold">{selectedSection?.name || initialPost?.section?.name || '-'}</div>
                        </div>
                      ) : loadingSections ? (
                        <div className="text-center py-4">جاري التحميل...</div>
                      ) : (
                        <div className={styles.wizardPickGridShowcase}>
                          {sections.map((sectionItem, idx) => (
                            <motion.div
                              key={sectionItem.id}
                              className={styles.wizardPickCardMotion}
                              initial={reduceMotion ? false : { opacity: 0, y: 14 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{
                                delay: reduceMotion ? 0 : Math.min(idx * 0.04, 0.36),
                                duration: 0.32,
                                ease: [0.22, 1, 0.36, 1],
                              }}
                              whileHover={reduceMotion ? undefined : { y: -3, scale: 1.012 }}
                              whileTap={reduceMotion ? undefined : { scale: 0.98 }}
                            >
                              <div
                                role="button"
                                tabIndex={0}
                                onKeyDown={(e) => {
                                  if (e.key !== 'Enter' && e.key !== ' ') return
                                  e.preventDefault()
                                  ;(e.currentTarget as HTMLDivElement).click()
                                }}
                                onClick={async () => {
                                  playWizardStepChime()
                                  setSelectedSection(sectionItem)
                                  setValue('section_id', sectionItem.id, { shouldValidate: true })
                                  const isValid = await trigger('section_id')
                                  if (isValid) {
                                    setStep(4)
                                  }
                                }}
                                  className={clsx(
                                    'card card-body mb-0 text-center',
                                    styles.wizardPickCard,
                                    styles.wizardPickTile,
                                    styles.wizardPickCardComfortable,
                                    styles.wizardPickCardGlass,
                                    pickWizardGlassTintClass(sectionItem.id),
                                    selectedSection?.id === sectionItem.id && styles.wizardPickCardActive,
                                  )}
                                >
                                  {sectionItem.icon ? (
                                    <span className={styles.wizardPickIconWrap}>
                                      <Image
                                        className={clsx('d-block', styles.wizardPickThumb)}
                                      src={sectionItem.icon}
                                      alt={sectionItem.name}
                                      width={40}
                                      height={40}
                                      unoptimized
                                    />
                                  </span>
                                ) : null}
                                <h6 className="mb-0">{sectionItem.name}</h6>
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      )}
                      <div className={styles.wizardNavRow}>
                        <button
                          type="button"
                          className={styles.wizardBtnSecondary}
                          onClick={() => {
                            playWizardStepChime()
                            setStep(step - 1)
                          }}
                        >
                          <span className={styles.wizardBtnInner}>
                            {navPrevIcon}
                            {wizardNav.prev}
                          </span>
                        </button>
                        {(selectedSection || isEdit) && (
                          <button
                            type="button"
                            className={styles.wizardBtnPrimary}
                            onClick={async () => {
                              playWizardStepChime()
                              if (isEdit) {
                                setStep(4)
                                return
                              }
                              const isValid = await trigger('section_id')
                              if (!isValid) return
                              if (selectedSection && sectionCategories.length === 0) {
                                await loadCategoriesForSection(selectedSection.id)
                              }
                              setStep(4)
                            }}
                          >
                            <span className={styles.wizardBtnInner}>
                              {wizardNav.next}
                              {navNextIcon}
                            </span>
                          </button>
                        )}
                      </div>
                    </Col>
                  </Row>
    </motion.div>
              )
            }
            {
              step === 4 && (
    <motion.div key="w-4" className={styles.wizardStepSurface} {...wizardStepMotion(reduceMotion)}>
                  <Row className="position-relative">
                    <Col xl={12} lg={11} className="mx-auto px-1 px-sm-2">
                      <div className={styles.wizardPickStep}>
                        <div className={styles.wizardSectionHead}>
                          <span className={styles.wizardSectionHeadIcon} aria-hidden>
                            <BsTags size={22} />
                          </span>
                          <div className={styles.wizardSectionHeadText}>
                            <h3 className={styles.wizardSectionTitle}>اختر الفئة</h3>
                            <p className={styles.wizardSectionHint}>
                              الفئة تساعد المشترين على العثور على إعلانك بسرعة.
                            </p>
                          </div>
                        </div>
                      </div>
                      {errors.category_id && (
                        <div className="alert alert-danger">
                          {errors.category_id.message as string}
                        </div>
                      )}
                      {isEdit ? (
                        <div className="alert alert-info">
                          لا يمكن تغيير الفئة أثناء تعديل المنشور.
                          <div className="mt-2 fw-semibold">{selectedCategory?.name || initialPost?.category?.name || '-'}</div>
                        </div>
                      ) : loadingCategories ? (
                        <div className="text-center py-4">جاري التحميل...</div>
                      ) : (
                        <>
                          {selectedSection && (
                            <div className={clsx(styles.wizardSummaryBanner, 'mb-3')}>
                              <p className={styles.wizardSummaryMeta}>
                                القسم المختار
                              </p>
                              <p className={styles.wizardSummaryPickTitle}>{selectedSection.name}</p>
                            </div>
                          )}
                          <div className={styles.wizardPickGridShowcase}>
                            {sectionCategories.map((category, idx) => (
                              <motion.div
                                key={category.id}
                                className={styles.wizardPickCardMotion}
                                initial={reduceMotion ? false : { opacity: 0, y: 14 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{
                                  delay: reduceMotion ? 0 : Math.min(idx * 0.04, 0.36),
                                  duration: 0.32,
                                  ease: [0.22, 1, 0.36, 1],
                                }}
                                whileHover={reduceMotion ? undefined : { y: -3, scale: 1.012 }}
                                whileTap={reduceMotion ? undefined : { scale: 0.98 }}
                              >
                                <div
                                  role="button"
                                  tabIndex={0}
                                  onKeyDown={(e) => {
                                    if (e.key !== 'Enter' && e.key !== ' ') return
                                    e.preventDefault()
                                    ;(e.currentTarget as HTMLDivElement).click()
                                  }}
                                  onClick={async () => {
                                    playWizardStepChime()
                                    setSelectedCategory(category)
                                    setValue('category_id', category.id, { shouldValidate: true })
                                    const isValid = await trigger('category_id')
                                    if (isValid) {
                                      setStep(5)
                                    }
                                  }}
                                  className={clsx(
                                    'card card-body mb-0 text-center',
                                    styles.wizardPickCard,
                                    styles.wizardPickTile,
                                    styles.wizardPickCardComfortable,
                                    styles.wizardPickCardGlass,
                                    pickWizardGlassTintClass(category.id),
                                    selectedCategory?.id === category.id && styles.wizardPickCardActive,
                                  )}
                                >
                                  {category.icon ? (
                                    <span className={styles.wizardPickIconWrap}>
                                      <Image
                                        className={clsx('d-block', styles.wizardPickThumb)}
                                        src={category.icon}
                                        alt={category.name}
                                        width={40}
                                        height={40}
                                        unoptimized
                                      />
                                    </span>
                                  ) : null}
                                  <h6 className="mb-0">{category.name}</h6>
                                </div>
                              </motion.div>
                            ))}
                          </div>
                        </>
                      )}
                      <div className={styles.wizardNavRow}>
                        <button
                          type="button"
                          className={styles.wizardBtnSecondary}
                          onClick={() => {
                            playWizardStepChime()
                            setSelectedCategory(null)
                            setValue('category_id', undefined)
                            setStep(step - 1)
                          }}
                        >
                          <span className={styles.wizardBtnInner}>
                            {navPrevIcon}
                            {wizardNav.prev}
                          </span>
                        </button>
                        {(selectedCategory || isEdit) && (
                          <button
                            type="button"
                            className={styles.wizardBtnPrimary}
                            onClick={async () => {
                              playWizardStepChime()
                              if (isEdit) {
                                setStep(5)
                                return
                              }
                              const isValid = await trigger('category_id')
                              if (isValid) setStep(5)
                            }}
                          >
                            <span className={styles.wizardBtnInner}>
                              {wizardNav.next}
                              {navNextIcon}
                            </span>
                          </button>
                        )}
            </div>
          </Col>
        </Row>
    </motion.div>
              )
            }
            {
              step === 6 && (
    <motion.div key="w-6" className={styles.wizardStepSurface} {...wizardStepMotion(reduceMotion)}>
                  <Row className="position-relative">
                    <Col xl={12} lg={11} className="mx-auto">
                      {selectedSection && selectedCategory && (
                        <div className="mt-2">
                          <section className={styles.wizardSection}>
                            <h3 className={styles.wizardSectionTitle}>الموقع والسعر</h3>
                            <p className={styles.wizardSectionHint}>
                              آخر خطوة قبل النشر: حدّد المدينة والسعر بما يتوافق مع سوقك.
                            </p>
                          </section>

                          <div className={clsx(styles.wizardSummaryBanner, 'mb-4')}>
                            <p className={styles.wizardSummaryMeta}>
                              {selectedSection.name}
                              <span className="mx-2">·</span>
                              {selectedCategory.name}
                            </p>
                          </div>

                          <form onSubmit={handleSubmit(onSubmit)}>
                            {/* حقل اختيار المدينة */}
                            <div className={styles.wizardFieldGroup}>
                              <label className={styles.wizardLabel}>
                                المدينة
                                <span className={styles.wizardRequired}>*</span>
                              </label>
                              {loadingCities ? (
                                <div className="text-center py-3">
                                  <div className="spinner-border spinner-border-sm" role="status">
                                    <span className="visually-hidden">جاري التحميل...</span>
                                  </div>
                                  <span className="ms-2">جاري تحميل المدن...</span>
                                </div>
                              ) : cities && Array.isArray(cities) && cities.length > 0 ? (
                                <>
                                  <Select
                                    options={cities.map((city) => ({
                                      value: city.id.toString(),
                                      label: city.name,
                                    }))}
                                    value={
                                      formValues.city
                                        ? {
                                          value: formValues.city,
                                          label: cities.find((c) => c.id.toString() === formValues.city)?.name || '',
                                        }
                                        : null
                                    }
                                    onChange={(selectedOption) => {
                                      const cityValue = selectedOption?.value || null
                                      handleFieldChange('city', cityValue, '', false)
                                      setValue('city', cityValue, { shouldValidate: true })
                                    }}
                                    isSearchable={true}
                                    isClearable={true}
                                    placeholder="اختر المدينة"
                                    noOptionsMessage={() => 'لا توجد مدن متاحة'}
                                    className="react-select-container"
                                    classNamePrefix="react-select"
                                    styles={buildWizardSelectStyles(!!errors.city) as any}
                                  />
                                  {errors.city && (
                                    <div className="text-danger small mt-1">{errors.city.message as string}</div>
                                  )}
                                </>
                              ) : selectedCountry ? (
                                <div className="alert alert-info">
                                  لا توجد مدن متاحة لهذه الدولة
                                </div>
                              ) : (
                                <div className="alert alert-warning">
                                  يرجى تحديد الدولة أولاً
                                </div>
                              )}
                            </div>

                            {/* حقل السعر */}
                            <div className={styles.wizardFieldGroup}>
                              <label className={styles.wizardLabel}>
                                السعر
                                <span className={styles.wizardLabelOptional}> (اختياري)</span>
                              </label>
                              <div className={styles.wizardInputGroup}>
                                <input
                                  type="number"
                                  className={clsx(styles.wizardInput, errors.price && 'is-invalid')}
                                  placeholder="أدخل السعر"
                                  value={formValues.price || ''}
                                  onChange={(e) => {
                                    const priceValue = e.target.value
                                    handleFieldChange('price', priceValue, '', false)
                                    setValue('price', priceValue ? parseFloat(priceValue) : undefined, { shouldValidate: true })
                                  }}
                                  min="0"
                                  step="0.01"
                                />
                                <span className={styles.wizardInputSuffix}>ر.س</span>
                              </div>
                              {errors.price && (
                                <div className="text-danger small mt-1">{errors.price.message as string}</div>
                              )}
                              <small className="form-text text-muted">
                                اتركه فارغاً إن لم يكن السعر مناسباً لإعلانك؛ يمكنك تحديثه لاحقاً.
                              </small>
                            </div>

                            {/* عرض أخطاء الإرسال */}
                            {submitError && (
                              <div className="alert alert-danger">
                                {submitError}
        </div>
                            )}

                            {/* أزرار التنقل */}
                            <div className={clsx(styles.wizardNavRow, styles.wizardNavRowTight)}>
                              <button
                                type="button"
                                className={styles.wizardBtnSecondary}
                                onClick={() => {
                                  playWizardStepChime()
                                  // إعادة تعيين subStep إلى آخر substep
                                  const maxSubStep = Math.ceil(fields.length / FIELDS_PER_SUBSTEP)
                                  setSubStep(maxSubStep > 0 ? maxSubStep : 1)
                                  setStep(5)
                                }}
                              >
                                <span className={styles.wizardBtnInner}>
                                  {navPrevIcon}
                                  {wizardNav.prev}
                                </span>
                              </button>

                              <button
                                type="button"
                                className={styles.wizardBtnPrimary}
                                disabled={isSubmitting}
                                onClick={async () => {
                                  playWizardStepChime()
                                  const cityValid = await trigger('city')
                                  await trigger('price')
                                  if (cityValid) {
                                    handleSubmit(onSubmit)()
                                  } else {
                                    setSubmitError('يرجى تصحيح الأخطاء قبل الإرسال')
                                  }
                                }}
                              >
                                {isSubmitting ? (
                                  <span className={styles.wizardBtnInner}>
                                    <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true" />
                                    {wizardNav.submitting}
                                  </span>
                                ) : (
                                  <span className={styles.wizardBtnInner}>
                                    {wizardNav.submit}
                                    {navSubmitIcon}
                                  </span>
                                )}
                              </button>
            </div>
            </form>
          </div>
                      )}
                    </Col>
                  </Row>
    </motion.div>
              )
            }
            {
              step === 5 && (
    <motion.div
      key={`w-5-${subStep}`}
      className={styles.wizardStepSurface}
      {...wizardStepMotion(reduceMotion)}
    >
                  <Row className="position-relative">
                    <Col xl={12} lg={11} className="mx-auto">
                      {selectedSection && selectedCategory && (
                        <div className="mt-2">
                          <section className={styles.wizardSection}>
                            <h3 className={styles.wizardSectionTitle}>
                              {t('createPost.wizard.dynamicFields', locale as any)}
                            </h3>
                            <p className={styles.wizardSectionHint}>
                              أكمل الحقول التالية حسب نوع إعلانك. يمكن تقسيمها على أكثر من صفحة إذا كانت كثيرة.
                            </p>
                          </section>
                          <div className={clsx(styles.wizardSummaryBanner, 'mb-4')}>
                            <p className={styles.wizardSummaryMeta}>
                              {selectedSection.name}
                              <span className="mx-2">·</span>
                              {selectedCategory.name}
                            </p>
                          </div>

                          {loadingFields ? (
                            <div className="text-center py-4">جاري تحميل الحقول...</div>
                          ) : (
                            <>
                              <form>
                                {fields
                                  .sort((a, b) => a.sort - b.sort)
                                  .slice((subStep - 1) * FIELDS_PER_SUBSTEP, subStep * FIELDS_PER_SUBSTEP)
                                  .map((field) => renderField(field))}

                                {/* عرض أخطاء الـ validation */}
                                {Object.keys(errors).length > 0 && (
                                  <div className="alert alert-danger mt-3">
                                    <strong>يرجى تصحيح الأخطاء التالية:</strong>
                                    <ul className="mb-0 mt-2">
                                      {Object.entries(errors).map(([key, error]) => (
                                        <li key={key}>
                                          {error?.message as string}
                    </li>
                  ))}
                </ul>
              </div>
                                )}

                                {/* أزرار التنقل */}
                                <div className={styles.wizardNavRow}>
                                  <button
                                    type="button"
                                    className={styles.wizardBtnSecondary}
                                    onClick={() => {
                                      playWizardStepChime()
                                      if (subStep > 1) {
                                        // إذا لم تكن substep الأولى، ارجع substep
                                        setSubStep(subStep - 1)
                                      } else {
                                        // إذا كانت substep الأولى، ارجع main step
                                        setSelectedCategory(null)
                                        setFields([])
                                        setFormValues({})
                                        setNestedFields({})
                                        setSubStep(1)
                                        setStep(step - 1)
                                      }
                                    }}
                                  >
                                    <span className={styles.wizardBtnInner}>
                                      {navPrevIcon}
                                      {wizardNav.prev}
                                    </span>
                                  </button>

                                  {subStep < Math.ceil(fields.length / FIELDS_PER_SUBSTEP) ? (
                                    <button
                                      type="button"
                                      className={styles.wizardBtnPrimary}
                                      onClick={async () => {
                                        playWizardStepChime()
                                        // التحقق من الحقول في الـ sub-step الحالي فقط
                                        const currentFields = fields
                                          .sort((a, b) => a.sort - b.sort)
                                          .slice((subStep - 1) * FIELDS_PER_SUBSTEP, subStep * FIELDS_PER_SUBSTEP)

                                        // جمع جميع مفاتيح الحقول (بما فيها المتداخلة)
                                        const fieldKeys: string[] = []
                                        currentFields.forEach((field) => {
                                          fieldKeys.push(field.key_name)
                                          // إضافة الحقول المتداخلة لهذا الحقل
                                          Object.keys(nestedFields).forEach((nestedKey) => {
                                            if (nestedKey.startsWith(`${field.key_name}_`)) {
                                              const subFields = nestedFields[nestedKey]
                                              subFields.forEach((subField) => {
                                                if (!fieldKeys.includes(subField.key_name)) {
                                                  fieldKeys.push(subField.key_name)
                                                }
                                              })
                                            }
                                          })
                                        })

                                        // التحقق فقط من الحقول الحالية (بدون city و price)
                                        const fieldsToValidate = fieldKeys.filter((key) => key !== 'city' && key !== 'price')
                                        const isValid = fieldsToValidate.length === 0 || await trigger(fieldsToValidate)

                                        if (isValid) {
                                          setSubStep(subStep + 1)
                                        }
                                      }}
                                    >
                                      <span className={styles.wizardBtnInner}>
                                        {wizardNav.next}
                                        {navNextIcon}
                                      </span>
                                    </button>
                                  ) : (
                                    <button
                                      type="button"
                                      className={styles.wizardBtnPrimary}
                                      onClick={async () => {
                                        playWizardStepChime()
                                        // التحقق من جميع الحقول الديناميكية فقط (بدون city و price)
                                        const allFieldKeys = fields.map((f) => f.key_name)
                                        // إضافة الحقول المتداخلة
                                        Object.values(nestedFields).flat().forEach((subField) => {
                                          if (!allFieldKeys.includes(subField.key_name)) {
                                            allFieldKeys.push(subField.key_name)
                                          }
                                        })

                                        const fieldsToValidate = allFieldKeys.filter((key) => key !== 'city' && key !== 'price')
                                        const isValid = fieldsToValidate.length === 0 || await trigger(fieldsToValidate)

                                        if (isValid) {
                                          setStep(6)
                                        }
                                      }}
                                    >
                                      <span className={styles.wizardBtnInner}>
                                        {wizardNav.next}
                                        {navNextIcon}
                                      </span>
                                    </button>
                                  )}
            </div>
            </form>
                            </>
                          )}
          </div>
                      )}
          </Col>
                  </Row>
    </motion.div>
              )
            }
          </AnimatePresence>
          </form>
            </div>

        </div>

        </div>
            </div>
          )}
        </ComposerCardAtmosphere>

      </Card>

      <PostSuccessCelebrationModal
        show={postSuccessOpen}
        onHide={() => setPostSuccessOpen(false)}
        locale={locale}
        postId={postSuccessMeta?.id}
        postTitle={postSuccessMeta?.title}
        variant={postSuccessMeta?.variant ?? 'published'}
      />
    </>
  )
}
export default CreatePostCard
