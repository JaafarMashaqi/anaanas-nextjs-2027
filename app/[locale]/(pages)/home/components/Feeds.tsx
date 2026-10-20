import Image from 'next/image'
import { headers } from 'next/headers'
import type { ReactNode } from 'react'
import {
  Button,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  Dropdown,
  DropdownDivider,
  DropdownItem,
  DropdownMenu,
  DropdownToggle,
} from 'react-bootstrap'
import {
  BsBookmark,
  BsBookmarkCheck,
  BsChatFill,
  BsEnvelope,
  BsFlag,
  BsHeart,
  BsHeartFill,
  BsInfoCircle,
  BsLink,
  BsPencilSquare,
  BsPersonX,
  BsReplyFill,
  BsSendFill,
  BsShare,
  BsSlashCircle,
  BsThreeDots,
  BsXCircle,
} from 'react-icons/bs'
import People from './People'

import avatar4 from '@/assets/images/avatar/04.jpg'
import logo11 from '@/assets/images/logo/11.svg'
import logo12 from '@/assets/images/logo/12.svg'
import logo13 from '@/assets/images/logo/13.svg'
import postImg2 from '@/assets/images/post/3by2/02.jpg'
import postImg4 from '@/assets/images/post/3by2/03.jpg'
import PostsList from './PostsList'
import Link from 'next/link'
import LoadMoreButton from './LoadMoreButton'
import SuggestedStories from './SuggestedStories'
import { getCountryByCodeCached } from '@/lib/server/getCountryByCodeCached'
import { fetchPosts } from '@/lib/api/posts'
import PaginatedPosts from './PaginatedPosts'
import type { Metadata } from 'next'
import paginationStyles from './FeedsPagination.module.css'

const ActionMenu = ({ name }: { name?: string }) => {
  return (
    <Dropdown drop="start">
      <DropdownToggle as="a" className="text-secondary btn btn-secondary-soft-hover py-1 px-2 content-none" id="cardFeedAction">
        <BsThreeDots />
      </DropdownToggle>

      <DropdownMenu className="dropdown-menu-end" aria-labelledby="cardFeedAction">
        <li>
          <DropdownItem href="#">
            {' '}
            <BsBookmark size={22} className="fa-fw pe-2" />
            Save post
          </DropdownItem>
        </li>
        <li>
          <DropdownItem href="#">
            {' '}
            <BsPersonX size={22} className="fa-fw pe-2" />
            Unfollow {name}{' '}
          </DropdownItem>
        </li>
        <li>
          <DropdownItem href="#">
            {' '}
            <BsXCircle size={22} className="fa-fw pe-2" />
            Hide post
          </DropdownItem>
        </li>
        <li>
          <DropdownItem href="#">
            {' '}
            <BsSlashCircle size={22} className="fa-fw pe-2" />
            Block
          </DropdownItem>
        </li>
        <li>
          <DropdownDivider />
        </li>
        <li>
          <DropdownItem href="#">
            {' '}
            <BsFlag size={22} className="fa-fw pe-2" />
            Report post
          </DropdownItem>
        </li>
      </DropdownMenu>
    </Dropdown>
  )
}

const SponsoredCard = () => {
  return (
    <Card>
      <CardHeader>
        <div className="d-flex align-items-center justify-content-between">
          <div className="d-flex align-items-center">
            <div className="avatar me-2">
              <span role="button">
                {' '}
                <Image className="avatar-img rounded-circle" src={logo12} alt="image" />{' '}
              </span>
            </div>

            <div>
              <h6 className="card-title mb-0">
                <Link href="#"> Bootstrap: Front-end framework </Link>
              </h6>
              <Link href="#" className="mb-0 text-body">
                Sponsored{' '}
                <BsInfoCircle
                  className="ps-1"
                  data-bs-container="body"
                  data-bs-toggle="popover"
                  data-bs-placement="top"
                  data-bs-content="You're seeing this ad because your activity meets the intended audience of our site."
                />{' '}
              </Link>
            </div>
          </div>
          <ActionMenu />
        </div>
      </CardHeader>

      <CardBody>
        <p className="mb-0">Quickly design and customize responsive mobile-first sites with Bootstrap.</p>
      </CardBody>
      <Image src={postImg2} alt="post-image" />

      <CardFooter className="border-0 d-flex justify-content-between align-items-center">
        <p className="mb-0">Currently v5.1.3 </p>
        <Button variant="primary-soft" size="sm">
          {' '}
          Download now{' '}
        </Button>
      </CardFooter>
    </Card>
  )
}

