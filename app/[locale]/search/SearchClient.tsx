'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { motion, AnimatePresence, useReducedMotion } from 'motion/react'
import {
  BsSearch,
  BsSliders,
  BsXLg,
  BsImages,
  BsFilterCircle,
  BsSortDown,
} from 'react-icons/bs'

import type { SupportedLocale } from '@/lib/localization'
import type { Section } from '@/lib/api/sections'
import { fetchCategoriesBySectionId, type Category } from '@/lib/api/categories'
import { fetchPosts, type PostRecord } from '@/lib/api/posts'
import PostCard from '@/components/cards/PostCard'
import styles from './searchPage.module.css'

type SortKey = 'newest' | 'oldest' | 'price_asc' | 'price_desc'
type HasImages = 'all' | 'with' | 'without'

type Copy = {
  heroTitle: string
  heroSubtitle: string
  placeholder: string
  filters: string
  clearAll: string
  section: string
  category: string
  price: string
  from: string
  to: string
  images: string
  imagesAll: string
  imagesWith: string
  imagesWithout: string
  sort: string
  sortNewest: string
  sortOldest: string
  sortPriceAsc: string
  sortPriceDesc: string
  apply: string
  reset: string
  emptyTitle: string
  emptyBody: string
  loadMore: string
  loading: string
  resultsCountOne: string
  resultsCountMany: (n: number) => string
  resultsHeading: string
  searchingFor: (q: string) => string
  allSections: string
  allCategories: string
  searchBtn: string
  kicker: string
}

const COPY: Record<SupportedLocale, Copy> = {
  ar: {
    heroTitle: 'ابحث في المنشورات',
    heroSubtitle: 'استخدم الكلمات المفتاحية والفلاتر للوصول لما تريد بسرعة.',
    placeholder: 'ابحث عن منتج، عقار، سيارة، أو وظيفة...',
    filters: 'الفلاتر',
    clearAll: 'مسح الكل',
    section: 'القسم',
    category: 'الفئة',
    price: 'نطاق السعر',
    from: 'من',
    to: 'إلى',
    images: 'المنشورات بصور',
    imagesAll: 'الكل',
    imagesWith: 'بصور',
    imagesWithout: 'بدون صور',
    sort: 'الترتيب',
    sortNewest: 'الأحدث',
    sortOldest: 'الأقدم',
    sortPriceAsc: 'السعر: من الأقل',
    sortPriceDesc: 'السعر: من الأعلى',
    apply: 'تطبيق الفلاتر',
    reset: 'إعادة تعيين',
    emptyTitle: 'لا توجد نتائج مطابقة',
    emptyBody: 'جرّب تعديل الكلمات المفتاحية أو تخفيف الفلاتر.',
    loadMore: 'عرض المزيد',
    loading: 'جاري التحميل...',
    resultsCountOne: 'نتيجة واحدة',
    resultsCountMany: (n: number) => `${n} نتيجة`,
    resultsHeading: 'نتائج البحث',
    searchingFor: (q: string) => `نتائج البحث عن «${q}»`,
    allSections: 'كل الأقسام',
    allCategories: 'كل الفئات',
    searchBtn: 'بحث',
    kicker: 'اكتشف',
  },
  en: {
    heroTitle: 'Search listings',
    heroSubtitle: 'Use keywords and filters to find what you want fast.',
    placeholder: 'Search for a product, car, property, or job...',
    filters: 'Filters',
    clearAll: 'Clear all',
    section: 'Section',
    category: 'Category',
    price: 'Price range',
    from: 'From',
    to: 'To',
    images: 'Images',
    imagesAll: 'All',
    imagesWith: 'With images',
    imagesWithout: 'Without images',
    sort: 'Sort by',
    sortNewest: 'Newest',
    sortOldest: 'Oldest',
    sortPriceAsc: 'Price: low to high',
    sortPriceDesc: 'Price: high to low',
    apply: 'Apply filters',
    reset: 'Reset',
    emptyTitle: 'No results match your search',
    emptyBody: 'Try editing your keywords or loosening the filters.',
    loadMore: 'Load more',
    loading: 'Loading...',
    resultsCountOne: '1 result',
    resultsCountMany: (n: number) => `${n} results`,
    resultsHeading: 'Search results',
    searchingFor: (q: string) => `Search results for “${q}”`,
    allSections: 'All sections',
    allCategories: 'All categories',
    searchBtn: 'Search',
    kicker: 'Discover',
  },
}