const Post2 = () => {
  return (
    <Card>
      <CardHeader className="border-0 pb-0">
        <div className="d-flex align-items-center justify-content-between">
          <div className="d-flex align-items-center">
            <div className="avatar me-2">
              <span role="button">
                {' '}
                <Image className="avatar-img rounded-circle" src={logo13} alt="logo" />{' '}
              </span>
            </div>

            <div>
              <h6 className="card-title mb-0">
                {' '}
                <Link href="#"> Apple Education </Link>
              </h6>
              <p className="mb-0 small">9 November at 23:29</p>
            </div>
          </div>
          <ActionMenu />
        </div>
      </CardHeader>
      <CardBody className="pb-0">
        <p>
          Find out how you can save time in the classroom this year. Earn recognition while you learn new skills on iPad and Mac. Start recognition
          your first Apple Teacher badge today!
        </p>

        <ul className="nav nav-stack pb-2 small">
          <li className="nav-item">
            <Link className="nav-link active text-secondary" href="#">
              <span className="me-1 icon-xs bg-danger text-white rounded-circle">
                <BsHeartFill size={10} />
              </span>{' '}
              Louis, Billy and 126 others{' '}
            </Link>
          </li>
          <li className="nav-item ms-sm-auto">
            <Link className="nav-link" href="#">
              {' '}
              <BsChatFill size={18} className="pe-1" />
              Comments (12)
            </Link>
          </li>
        </ul>
      </CardBody>

      <CardFooter className="py-3">
        <ul className="nav nav-fill nav-stack small">
          <li className="nav-item">
            <Link className="nav-link mb-0 active" href="#">
              {' '}
              <BsHeart className="pe-1" size={18} />
              Liked (56)
            </Link>
          </li>

          <Dropdown className="nav-item">
            <DropdownToggle as="a" className="nav-link mb-0 content-none cursor-pointer" id="cardShareAction6" aria-expanded="false">
              <BsReplyFill className="flip-horizontal ps-1" size={18} />
              Share (3)
            </DropdownToggle>

            <DropdownMenu className="dropdown-menu-end" aria-labelledby="cardShareAction6">
              <li>
                <DropdownItem href="#">
                  {' '}
                  <BsEnvelope size={22} className="fa-fw pe-2" />
                  Send via Direct Message
                </DropdownItem>
              </li>
              <li>
                <DropdownItem href="#">
                  {' '}
                  <BsBookmarkCheck size={22} className="fa-fw pe-2" />
                  Bookmark{' '}
                </DropdownItem>
              </li>
              <li>
                <DropdownItem href="#">
                  {' '}
                  <BsLink size={22} className="fa-fw pe-2" />
                  Copy link to post
                </DropdownItem>
              </li>
              <li>
                <DropdownItem href="#">
                  {' '}
                  <BsShare size={22} className="fa-fw pe-2" />
                  Share post via …
                </DropdownItem>
              </li>
              <li>
                <DropdownDivider />
              </li>
              <li>
                <DropdownItem href="#">
                  {' '}
                  <BsPencilSquare size={22} className="fa-fw pe-2" />
                  Share to News Feed
                </DropdownItem>
              </li>
            </DropdownMenu>
          </Dropdown>

          <li className="nav-item">
            <Link className="nav-link mb-0" href="#">
              {' '}
              <BsSendFill className="pe-1" size={18} />
              Send
            </Link>
          </li>
        </ul>
      </CardFooter>
    </Card>
  )
}

const CommonPost = ({ children }: { children: ReactNode }) => {
  return (
    <Card>
      <CardHeader className="border-0 pb-0">
        <div className="d-flex align-items-center justify-content-between">
          <div className="d-flex align-items-center">
            <div className="avatar me-2">
              <span role="button">
                {' '}
                <Image className="avatar-img rounded-circle" src={avatar4} alt="image-4" />{' '}
              </span>
            </div>

            <div>
              <h6 className="card-title mb-0">
                {' '}
                <Link href="#"> All in the Mind </Link>
              </h6>
              <p className="mb-0 small">9 November at 23:29</p>
            </div>
          </div>
          <ActionMenu />
        </div>
      </CardHeader>

      <CardBody className="pb-0">
        <p>How do you protect your business against cyber-crime?</p>

        {children}

        <ul className="nav nav-divider mt-2 mb-0">
          <li className="nav-item">
            <Link className="nav-link" href="#">
              263 votes
            </Link>
          </li>
          <li className="nav-item">
            <Link className="nav-link" href="#">
              2d left
            </Link>
          </li>
        </ul>

        <ul className="nav nav-stack pb-2 small">
          <li className="nav-item">
            <Link className="nav-link active text-secondary" href="#">
              <span className="me-1 icon-xs bg-danger text-white rounded-circle">
                <BsHeartFill size={10} />
              </span>{' '}
              Louis, Billy and 126 others{' '}
            </Link>
          </li>
          <li className="nav-item ms-sm-auto">
            <Link className="nav-link" href="#">
              {' '}
              <BsChatFill size={18} className="pe-1" />
              Comments (12)
            </Link>
          </li>
        </ul>
      </CardBody>

      <div className="card-footer py-3">
        <ul className="nav nav-fill nav-stack small">
          <li className="nav-item">
            <Link className="nav-link mb-0 active" href="#">
              {' '}
              <BsHeart className="pe-1" size={18} />
              Liked (56)
            </Link>
          </li>

          <Dropdown className="nav-item">
            <DropdownToggle as="a" className="nav-link mb-0 content-none cursor-pointer" id="cardShareAction6" aria-expanded="false">
              <BsReplyFill className="flip-horizontal ps-1" size={18} />
              Share (3)
            </DropdownToggle>

            <DropdownMenu className="dropdown-menu-end" aria-labelledby="cardShareAction6">
              <li>
                <DropdownItem href="#">
                  {' '}
                  <BsEnvelope size={22} className="fa-fw pe-2" />
                  Send via Direct Message
                </DropdownItem>
              </li>
              <li>
                <DropdownItem href="#">
                  {' '}
                  <BsBookmarkCheck size={22} className="fa-fw pe-2" />
                  Bookmark{' '}
                </DropdownItem>
              </li>
              <li>
                <DropdownItem href="#">
                  {' '}
                  <BsLink size={22} className="fa-fw pe-2" />
                  Copy link to post
                </DropdownItem>
              </li>
              <li>
                <DropdownItem href="#">
                  {' '}
                  <BsShare size={22} className="fa-fw pe-2" />
                  Share post via …
                </DropdownItem>
              </li>
              <li>
                <DropdownDivider />
              </li>
              <li>
                <DropdownItem href="#">
                  {' '}
                  <BsPencilSquare size={22} className="fa-fw pe-2" />
                  Share to News Feed
                </DropdownItem>
              </li>
            </DropdownMenu>
          </Dropdown>

          <li className="nav-item">
            <Link className="nav-link mb-0" href="#">
              {' '}
              <BsSendFill className="pe-1" size={18} />
              Send
            </Link>
          </li>
        </ul>
      </div>
    </Card>
  )
}