type Props = {
  locale: SupportedLocale
  sections: Section[]
}

const parseNumber = (value: string | null | undefined): number | undefined => {
  if (!value) return undefined
  const n = Number(value)
  return Number.isFinite(n) && n >= 0 ? n : undefined
}

const toHasImages = (value: string | null | undefined): HasImages => {
  if (value === '1' || value === 'true' || value === 'with') return 'with'
  if (value === '0' || value === 'false' || value === 'without') return 'without'
  return 'all'
}

const toSort = (value: string | null | undefined): SortKey => {
  if (value === 'oldest' || value === 'price_asc' || value === 'price_desc') return value
  return 'newest'
}

const SearchClient = ({ locale, sections }: Props) => {
  const copy = COPY[locale] ?? COPY.ar
  const reduceMotion = useReducedMotion()
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  /* ------------------------------------------------------------------
     Initialize state from URL
     ------------------------------------------------------------------ */
  const initial = useMemo(() => {
    return {
      q: searchParams.get('q') ?? '',
      sectionSlug: searchParams.get('section_slug') ?? '',
      categorySlug: searchParams.get('category_slug') ?? '',
      priceMin: parseNumber(searchParams.get('price_min')),
      priceMax: parseNumber(searchParams.get('price_max')),
      hasImages: toHasImages(searchParams.get('has_images')),
      sort: toSort(searchParams.get('sort')),
    }
  }, [searchParams])

  /* Form state (what the user is editing) */
  const [queryInput, setQueryInput] = useState(initial.q)
  const [sectionSlug, setSectionSlug] = useState(initial.sectionSlug)
  const [categorySlug, setCategorySlug] = useState(initial.categorySlug)
  const [priceMin, setPriceMin] = useState<string>(initial.priceMin != null ? String(initial.priceMin) : '')
  const [priceMax, setPriceMax] = useState<string>(initial.priceMax != null ? String(initial.priceMax) : '')
  const [hasImages, setHasImages] = useState<HasImages>(initial.hasImages)
  const [sort, setSort] = useState<SortKey>(initial.sort)

  const [filtersOpen, setFiltersOpen] = useState(false)

  /* Categories for the currently selected section */
  const [categories, setCategories] = useState<Category[]>([])
  const [loadingCategories, setLoadingCategories] = useState(false)

  /* Results */
  const [posts, setPosts] = useState<PostRecord[]>([])
  const [page, setPage] = useState(1)
  const [totalResults, setTotalResults] = useState<number | null>(null)
  const [nextPageUrl, setNextPageUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [loadingMore, setLoadingMore] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)
  const requestIdRef = useRef(0)

  /* ------------------------------------------------------------------
     Load categories when the selected section changes
     ------------------------------------------------------------------ */
  useEffect(() => {
    if (!sectionSlug) {
      setCategories([])
      return
    }
    const section = sections.find((s) => s.slug === sectionSlug)
    if (!section) {
      setCategories([])
      return
    }
    let cancelled = false
    setLoadingCategories(true)
    fetchCategoriesBySectionId(section.id, locale)
      .then((cats) => {
        if (!cancelled) setCategories(cats)
      })
      .catch(() => {
        if (!cancelled) setCategories([])
      })
      .finally(() => {
        if (!cancelled) setLoadingCategories(false)
      })
    return () => {
      cancelled = true
    }
  }, [sectionSlug, sections, locale])

  /* ------------------------------------------------------------------
     Build & sync URL (shareable search)
     ------------------------------------------------------------------ */
  const buildSearchParams = useCallback(
    (overrides?: Partial<{
      q: string
      sectionSlug: string
      categorySlug: string
      priceMin: string
      priceMax: string
      hasImages: HasImages
      sort: SortKey
    }>) => {
      const values = {
        q: overrides?.q ?? queryInput,
        sectionSlug: overrides?.sectionSlug ?? sectionSlug,
        categorySlug: overrides?.categorySlug ?? categorySlug,
        priceMin: overrides?.priceMin ?? priceMin,
        priceMax: overrides?.priceMax ?? priceMax,
        hasImages: overrides?.hasImages ?? hasImages,
        sort: overrides?.sort ?? sort,
      }
      const sp = new URLSearchParams()
      if (values.q && values.q.trim() !== '') sp.set('q', values.q.trim())
      if (values.sectionSlug) sp.set('section_slug', values.sectionSlug)
      if (values.categorySlug) sp.set('category_slug', values.categorySlug)
      if (values.priceMin && values.priceMin.trim() !== '') sp.set('price_min', values.priceMin.trim())
      if (values.priceMax && values.priceMax.trim() !== '') sp.set('price_max', values.priceMax.trim())
      if (values.hasImages === 'with') sp.set('has_images', '1')
      if (values.hasImages === 'without') sp.set('has_images', '0')
      if (values.sort && values.sort !== 'newest') sp.set('sort', values.sort)
      return sp
    },
    [queryInput, sectionSlug, categorySlug, priceMin, priceMax, hasImages, sort],
  )

  const syncUrl = useCallback(
    (sp: URLSearchParams) => {
      const qs = sp.toString()
      const nextUrl = qs ? `${pathname}?${qs}` : pathname
      router.replace(nextUrl, { scroll: false })
    },
    [pathname, router],
  )

  /* ------------------------------------------------------------------
     Actual search request (fires on URL change)
     ------------------------------------------------------------------ */
  const runSearch = useCallback(
    async (opts: { append?: boolean; targetPage?: number } = {}) => {
      const targetPage = opts.targetPage ?? 1
      const append = Boolean(opts.append)
      const priceMinNum = parseNumber(priceMin)
      const priceMaxNum = parseNumber(priceMax)

      const requestId = ++requestIdRef.current

      if (append) {
        setLoadingMore(true)
      } else {
        setLoading(true)
        setPosts([])
        setTotalResults(null)
      }
      setHasSearched(true)

      try {
        const res = await fetchPosts({
          land: locale,
          q: queryInput.trim() || undefined,
          sectionSlug: sectionSlug || undefined,
          categorySlug: categorySlug || undefined,
          priceMin: priceMinNum,
          priceMax: priceMaxNum,
          hasImages: hasImages === 'with' ? true : hasImages === 'without' ? false : undefined,
          sort,
          page: targetPage,
        })

        if (requestId !== requestIdRef.current) return

        const data = Array.isArray(res?.data) ? (res.data as PostRecord[]) : []
        setPosts((prev) => (append ? [...prev, ...data] : data))
        const total = (res as any)?.total
        setTotalResults(typeof total === 'number' ? total : null)
        setNextPageUrl((res as any)?.next_page_url ?? null)
        setPage(targetPage)
      } catch (error) {
        if (requestId !== requestIdRef.current) return
        console.error('Search failed:', error)
        if (!append) setPosts([])
        setNextPageUrl(null)
      } finally {
        if (requestId !== requestIdRef.current) return
        setLoading(false)
        setLoadingMore(false)
      }
    },
    [locale, queryInput, sectionSlug, categorySlug, priceMin, priceMax, hasImages, sort],
  )

  /* Re-run search whenever URL query changes (covers initial mount + navigation) */
  const urlKey = searchParams.toString()
  useEffect(() => {
    runSearch({ append: false, targetPage: 1 })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [urlKey])

  /* ------------------------------------------------------------------
     Handlers
     ------------------------------------------------------------------ */
  const onSubmitSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const sp = buildSearchParams()
    syncUrl(sp)
  }

  const onApplyFilters = () => {
    const sp = buildSearchParams()
    syncUrl(sp)
    setFiltersOpen(false)
  }

  const onResetAll = () => {
    setQueryInput('')
    setSectionSlug('')
    setCategorySlug('')
    setPriceMin('')
    setPriceMax('')
    setHasImages('all')
    setSort('newest')
    syncUrl(new URLSearchParams())
  }

  const onSelectSection = (slug: string) => {
    setSectionSlug(slug)
    setCategorySlug('')
  }

  const onSortChange = (next: SortKey) => {
    setSort(next)
    const sp = buildSearchParams({ sort: next })
    syncUrl(sp)
  }

  const onClearQuick = (which: 'q' | 'section' | 'category' | 'price' | 'images') => {
    switch (which) {
      case 'q':
        setQueryInput('')
        syncUrl(buildSearchParams({ q: '' }))
        break
      case 'section':
        setSectionSlug('')
        setCategorySlug('')
        syncUrl(buildSearchParams({ sectionSlug: '', categorySlug: '' }))
        break
      case 'category':
        setCategorySlug('')
        syncUrl(buildSearchParams({ categorySlug: '' }))
        break
      case 'price':
        setPriceMin('')
        setPriceMax('')
        syncUrl(buildSearchParams({ priceMin: '', priceMax: '' }))
        break
      case 'images':
        setHasImages('all')
        syncUrl(buildSearchParams({ hasImages: 'all' }))
        break
    }
  }

  const onLoadMore = () => {
    if (!nextPageUrl || loadingMore) return
    runSearch({ append: true, targetPage: page + 1 })
  }

  const handlePostDelete = (postId: number | string) => {
    setPosts((prev) => prev.filter((p) => String(p?.id) !== String(postId)))
  }

  /* ------------------------------------------------------------------
     Derived UI
     ------------------------------------------------------------------ */
  const activeFiltersCount = useMemo(() => {
    let n = 0
    if (sectionSlug) n += 1
    if (categorySlug) n += 1
    if (priceMin || priceMax) n += 1
    if (hasImages !== 'all') n += 1
    return n
  }, [sectionSlug, categorySlug, priceMin, priceMax, hasImages])

  const sectionLabel = useMemo(
    () => sections.find((s) => s.slug === sectionSlug)?.name ?? '',
    [sections, sectionSlug],
  )
  const categoryLabel = useMemo(
    () => categories.find((c) => c.slug === categorySlug)?.name ?? '',
    [categories, categorySlug],
  )

  const searchedQuery = (searchParams.get('q') ?? '').trim()
  const resultsCountLabel =
    totalResults != null
      ? totalResults === 1
        ? copy.resultsCountOne
        : copy.resultsCountMany(totalResults)
      : posts.length > 0
        ? copy.resultsCountMany(posts.length)
        : ''

  const showResultsSkeleton =
    posts.length === 0 && (loading || !hasSearched)

  const heroMotion = reduceMotion
    ? { initial: false, animate: { opacity: 1, y: 0 } }
    : { initial: { opacity: 0, y: 18 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] as const } }

  const resultItemMotion = (idx: number) =>
    reduceMotion
      ? {}
      : {
          initial: { opacity: 0, y: 12 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.25, delay: Math.min(idx, 6) * 0.03 },
        }

  /* ------------------------------------------------------------------
     Render
     ------------------------------------------------------------------ */
  return (
    <div className="col-md-8 col-lg-6">
      <div className={styles.wrapper}>
        {/* ---------- Hero / Search bar ---------- */}
        <motion.section className={styles.heroCard} {...heroMotion}>
          <div className={styles.heroMesh} aria-hidden />
          <div className={`${styles.heroOrb} ${styles.heroOrbA}`} aria-hidden />
          <div className={`${styles.heroOrb} ${styles.heroOrbB}`} aria-hidden />
          <div className={styles.heroTopBar} aria-hidden />

          <div className={styles.heroInner}>
          <div className={styles.heroHead}>
            <motion.div
              className={styles.heroIconWrap}
              initial={reduceMotion ? false : { rotate: -8, scale: 0.92 }}
              animate={{ rotate: 0, scale: 1 }}
              transition={{ type: 'spring', stiffness: 220, damping: 14 }}
            >
              <span className={styles.heroIconRing} aria-hidden />
              <span className={styles.heroIcon}>
                <BsSearch />
              </span>
            </motion.div>
            <div>
              <p className={styles.heroKicker}>
                <span className={styles.heroKickerDot} aria-hidden />
                {copy.kicker}
              </p>
              <h1 className={styles.heroTitle}>{copy.heroTitle}</h1>
              <p className={styles.heroSubtitle}>
                {searchedQuery ? copy.searchingFor(searchedQuery) : copy.heroSubtitle}
              </p>
            </div>
          </div>

          <form className={styles.searchRow} role="search" onSubmit={onSubmitSearch}>
            <div className={styles.searchInputWrap}>
              <BsSearch className={styles.searchIcon} aria-hidden />
              <input
                type="search"
                value={queryInput}
                onChange={(e) => setQueryInput(e.target.value)}
                placeholder={copy.placeholder}
                className={styles.searchInput}
                aria-label={copy.heroTitle}
                autoFocus
              />
              {queryInput && (
                <button
                  type="button"
                  className={styles.clearBtn}
                  onClick={() => setQueryInput('')}
                  aria-label={copy.clearAll}
                >
                  <BsXLg size={12} />
                </button>
              )}
            </div>

            <motion.button
              type="button"
              className={`${styles.filtersToggle} ${filtersOpen ? styles.filtersToggleActive : ''}`}
              onClick={() => setFiltersOpen((v) => !v)}
              aria-expanded={filtersOpen}
              whileTap={reduceMotion ? undefined : { scale: 0.97 }}
            >
              <BsSliders />
              <span>{copy.filters}</span>
              {activeFiltersCount > 0 && (
                <span className={styles.filterBadge}>{activeFiltersCount}</span>
              )}
            </motion.button>

            <motion.button
              type="submit"
              className={styles.searchSubmitBtn}
              whileHover={reduceMotion ? undefined : { y: -2 }}
              whileTap={reduceMotion ? undefined : { scale: 0.98 }}
            >
              <BsSearch aria-hidden />
              <span>{copy.searchBtn}</span>
            </motion.button>
          </form>

          {/* Active filter pills */}
          {(searchedQuery || activeFiltersCount > 0) && (
            <motion.div
              className={styles.activePills}
              initial={reduceMotion ? false : { opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.22 }}
            >
              {searchedQuery && (
                <span className={styles.pill}>
                  «{searchedQuery}»
                  <button onClick={() => onClearQuick('q')} aria-label={copy.clearAll}>
                    <BsXLg size={10} />
                  </button>
                </span>
              )}
              {sectionSlug && (
                <span className={styles.pill}>
                  {sectionLabel || sectionSlug}
                  <button onClick={() => onClearQuick('section')} aria-label={copy.clearAll}>
                    <BsXLg size={10} />
                  </button>
                </span>
              )}
              {categorySlug && (
                <span className={styles.pill}>
                  {categoryLabel || categorySlug}
                  <button onClick={() => onClearQuick('category')} aria-label={copy.clearAll}>
                    <BsXLg size={10} />
                  </button>
                </span>
              )}
              {(priceMin || priceMax) && (
                <span className={styles.pill}>
                  {copy.price}: {priceMin || '0'} – {priceMax || '∞'}
                  <button onClick={() => onClearQuick('price')} aria-label={copy.clearAll}>
                    <BsXLg size={10} />
                  </button>
                </span>
              )}
              {hasImages !== 'all' && (
                <span className={styles.pill}>
                  <BsImages /> {hasImages === 'with' ? copy.imagesWith : copy.imagesWithout}
                  <button onClick={() => onClearQuick('images')} aria-label={copy.clearAll}>
                    <BsXLg size={10} />
                  </button>
                </span>
              )}
              <button className={styles.clearAll} onClick={onResetAll} type="button">
                {copy.clearAll}
              </button>
            </motion.div>
          )}

          {/* ---------- Filters panel ---------- */}
          <AnimatePresence initial={false}>
            {filtersOpen && (
              <motion.div
                key="filters-panel"
                className={styles.filtersPanel}
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
              >
                <div className={styles.filtersInner}>
                  {/* Section */}
                  <div className={styles.filterGroup}>
                    <label className={styles.filterLabel}>{copy.section}</label>
                    <select
                      className={styles.select}
                      value={sectionSlug}
                      onChange={(e) => onSelectSection(e.target.value)}
                    >
                      <option value="">{copy.allSections}</option>
                      {sections.map((s) => (
                        <option key={s.id} value={s.slug}>
                          {s.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Category */}
                  <div className={styles.filterGroup}>
                    <label className={styles.filterLabel}>{copy.category}</label>
                    <select
                      className={styles.select}
                      value={categorySlug}
                      onChange={(e) => setCategorySlug(e.target.value)}
                      disabled={!sectionSlug || loadingCategories}
                    >
                      <option value="">{copy.allCategories}</option>
                      {categories.map((c) => (
                        <option key={c.id} value={c.slug}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Price range */}
                  <div className={`${styles.filterGroup} ${styles.filterGroupFull}`}>
                    <label className={styles.filterLabel}>{copy.price}</label>
                    <div className={styles.priceRow}>
                      <input
                        type="number"
                        inputMode="decimal"
                        className={styles.priceInput}
                        placeholder={copy.from}
                        value={priceMin}
                        min={0}
                        onChange={(e) => setPriceMin(e.target.value)}
                      />
                      <input
                        type="number"
                        inputMode="decimal"
                        className={styles.priceInput}
                        placeholder={copy.to}
                        value={priceMax}
                        min={0}
                        onChange={(e) => setPriceMax(e.target.value)}
                      />
                    </div>
                  </div>

                  {/* Has images */}
                  <div className={`${styles.filterGroup} ${styles.filterGroupFull}`}>
                    <label className={styles.filterLabel}>{copy.images}</label>
                    <div className={styles.chipsRow}>
                      {(
                        [
                          { key: 'all', label: copy.imagesAll },
                          { key: 'with', label: copy.imagesWith },
                          { key: 'without', label: copy.imagesWithout },
                        ] as Array<{ key: HasImages; label: string }>
                      ).map((item) => (
                        <button
                          type="button"
                          key={item.key}
                          className={`${styles.chip} ${hasImages === item.key ? styles.chipActive : ''}`}
                          onClick={() => setHasImages(item.key)}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className={styles.filtersActions}>
                    <button type="button" className={styles.ghostBtn} onClick={onResetAll}>
                      {copy.reset}
                    </button>
                    <button type="button" className={styles.applyBtn} onClick={onApplyFilters}>
                      {copy.apply}
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          </div>
        </motion.section>

        {/* ---------- Summary + Sort ---------- */}
        <motion.div
          className={styles.summaryCard}
          initial={reduceMotion ? false : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.28, delay: 0.05 }}
        >
          <BsFilterCircle className={styles.summaryIcon} aria-hidden />
          <span>
            {showResultsSkeleton ? (
              <span className={styles.summaryLoading} aria-busy="true">
                {copy.loading}
              </span>
            ) : (
              <span className={styles.summaryCount}>{resultsCountLabel}</span>
            )}
          </span>

          <div className={styles.sortSelectWrap}>
            <BsSortDown aria-hidden />
            <label className="visually-hidden" htmlFor="search-sort-select">
              {copy.sort}
            </label>
            <select
              id="search-sort-select"
              className={styles.select}
              value={sort}
              onChange={(e) => onSortChange(e.target.value as SortKey)}
            >
              <option value="newest">{copy.sortNewest}</option>
              <option value="oldest">{copy.sortOldest}</option>
              <option value="price_asc">{copy.sortPriceAsc}</option>
              <option value="price_desc">{copy.sortPriceDesc}</option>
            </select>
          </div>
        </motion.div>

        {/* ---------- Results ---------- */}
        <section className={styles.resultsStack} aria-labelledby="search-results-heading">
          <h2 id="search-results-heading" className="visually-hidden">
            {searchedQuery ? copy.searchingFor(searchedQuery) : copy.resultsHeading}
          </h2>
          {showResultsSkeleton ? (
            <>
              {Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={`skeleton-${i}`}
                  className={styles.skeletonCard}
                  aria-hidden="true"
                >
                  <div className={styles.skeletonRow} style={{ width: '45%' }} />
                  <div className={styles.skeletonRow} style={{ width: '80%' }} />
                  <div className={styles.skeletonBlock} />
                  <div className={styles.skeletonRow} style={{ width: '60%' }} />
                </div>
              ))}
            </>
          ) : !loading && hasSearched && posts.length === 0 ? (
            <motion.div
              className={styles.emptyCard}
              initial={reduceMotion ? false : { opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
            >
              <div className={styles.emptyIconWrap}>
                <span className={styles.emptyIconRing} aria-hidden />
                <div className={styles.emptyIcon}>
                  <BsSearch />
                </div>
              </div>
              <div className={styles.emptyTitle}>{copy.emptyTitle}</div>
              <p className={styles.emptyHint}>{copy.emptyBody}</p>
            </motion.div>
          ) : (
            <AnimatePresence initial={false}>
              {posts.map((post, idx) => (
                <motion.div
                  key={post?.id ?? `post-${idx}`}
                  exit={reduceMotion ? undefined : { opacity: 0 }}
                  {...resultItemMotion(idx)}
                >
                  <PostCard post={post} onDelete={handlePostDelete} />
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </section>

        {nextPageUrl && !loading && (
          <motion.div
            className={styles.loadMoreWrap}
            initial={reduceMotion ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <motion.button
              className={styles.loadMoreBtn}
              onClick={onLoadMore}
              disabled={loadingMore}
              whileHover={reduceMotion || loadingMore ? undefined : { y: -2 }}
              whileTap={reduceMotion || loadingMore ? undefined : { scale: 0.98 }}
            >
              {loadingMore ? copy.loading : copy.loadMore}
            </motion.button>
          </motion.div>
        )}
      </div>
    </div>
  )
}

export default SearchClient