const Post3 = () => {
  return (
    <Card>
      <CardHeader>
        <div className="d-flex align-items-center justify-content-between">
          <div className="d-flex align-items-center">
            <div className="avatar me-2">
              <span role="button">
                {' '}
                <Image className="avatar-img rounded-circle" src={logo11} alt="logo" />{' '}
              </span>
            </div>
            <div>
              <h6 className="card-title mb-0">
                {' '}
                <Link href="#"> StackBros </Link>
              </h6>
              <p className="small mb-0">9 December at 10:00 </p>
            </div>
          </div>
          <ActionMenu />
        </div>
      </CardHeader>
      <CardBody>
        <p className="mb-0">
          The next-generation blog, news, and magazine theme for you to start sharing your content today with beautiful aesthetics! This minimal &amp;
          clean Bootstrap 5 based theme is ideal for all types of sites that aim to provide users with content. <Link href="#"> #bootstrap</Link>{' '}
          <Link href="#"> #stackbros </Link> <Link href="#"> #getbootstrap</Link> <Link href="#"> #bootstrap5 </Link>
        </p>
      </CardBody>

      <span role="button">
        {' '}
        <Image src={postImg4} alt="post-image" />{' '}
      </span>

      <CardBody className="position-relative bg-light">
        <Link href="#" className="small stretched-link">
          https://stackbros.in/blogzine/
        </Link>
        <h6 className="mb-0 mt-1">Blogzine - Blog and Magazine Bootstrap 5 Theme</h6>
        <p className="mb-0 small">Bootstrap based News, Magazine and Blog Theme</p>
      </CardBody>

      <CardFooter className="py-3">
        <ul className="nav nav-fill nav-stack small">
          <li className="nav-item">
            <Link className="nav-link mb-0 active" href="#">
              {' '}
              <BsHeart size={18} className="pe-1" />
              Liked (56)
            </Link>
          </li>
          <li className="nav-item">
            <Link className="nav-link mb-0" href="#">
              {' '}
              <BsChatFill size={18} className="pe-1" />
              Comments (12)
            </Link>
          </li>

          <Dropdown className="nav-item">
            <DropdownToggle as="a" className="nav-link mb-0 content-none cursor-pointer" id="cardShareAction6" aria-expanded="false">
              <BsReplyFill className="flip-horizontal ps-1" size={18} />
              Share (3)
            </DropdownToggle>

            <DropdownMenu className="dropdown-menu-end" aria-labelledby="cardShareAction6">
              <li>
                <DropdownItem href="#">
                  {' '}
                  <BsEnvelope size={22} className="fa-fw pe-2" />
                  Send via Direct Message
                </DropdownItem>
              </li>
              <li>
                <DropdownItem href="#">
                  {' '}
                  <BsBookmarkCheck size={22} className="fa-fw pe-2" />
                  Bookmark{' '}
                </DropdownItem>
              </li>
              <li>
                <DropdownItem href="#">
                  {' '}
                  <BsLink size={22} className="fa-fw pe-2" />
                  Copy link to post
                </DropdownItem>
              </li>
              <li>
                <DropdownItem href="#">
                  {' '}
                  <BsShare size={22} className="fa-fw pe-2" />
                  Share post via …
                </DropdownItem>
              </li>
              <li>
                <DropdownDivider />
              </li>
              <li>
                <DropdownItem href="#">
                  {' '}
                  <BsPencilSquare size={22} className="fa-fw pe-2" />
                  Share to News Feed
                </DropdownItem>
              </li>
            </DropdownMenu>
          </Dropdown>

          <li className="nav-item">
            <Link className="nav-link mb-0" href="#">
              {' '}
              <BsSendFill size={18} className="pe-1" />
              Send
            </Link>
          </li>
        </ul>
      </CardFooter>
    </Card>
  )
}

type FeedsFilters = {
  sectionSlug?: string
  categorySlug?: string
  /** Free-text filter (section listings / search-in-section). */
  q?: string
  cityId?: number
  priceMin?: number
  priceMax?: number
  hasImages?: boolean
  sort?: 'newest' | 'oldest' | 'price_asc' | 'price_desc'
  attributes?: Record<number, Array<number>>
  attributeRanges?: Record<number, { from?: string | number; to?: string | number }>
  page?: number
  basePath?: string
}

function buildFiltersSearchParams(filters?: FeedsFilters) {
  const sp = new URLSearchParams()
  if (!filters) return sp

  if (filters.q && filters.q.trim() !== '') sp.set('q', filters.q.trim())
  if (filters.cityId) sp.set('city_id', String(filters.cityId))
  if (filters.priceMin != null) sp.set('price_min', String(filters.priceMin))
  if (filters.priceMax != null) sp.set('price_max', String(filters.priceMax))
  if (filters.hasImages === true) sp.set('has_images', '1')
  if (filters.hasImages === false) sp.set('has_images', '0')
  if (filters.sort) sp.set('sort', filters.sort)

  // Attributes (multi)
  for (const [attrIdRaw, optionIds] of Object.entries(filters.attributes ?? {})) {
    const attrId = Number(attrIdRaw)
    if (!attrId || !Array.isArray(optionIds) || optionIds.length === 0) continue
    optionIds.forEach((optId) => sp.append(`attr[${attrId}][]`, String(optId)))
  }

  // Ranges
  for (const [attrIdRaw, r] of Object.entries(filters.attributeRanges ?? {})) {
    const attrId = Number(attrIdRaw)
    if (!attrId || !r) continue
    if (r.from != null && String(r.from).trim() !== '') sp.set(`attr[${attrId}][from]`, String(r.from).trim())
    if (r.to != null && String(r.to).trim() !== '') sp.set(`attr[${attrId}][to]`, String(r.to).trim())
  }

  return sp
}

const Feeds = async ({
  filters,
  useLoadMore,
  listingsHeading,
  excludeIds = [],
}: {
  filters?: FeedsFilters
  /**
   * Toggle between:
   * - true: LoadMoreButton (client fetch append)
   * - false: SEO pagination links (?page=2) rendered as crawlable links
   */
  useLoadMore?: boolean
  /** Semantic h2 for the listings block (visually hidden; keeps outline for bots). */
  listingsHeading?: string
  /** Listing ids already shown in adjacent homepage rails. Filtered by id only. */
  excludeIds?: number[]
} = {}) => {
  const headersList = await headers()
  const locale = headersList.get('x-locale') ?? undefined
  const countryCode = headersList.get('x-country')

  let countryId: number | undefined
  if (countryCode) {
    try {
      const country = await getCountryByCodeCached(countryCode)
      countryId = country?.id
    } catch (error) {
      console.error('Error resolving country from code:', error)
    }
  }

  const page = filters?.page && Number.isFinite(filters.page) && filters.page > 0 ? filters.page : undefined
  const excluded = new Set(excludeIds.filter((id) => Number.isFinite(id)))
  const query = {
    countryId,
    land: locale,
    sectionSlug: filters?.sectionSlug,
    categorySlug: filters?.categorySlug,
    q: filters?.q,
    cityId: filters?.cityId,
    priceMin: filters?.priceMin,
    priceMax: filters?.priceMax,
    hasImages: filters?.hasImages,
    sort: filters?.sort,
    attributes: filters?.attributes,
    attributeRanges: filters?.attributeRanges,
  }

  const posts: Awaited<ReturnType<typeof fetchPosts>>['data'] = []
  let nextPageUrl: string | null = null
  let postsResponse: Awaited<ReturnType<typeof fetchPosts>> | null = null
  let cursor = page ?? 1
  for (let attempt = 0; attempt < 4; attempt += 1) {
    postsResponse = await fetchPosts({ ...query, page: cursor })
    const rows = Array.isArray(postsResponse?.data) ? postsResponse.data : []
    nextPageUrl = (postsResponse as { next_page_url?: string | null })?.next_page_url ?? null
    for (const row of rows) {
      const id = Number(row?.id)
      if (!Number.isFinite(id) || excluded.has(id)) continue
      if (posts.some((kept) => Number(kept?.id) === id)) continue
      posts.push(row)
    }
    if (posts.length >= 6 || !nextPageUrl || rows.length === 0) break
    cursor += 1
  }

  const enableLoadMore =
    typeof useLoadMore === 'boolean'
      ? useLoadMore
      : process.env.NEXT_PUBLIC_FEEDS_USE_LOAD_MORE
        ? process.env.NEXT_PUBLIC_FEEDS_USE_LOAD_MORE === 'true'
        : true

  // Build a stable-ish key so the client list resets when filters (URL) change
  const normalizedAttributes = Object.entries(filters?.attributes ?? {})
    .map(([k, v]) => [Number(k), Array.isArray(v) ? [...v].sort((a, b) => a - b) : []] as const)
    .sort((a, b) => a[0] - b[0])
  const normalizedRanges = Object.entries(filters?.attributeRanges ?? {})
    .map(([k, v]) => [Number(k), String(v?.from ?? ''), String(v?.to ?? '')] as const)
    .sort((a, b) => a[0] - b[0])
  const resetKey = JSON.stringify({
    countryId: countryId ?? null,
    land: locale ?? null,
    sectionSlug: filters?.sectionSlug ?? null,
    categorySlug: filters?.categorySlug ?? null,
    q: filters?.q ?? null,
    cityId: filters?.cityId ?? null,
    priceMin: filters?.priceMin ?? null,
    priceMax: filters?.priceMax ?? null,
    hasImages: typeof filters?.hasImages === 'boolean' ? filters.hasImages : null,
    sort: filters?.sort ?? 'newest',
    attributes: normalizedAttributes,
    ranges: normalizedRanges,
    page: page ?? 1,
  })
  
  return (
    <section aria-labelledby={listingsHeading ? 'feed-listings-heading' : undefined}>
      {listingsHeading ? (
        <h2 id="feed-listings-heading" className="visually-hidden">
          {listingsHeading}
        </h2>
      ) : null}
      {enableLoadMore ? (
        <PaginatedPosts
          initialPosts={posts}
          initialNextPageUrl={nextPageUrl}
          excludeIds={excludeIds}
          fetchParams={{
            countryId,
            land: locale,
            sectionSlug: filters?.sectionSlug,
            categorySlug: filters?.categorySlug,
            q: filters?.q,
            cityId: filters?.cityId,
            priceMin: filters?.priceMin,
            priceMax: filters?.priceMax,
            hasImages: filters?.hasImages,
            sort: filters?.sort,
            attributes: filters?.attributes,
            attributeRanges: filters?.attributeRanges,
          }}
          resetKey={resetKey}
        />
      ) : (
        <>
          {/* PostsList is a client component that stores posts in local state.
              Key forces remount when page/filters change (SEO pagination mode). */}
          <PostsList
            key={resetKey}
            initialPosts={posts}
            filters={{
              sort: filters?.sort,
              sectionSlug: filters?.sectionSlug,
              categorySlug: filters?.categorySlug,
              cityId: filters?.cityId,
              priceMin: filters?.priceMin,
              priceMax: filters?.priceMax,
              hasImages: filters?.hasImages,
            }}
          />
          {(() => {
            const currentPage = (postsResponse as any)?.current_page ? Number((postsResponse as any).current_page) : (page ?? 1)
            const lastPage = (postsResponse as any)?.last_page ? Number((postsResponse as any).last_page) : currentPage
            const hasNext = Boolean((postsResponse as any)?.next_page_url) || currentPage < lastPage
            const hasPrev = Boolean((postsResponse as any)?.prev_page_url) || currentPage > 1

            const basePath =
              filters?.basePath ||
              (filters?.sectionSlug && filters?.categorySlug
                ? `/${locale ?? 'ar'}/${filters.sectionSlug}/${filters.categorySlug}`
                : filters?.sectionSlug
                  ? `/${locale ?? 'ar'}/${filters.sectionSlug}`
                  : `/${locale ?? 'ar'}`)

            const sp = buildFiltersSearchParams(filters)

            const makeHref = (targetPage: number) => {
              const next = new URLSearchParams(sp.toString())
              if (targetPage > 1) next.set('page', String(targetPage))
              else next.delete('page')
              const qs = next.toString()
              return qs ? `${basePath}?${qs}` : basePath
            }

            if (!hasPrev && !hasNext) return null

            const clamp = (n: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, n))

            // Render limited page numbers to avoid huge link sets
            // Pattern: 1 ... (c-2,c-1,c,c+1,c+2) ... last
            const windowSize = 2
            const start = clamp(currentPage - windowSize, 1, lastPage)
            const end = clamp(currentPage + windowSize, 1, lastPage)

            const pages: Array<number | '...'> = []
            const pushPage = (p: number) => {
              if (!pages.includes(p)) pages.push(p)
            }

            pushPage(1)
            if (start > 2) pages.push('...')
            for (let p = Math.max(2, start); p <= Math.min(lastPage - 1, end); p++) pushPage(p)
            if (end < lastPage - 1) pages.push('...')
            if (lastPage > 1) pushPage(lastPage)

            const pl = (locale ?? 'ar') === 'en'
            const labelPrev = pl ? 'Previous' : 'السابق'
            const labelNext = pl ? 'Next' : 'التالي'

            return (
              <nav className={paginationStyles.root} aria-label={pl ? 'Pagination' : 'ترقيم الصفحات'}>
                <div className={paginationStyles.inner}>
                  {hasPrev && (
                    <Link href={makeHref(Math.max(1, currentPage - 1))} className={paginationStyles.prevNext} rel="prev">
                      {labelPrev}
                    </Link>
                  )}
                  {pages.map((p, idx) =>
                    p === '...' ? (
                      <span key={`dots-${idx}`} className={paginationStyles.dots} aria-hidden>
                        …
                      </span>
                    ) : (
                      <Link
                        key={`p-${p}`}
                        href={makeHref(p)}
                        className={p === currentPage ? paginationStyles.pageActive : paginationStyles.pageNum}
                        aria-current={p === currentPage ? 'page' : undefined}
                      >
                        {p}
                      </Link>
                    ),
                  )}
                  {hasNext && (
                    <Link href={makeHref(currentPage + 1)} className={paginationStyles.nextPrimary} rel="next">
                      {labelNext}
                    </Link>
                  )}
                </div>
              </nav>
            )
          })()}
        </>
      )}
    </section>
  )
}
export default Feeds
