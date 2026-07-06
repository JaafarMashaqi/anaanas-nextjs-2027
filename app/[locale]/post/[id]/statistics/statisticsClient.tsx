'use client'

import { useEffect, useMemo, useState, type ComponentType, type CSSProperties } from 'react'
import Link from 'next/link'
import { motion, useReducedMotion } from 'motion/react'
import { Button, Card, Col, Container, Form, Placeholder, Row, Tab, Tabs } from 'react-bootstrap'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ReferenceArea,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import {
  BsArrowLeft,
  BsBarChartLineFill,
  BsBinoculars,
  BsChatDots,
  BsChatLeftText,
  BsCursor,
  BsEye,
  BsHandThumbsDown,
  BsHeart,
  BsHouseDoor,
  BsLightningCharge,
  BsPersonCheck,
  BsShare,
  BsStar,
  BsTelephone,
  BsWindow,
} from 'react-icons/bs'
import { t } from '@/lib/translations'
import type { SupportedLocale } from '@/lib/localization'
import wizardStyles from '@/components/cards/CreatePostCard.module.css'
import AnanasStatsMascot from '@/components/statistics/AnanasStatsMascot'
import { PROMOTION_KPI_META, formatStatNum, listItemVariants } from '@/components/statistics/statsUtils'
import theme from '@/components/statistics/statsTheme.module.css'
import styles from './postStatistics.module.css'

type StatsData = {
  post_id: number
  range: { from: string; to: string }
  totals: Record<string, number>
  daily: Array<{
    date: string
    impressions: number
    unique_impressions: number
    views: number
    calls: number
    shares: number
    chats: number
    likes: number
    unlikes: number
    comments: number
  }>
  breakdown: Array<{ event: string; count: number }>
  top?: { user_agents?: Array<{ user_agent: string; count: number }> }
  reactions?: {
    by_type?: Array<{ type: string; count: number }>
    daily_by_type?: Array<{
      date: string
      like: number
      love: number
      care: number
      haha: number
      wow: number
      sad: number
      angry: number
    }>
  }
  promotion_periods?: Array<{
    id: number
    status: string
    is_active: boolean
    starts_at?: string
    ends_at?: string
    appearance_weight?: number
    package?: { id: number; slug: string; name: string } | null
  }>
  promotion_totals?: Record<string, number>
  promotion_daily?: Array<Record<string, string | number>>
}

function todayISO() {
  return new Date().toISOString().slice(0, 10)
}

function daysAgoISO(days: number) {
  const d = new Date()
  d.setDate(d.getDate() - days)
  return d.toISOString().slice(0, 10)
}

function formatNum(n: number) {
  try {
    return new Intl.NumberFormat().format(n)
  } catch {
    return String(n)
  }
}

function eventLabel(ev: string, locale: SupportedLocale) {
  switch (ev) {
    case 'post_impression':
      return t('stats.event.impressions', locale)
    case 'post_view':
      return t('stats.event.views', locale)
    case 'post_share':
      return t('stats.event.shares', locale)
    case 'post_call':
      return t('stats.event.calls', locale)
    case 'post_chat_open':
      return t('stats.event.chats', locale)
    case 'post_like':
      return t('stats.event.likes', locale)
    case 'post_unlike':
      return t('stats.event.unlikes', locale)
    case 'post_comment':
      return t('stats.event.comments', locale)
    default:
      return ev
  }
}

const listItem = listItemVariants

type KpiIcon = ComponentType<{ className?: string; style?: CSSProperties }>

type PostKpi = {
  key: string
  label: string
  value: number
  color: string
  icon: KpiIcon
}

const POST_KPI_ICONS: Record<string, KpiIcon> = {
  impressions: BsEye,
  unique_impressions: BsPersonCheck,
  views: BsBinoculars,
  interactions: BsLightningCharge,
  calls: BsTelephone,
  shares: BsShare,
  chats: BsChatDots,
  likes: BsHeart,
  comments: BsChatLeftText,
  unlikes: BsHandThumbsDown,
}

const PROMO_KPI_ICONS: Record<string, KpiIcon> = {
  featured_impressions: BsStar,
  homepage_pin_views: BsHouseDoor,
  popup_shown: BsWindow,
  popup_click: BsCursor,
  listing_boost_impressions: BsLightningCharge,
}

type ReactionTypeKey = 'like' | 'love' | 'care' | 'haha' | 'wow' | 'sad' | 'angry'

const reactionTypes: ReactionTypeKey[] = ['like', 'love', 'care', 'haha', 'wow', 'sad', 'angry']
const reactionColors: Record<ReactionTypeKey, string> = {
  like: '#1877f2',
  love: '#f43f5e',
  care: '#f59e0b',
  haha: '#facc15',
  wow: '#06b6d4',
  sad: '#8b5cf6',
  angry: '#ef4444',
}
const reactionEmojis: Record<ReactionTypeKey, string> = {
  like: '👍',
  love: '❤️',
  care: '🥰',
  haha: '😂',
  wow: '😮',
  sad: '😢',
  angry: '😡',
}

function reactionLabel(key: ReactionTypeKey, locale: SupportedLocale) {
  if (locale === 'ar') {
    const map: Record<ReactionTypeKey, string> = {
      like: 'أعجبني',
      love: 'أحببته',
      care: 'مهتم',
      haha: 'أضحكني',
      wow: 'أدهشني',
      sad: 'أحزنني',
      angry: 'أغضبني',
    }
    return map[key]
  }
  const map: Record<ReactionTypeKey, string> = {
    like: 'Like',
    love: 'Love',
    care: 'Care',
    haha: 'Haha',
    wow: 'Wow',
    sad: 'Sad',
    angry: 'Angry',
  }
  return map[key]
}

export default function PostStatisticsClient({
  locale = 'ar',
  postId,
}: {
  locale?: SupportedLocale
  postId: string
}) {
  const [from, setFrom] = useState<string>(daysAgoISO(29))
  const [to, setTo] = useState<string>(todayISO())
  const [post, setPost] = useState<any>(null)
  const [postLoading, setPostLoading] = useState(true)
  const [data, setData] = useState<StatsData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const breakdownForChart = useMemo(() => {
    const src = Array.isArray(data?.breakdown) ? data!.breakdown : []
    return src
      .filter((x) => (x?.count ?? 0) > 0)
      .map((x) => ({ name: eventLabel(x.event, locale), value: Number(x.count ?? 0) }))
  }, [data, locale])

  const reducedMotion = useReducedMotion()
  const rangeHint = `${from} → ${to}`

  const kpis = useMemo((): PostKpi[] => {
    const totals = data?.totals ?? {}
    const defs: Array<Omit<PostKpi, 'value'>> = [
      { key: 'impressions', label: t('stats.kpi.impressions', locale), color: '#177dc1', icon: POST_KPI_ICONS.impressions },
      { key: 'unique_impressions', label: t('stats.kpi.uniqueImpressions', locale), color: '#ba7bff', icon: POST_KPI_ICONS.unique_impressions },
      { key: 'views', label: t('stats.kpi.views', locale), color: '#151515', icon: POST_KPI_ICONS.views },
      {
        key: 'interactions',
        label: t('stats.kpi.interactions', locale),
        color: '#fecb01',
        icon: POST_KPI_ICONS.interactions,
      },
      { key: 'calls', label: t('stats.kpi.calls', locale), color: '#e76f51', icon: POST_KPI_ICONS.calls },
      { key: 'shares', label: t('stats.kpi.shares', locale), color: '#4f9ef8', icon: POST_KPI_ICONS.shares },
      { key: 'chats', label: t('stats.kpi.chats', locale), color: '#f59e0b', icon: POST_KPI_ICONS.chats },
      { key: 'likes', label: t('stats.event.likes', locale), color: '#1877f2', icon: POST_KPI_ICONS.likes },
      { key: 'comments', label: t('stats.event.comments', locale), color: '#6610f2', icon: POST_KPI_ICONS.comments },
      { key: 'unlikes', label: t('stats.event.unlikes', locale), color: '#64748b', icon: POST_KPI_ICONS.unlikes },
    ]
    return defs.map((d) => ({
      ...d,
      value:
        d.key === 'interactions'
          ? Number((totals.calls ?? 0) + (totals.shares ?? 0) + (totals.chats ?? 0) + (totals.likes ?? 0) + (totals.comments ?? 0))
          : Number(totals[d.key] ?? 0),
    }))
  }, [data, locale])

  const reactionByType = useMemo(() => {
    const src = Array.isArray(data?.reactions?.by_type) ? data!.reactions!.by_type! : []
    return reactionTypes.map((type) => {
      const found = src.find((x) => String(x.type).toLowerCase() === type)
      const count = Number(found?.count ?? 0)
      return {
        type,
        name: reactionLabel(type, locale),
        emoji: reactionEmojis[type],
        color: reactionColors[type],
        count,
      }
    })
  }, [data, locale])

  const reactionByTypeForChart = useMemo(() => {
    return reactionByType.filter((x) => x.count > 0).map((x) => ({ name: `${x.emoji} ${x.name}`, value: x.count, color: x.color }))
  }, [reactionByType])

  const promotionPeriods = useMemo(() => {
    return Array.isArray(data?.promotion_periods) ? data!.promotion_periods! : []
  }, [data])

  const promotionKpis = useMemo((): PostKpi[] => {
    const totals = data?.promotion_totals ?? {}
    return Object.entries(PROMOTION_KPI_META).map(([key, meta]) => ({
      key,
      label: locale === 'ar' ? meta.ar : meta.en,
      value: Number(totals[key] ?? 0),
      color: meta.color,
      icon: PROMO_KPI_ICONS[key] ?? BsStar,
    }))
  }, [data, locale])

  const promotionDaily = useMemo(() => {
    const src = Array.isArray(data?.promotion_daily) ? data!.promotion_daily! : []
    return src.map((row) => ({
      date: String(row.date ?? ''),
      featured_impression: Number(row.featured_impression ?? 0),
      homepage_pin_view: Number(row.homepage_pin_view ?? 0),
      popup_shown: Number(row.popup_shown ?? 0),
      popup_click: Number(row.popup_click ?? 0),
      listing_boost_impression: Number(row.listing_boost_impression ?? 0),
    }))
  }, [data])

  const hasPromotionData = promotionKpis.some((k) => k.value > 0) || promotionPeriods.length > 0

  const promotionRanges = useMemo(() => {
    const fromDay = from
    const toDay = to
    return promotionPeriods
      .map((p) => {
        const start = p.starts_at ? p.starts_at.slice(0, 10) : ''
        const end = p.ends_at ? p.ends_at.slice(0, 10) : ''
        if (!start || !end) return null
        if (end < fromDay || start > toDay) return null
        return {
          id: p.id,
          x1: start < fromDay ? fromDay : start,
          x2: end > toDay ? toDay : end,
          label: p.package?.name ?? (locale === 'ar' ? 'تمييز' : 'Featured'),
          active: p.is_active,
        }
      })
      .filter(Boolean) as Array<{ id: number; x1: string; x2: string; label: string; active: boolean }>
  }, [promotionPeriods, from, to, locale])

  const boostLift = useMemo(() => {
    const dailyRows = Array.isArray(data?.daily) ? data!.daily : []
    if (!dailyRows.length || !promotionRanges.length) return null
    const promoDays = new Set<string>()
    promotionRanges.forEach((r) => {
      dailyRows.forEach((row) => {
        const d = String(row.date)
        if (d >= r.x1 && d <= r.x2) promoDays.add(d)
      })
    })
    if (!promoDays.size) return null
    const promoViews = dailyRows
      .filter((row) => promoDays.has(String(row.date)))
      .reduce((sum, row) => sum + Number(row.views ?? 0), 0)
    const otherViews = dailyRows
      .filter((row) => !promoDays.has(String(row.date)))
      .reduce((sum, row) => sum + Number(row.views ?? 0), 0)
    const promoAvg = promoViews / promoDays.size
    const otherDays = dailyRows.length - promoDays.size
    const otherAvg = otherDays > 0 ? otherViews / otherDays : 0
    if (otherAvg <= 0) return null
    return Math.round(((promoAvg - otherAvg) / otherAvg) * 100)
  }, [data, promotionRanges])

  const reactionDaily = useMemo(() => {
    const src = Array.isArray(data?.reactions?.daily_by_type) ? data!.reactions!.daily_by_type! : []
    return src.map((row) => ({
      date: row.date,
      like: Number(row.like ?? 0),
      love: Number(row.love ?? 0),
      care: Number(row.care ?? 0),
      haha: Number(row.haha ?? 0),
      wow: Number(row.wow ?? 0),
      sad: Number(row.sad ?? 0),
      angry: Number(row.angry ?? 0),
    }))
  }, [data])

  const fetchPost = async () => {
    setPostLoading(true)
    try {
      const res = await fetch(`/api/posts/${encodeURIComponent(postId)}?land=${encodeURIComponent(locale)}`, {
        method: 'GET',
        headers: { Accept: 'application/json' },
        cache: 'no-store',
      })
      const json = await res.json().catch(() => ({}))
      if (!res.ok || !json?.success || !json?.data) throw new Error(json?.message || 'Failed to load post')
      setPost(json.data)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load post')
    } finally {
      setPostLoading(false)
    }
  }

  const apply = async (nextFrom = from, nextTo = to) => {
    setLoading(true)
    setError(null)
    try {
      const qs = new URLSearchParams()
      if (nextFrom) qs.set('from', nextFrom)
      if (nextTo) qs.set('to', nextTo)
      const res = await fetch(`/api/posts/${encodeURIComponent(postId)}/statistics?${qs.toString()}`, {
        method: 'GET',
        headers: { Accept: 'application/json' },
        cache: 'no-store',
      })
      const json = await res.json().catch(() => ({}))
      if (!res.ok || !json?.success) throw new Error(json?.message || 'Failed to load statistics')
      setData(json.data as StatsData)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load statistics')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void fetchPost()
    void apply(from, to)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [postId, locale])

  const setPreset = (days: number) => {
    const nf = daysAgoISO(days - 1)
    const nt = todayISO()
    setFrom(nf)
    setTo(nt)
    void apply(nf, nt)
  }

  const daily = Array.isArray(data?.daily) ? data!.daily : []

  const pieColors = ['#0d6efd', '#6610f2', '#fecb01', '#0dcaf0', '#dc3545', '#198754', '#0b1f3a', '#6c757d']

  const renderKpiGrid = (items: PostKpi[], opts?: { promo?: boolean; showRange?: boolean; skeletonCount?: number }) => {
    const promo = opts?.promo ?? false
    const showRange = opts?.showRange ?? false
    const skeletonCount = opts?.skeletonCount ?? 6
    const list = loading && !data ? Array.from({ length: skeletonCount }).map((_, i) => ({ key: `sk-${i}` })) : items

    return (
      <div className={styles.kpiGrid}>
        {list.map((k: PostKpi | { key: string }, idx) => {
          const isSkeleton = !('label' in k)
          const Icon = !isSkeleton ? k.icon : null
          return (
            <motion.div
              key={k.key}
              className={`${styles.kpiCard} ${promo ? styles.kpiCardPromo : ''}`}
              style={!isSkeleton ? ({ ['--kpi-accent' as string]: k.color } as CSSProperties) : undefined}
              custom={idx}
              variants={listItem}
              initial={reducedMotion ? false : 'hidden'}
              animate="show"
              whileHover={reducedMotion ? undefined : { y: -3, transition: { type: 'spring', stiffness: 420, damping: 22 } }}
            >
              <div className={styles.kpiCardTop}>
                <div className={styles.kpiIconWrap} aria-hidden={isSkeleton}>
                  {isSkeleton ? <span className={styles.kpiIconSkeleton} /> : Icon ? <Icon /> : null}
                </div>
                {!isSkeleton && k.value > 0 && <span className={styles.kpiSpark} aria-hidden />}
              </div>
              <div className={styles.kpiLabel}>
                {isSkeleton ? <Placeholder xs={6} /> : k.label}
              </div>
              <div className={styles.kpiValue}>
                {isSkeleton ? <Placeholder xs={4} /> : formatStatNum(k.value, locale)}
              </div>
              {showRange && !isSkeleton && <div className={styles.kpiRange}>{rangeHint}</div>}
            </motion.div>
          )
        })}
      </div>
    )
  }

  return (
    <div className={`${styles.pageRoot} ${theme.pageRoot}`}>
      <div className={theme.container}>
      <Container className="py-2 px-0" fluid>
        <motion.div
          className={`${theme.shell} px-0`}
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.38 }}
        >
        <motion.div
          className={theme.hero}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className={theme.heroMesh} aria-hidden />
          <div className={theme.heroInner}>
          <div className={styles.heroCopy}>
            <div className="d-flex flex-wrap align-items-center justify-content-between gap-2">
              <div className="d-flex align-items-center gap-2">
                <BsBarChartLineFill style={{ color: '#151515', fontSize: '1.35rem' }} />
                <h4 className="mb-0" style={{ color: '#151515', fontWeight: 900 }}>
                  {t('stats.title', locale)}
                </h4>
              </div>
              <Link className={theme.backBtn} href={`/${locale}/post/${postId}`}>
                <BsArrowLeft className="me-1" />
                {t('stats.backToPost', locale)}
              </Link>
            </div>
            <div className={theme.heroSubtitle}>
              {t('stats.subtitle', locale)}:{' '}
              {postLoading ? (
                <Placeholder as="span" animation="glow">
                  <Placeholder xs={4} />
                </Placeholder>
              ) : (
                <span className="fw-semibold text-dark">{post?.title ?? `#${postId}`}</span>
              )}
            </div>
          </div>
          <AnanasStatsMascot />
          </div>
        </motion.div>

        <div className={theme.body}>
          <Card className={`border-0 shadow-none mb-3 ${wizardStyles.wizardCard} ${wizardStyles.smartCard} ${styles.toolbarCard}`}>
            <Card.Body>
              <Row className="g-2 align-items-end">
                <Col xs={12} md={4}>
                  <Form.Label className="small text-muted mb-1">{t('stats.from', locale)}</Form.Label>
                  <Form.Control type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
                </Col>
                <Col xs={12} md={4}>
                  <Form.Label className="small text-muted mb-1">{t('stats.to', locale)}</Form.Label>
                  <Form.Control type="date" value={to} onChange={(e) => setTo(e.target.value)} />
                </Col>
                <Col xs={12} md={4} className="d-flex gap-2 flex-wrap">
                  <Button
                    variant="dark"
                    disabled={loading}
                    onClick={() => void apply()}
                    style={{
                      background: 'linear-gradient(180deg, #151515 0%, #2a2a2a 100%)',
                      borderColor: '#151515',
                      fontWeight: 800,
                      borderRadius: 12,
                    }}
                  >
                    {loading ? t('stats.loading', locale) : t('stats.apply', locale)}
                  </Button>
                  <Button variant="outline-secondary" disabled={loading} onClick={() => setPreset(7)} style={{ borderRadius: 12, fontWeight: 700 }}>
                    {t('stats.preset.7d', locale)}
                  </Button>
                  <Button variant="outline-secondary" disabled={loading} onClick={() => setPreset(30)} style={{ borderRadius: 12, fontWeight: 700 }}>
                    {t('stats.preset.30d', locale)}
                  </Button>
                  <Button variant="outline-secondary" disabled={loading} onClick={() => setPreset(90)} style={{ borderRadius: 12, fontWeight: 700 }}>
                    {t('stats.preset.90d', locale)}
                  </Button>
                </Col>
              </Row>

              {error && <div className={`alert alert-danger mt-3 mb-0 ${theme.errorBanner}`}>{error}</div>}
            </Card.Body>
          </Card>

        {promotionPeriods.length > 0 && (
          <Card className={`border-0 shadow-none mb-3 ${wizardStyles.wizardCard} ${wizardStyles.smartCard} ${styles.promoStrip}`}>
            <Card.Body>
              <div className="fw-bold mb-2" style={{ color: '#151515' }}>
                {locale === 'ar' ? 'فترات التمييز' : 'Promotion periods'}
              </div>
              <div className={styles.promoPeriodList}>
                {promotionPeriods.map((p) => {
                  const start = p.starts_at ? p.starts_at.slice(0, 10) : '—'
                  const end = p.ends_at ? p.ends_at.slice(0, 10) : '—'
                  const pkg = p.package?.name ?? (locale === 'ar' ? 'باقة' : 'Package')
                  return (
                    <div
                      key={p.id}
                      className={`${styles.promoPeriodChip} ${p.is_active ? styles.promoPeriodActive : ''}`}
                    >
                      <span className={styles.promoPeriodName}>{pkg}</span>
                      <span className={styles.promoPeriodDates}>
                        {start} → {end}
                      </span>
                      <span className={styles.promoPeriodStatus}>
                        {p.is_active
                          ? locale === 'ar'
                            ? 'نشط'
                            : 'Active'
                          : p.status === 'expired'
                            ? locale === 'ar'
                              ? 'منتهي'
                              : 'Expired'
                            : String(p.status)}
                      </span>
                    </div>
                  )
                })}
              </div>
              {boostLift != null && (
                <div className="small text-muted mt-2">
                  {locale === 'ar'
                    ? `متوسط المشاهدات أثناء التمييز أعلى بنسبة ${boostLift}% مقارنة بالفترة العادية.`
                    : `Average views during promotion are ${boostLift}% higher than the baseline period.`}
                </div>
              )}
            </Card.Body>
          </Card>
        )}

        {renderKpiGrid(kpis, { showRange: true, skeletonCount: 10 })}

        {promotionKpis.some((k) => k.value > 0) && (
          <>
            <h2 className={theme.sectionTitle}>{locale === 'ar' ? 'إحصائيات التمييز' : 'Promotion analytics'}</h2>
            {renderKpiGrid(promotionKpis.filter((k) => k.value > 0), { promo: true })}
          </>
        )}

        <motion.div initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-40px' }} transition={{ duration: 0.5 }}>
          <Card className={`border-0 shadow-none ${wizardStyles.wizardCard} ${wizardStyles.smartCard} ${styles.chartsShell} ${theme.tabsShell}`}>
            <Card.Body>
              <Tabs defaultActiveKey="overview" className="mb-3">
                <Tab eventKey="overview" title={t('stats.tabs.overview', locale)}>
                  <Row className="g-3">
                    <Col lg={8}>
                      <div className={styles.chartPanel}>
                        <div className="d-flex align-items-center justify-content-between mb-2 flex-wrap gap-2">
                          <div className="fw-bold" style={{ color: '#151515' }}>
                            {t('stats.charts.viewsVsUnique', locale)}
                          </div>
                          <div className="small text-muted">{t('stats.hint.uniqueDefinition', locale)}</div>
                        </div>
                        <div style={{ width: '100%', height: 320 }}>
                          {loading && !data ? (
                            <div className={styles.panelSkeleton} />
                          ) : (
                            <ResponsiveContainer>
                              <LineChart data={daily} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(21,21,21,0.08)" />
                                <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="#64748b" />
                                <YAxis tick={{ fontSize: 12 }} stroke="#64748b" />
                                <Tooltip />
                                <Legend />
                                {promotionRanges.map((range) => (
                                  <ReferenceArea
                                    key={range.id}
                                    x1={range.x1}
                                    x2={range.x2}
                                    strokeOpacity={0}
                                    fill={range.active ? 'rgba(251, 191, 36, 0.22)' : 'rgba(251, 191, 36, 0.12)'}
                                    label={{
                                      value: range.label,
                                      position: 'insideTop',
                                      fill: '#92400e',
                                      fontSize: 11,
                                    }}
                                  />
                                ))}
                                <Line type="monotone" dataKey="impressions" name={t('stats.kpi.impressions', locale)} stroke="#0d6efd" strokeWidth={2} dot={false} />
                                <Line type="monotone" dataKey="unique_impressions" name={t('stats.kpi.uniqueImpressions', locale)} stroke="#6610f2" strokeWidth={2} dot={false} />
                                <Line type="monotone" dataKey="views" name={t('stats.kpi.views', locale)} stroke="#151515" strokeWidth={2} dot={false} />
                              </LineChart>
                            </ResponsiveContainer>
                          )}
                        </div>
                      </div>
                    </Col>
                    <Col lg={4}>
                      <div className={`${styles.chartPanel} h-100`}>
                        <div className="fw-bold mb-2" style={{ color: '#151515' }}>
                          {t('stats.charts.breakdown', locale)}
                        </div>
                        <div style={{ width: '100%', height: 320 }}>
                          {loading && !data ? (
                            <div className={styles.panelSkeleton} />
                          ) : (
                            <ResponsiveContainer>
                              <PieChart>
                                <Tooltip />
                                <Pie data={breakdownForChart} dataKey="value" nameKey="name" outerRadius={110} label>
                                  {breakdownForChart.map((_, i) => (
                                    <Cell key={i} fill={pieColors[i % pieColors.length]} />
                                  ))}
                                </Pie>
                              </PieChart>
                            </ResponsiveContainer>
                          )}
                        </div>
                      </div>
                    </Col>
                  </Row>
                </Tab>

                <Tab eventKey="interactions" title={t('stats.tabs.interactions', locale)}>
                  <div className={styles.chartPanel}>
                    <div className="fw-bold mb-2" style={{ color: '#151515' }}>
                      {t('stats.charts.interactionsOverTime', locale)}
                    </div>
                    <div style={{ width: '100%', height: 360 }}>
                      {loading && !data ? (
                        <div className={styles.panelSkeleton} />
                      ) : (
                        <ResponsiveContainer>
                          <BarChart data={daily}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(21,21,21,0.08)" />
                            <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="#64748b" />
                            <YAxis tick={{ fontSize: 12 }} stroke="#64748b" />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="calls" name={t('stats.kpi.calls', locale)} fill="#dc3545" radius={[4, 4, 0, 0]} />
                            <Bar dataKey="shares" name={t('stats.kpi.shares', locale)} fill="#0dcaf0" radius={[4, 4, 0, 0]} />
                            <Bar dataKey="chats" name={t('stats.kpi.chats', locale)} fill="#fecb01" radius={[4, 4, 0, 0]} />
                            <Bar dataKey="likes" name={t('stats.event.likes', locale)} fill="#198754" radius={[4, 4, 0, 0]} />
                            <Bar dataKey="comments" name={t('stats.event.comments', locale)} fill="#151515" radius={[4, 4, 0, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      )}
                    </div>
                  </div>
                </Tab>

                <Tab eventKey="reactions" title={locale === 'ar' ? 'التفاعلات' : 'Reactions'}>
                  <Row className="g-3">
                    <Col lg={5}>
                      <div className={styles.chartPanel}>
                        <div className="fw-bold mb-2" style={{ color: '#151515' }}>
                          {locale === 'ar' ? 'أنواع التفاعلات' : 'Reaction Types'}
                        </div>
                        <div style={{ width: '100%', height: 330 }}>
                          {loading && !data ? (
                            <div className={styles.panelSkeleton} />
                          ) : (
                            <ResponsiveContainer>
                              <PieChart>
                                <Tooltip />
                                <Legend />
                                <Pie data={reactionByTypeForChart} dataKey="value" nameKey="name" outerRadius={110} label>
                                  {reactionByTypeForChart.map((entry, i) => (
                                    <Cell key={i} fill={entry.color} />
                                  ))}
                                </Pie>
                              </PieChart>
                            </ResponsiveContainer>
                          )}
                        </div>
                      </div>
                    </Col>
                    <Col lg={7}>
                      <div className={styles.chartPanel}>
                        <div className="fw-bold mb-2" style={{ color: '#151515' }}>
                          {locale === 'ar' ? 'التفاعلات حسب اليوم والنوع' : 'Daily Reactions by Type'}
                        </div>
                        <div style={{ width: '100%', height: 330 }}>
                          {loading && !data ? (
                            <div className={styles.panelSkeleton} />
                          ) : (
                            <ResponsiveContainer>
                              <BarChart data={reactionDaily}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(21,21,21,0.08)" />
                                <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="#64748b" />
                                <YAxis tick={{ fontSize: 12 }} stroke="#64748b" />
                                <Tooltip />
                                <Legend />
                                {reactionTypes.map((type) => (
                                  <Bar
                                    key={type}
                                    dataKey={type}
                                    name={`${reactionEmojis[type]} ${reactionLabel(type, locale)}`}
                                    fill={reactionColors[type]}
                                    radius={[4, 4, 0, 0]}
                                  />
                                ))}
                              </BarChart>
                            </ResponsiveContainer>
                          )}
                        </div>
                        <div className="mt-2 d-flex flex-wrap gap-2">
                          {reactionByType.map((item) => (
                            <span key={item.type} className={styles.reactionChip} style={{ borderColor: `${item.color}44` }}>
                              <span>{item.emoji}</span>
                              <span className="fw-semibold">{item.name}</span>
                              <span className="text-muted">{formatNum(item.count)}</span>
                            </span>
                          ))}
                        </div>
                      </div>
                    </Col>
                  </Row>
                </Tab>

                {hasPromotionData && (
                  <Tab eventKey="promotion" title={locale === 'ar' ? 'التمييز' : 'Promotion'}>
                    <div className={`${styles.chartPanel} ${theme.chartPanel}`}>
                      <div className="fw-bold mb-2" style={{ color: '#151515' }}>
                        {locale === 'ar' ? 'أحداث التمييز اليومية' : 'Daily promotion events'}
                      </div>
                      <div style={{ width: '100%', height: 360 }}>
                        {loading && !data ? (
                          <div className={styles.panelSkeleton} />
                        ) : promotionDaily.every((d) =>
                          d.featured_impression + d.homepage_pin_view + d.popup_shown + d.popup_click + d.listing_boost_impression === 0,
                        ) ? (
                          <p className={theme.emptyText}>{t('stats.noData', locale)}</p>
                        ) : (
                          <ResponsiveContainer>
                            <BarChart data={promotionDaily}>
                              <CartesianGrid strokeDasharray="3 3" stroke="rgba(21,21,21,0.08)" />
                              <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="#64748b" />
                              <YAxis tick={{ fontSize: 12 }} stroke="#64748b" />
                              <Tooltip />
                              <Legend />
                              <Bar dataKey="featured_impression" name={locale === 'ar' ? 'ظهور مميز' : 'Featured'} fill="#f59e0b" radius={[4, 4, 0, 0]} />
                              <Bar dataKey="homepage_pin_view" name={locale === 'ar' ? 'الرئيسية' : 'Homepage pin'} fill="#d97706" radius={[4, 4, 0, 0]} />
                              <Bar dataKey="popup_shown" name={locale === 'ar' ? 'عرض منبثق' : 'Popup views'} fill="#b45309" radius={[4, 4, 0, 0]} />
                              <Bar dataKey="popup_click" name={locale === 'ar' ? 'نقرات منبثق' : 'Popup clicks'} fill="#92400e" radius={[4, 4, 0, 0]} />
                              <Bar dataKey="listing_boost_impression" name={locale === 'ar' ? 'تعزيز القوائم' : 'Listing boost'} fill="#ca8a04" radius={[4, 4, 0, 0]} />
                            </BarChart>
                          </ResponsiveContainer>
                        )}
                      </div>
                    </div>
                  </Tab>
                )}

                <Tab eventKey="audience" title={t('stats.tabs.audience', locale)}>
                  <div className={`${styles.chartPanel} ${theme.chartPanel}`}>
                    <div className="fw-bold mb-2" style={{ color: '#151515' }}>
                      {t('stats.top.userAgents', locale)}
                    </div>
                    <div className="table-responsive">
                      <table className={`table table-sm mb-0 ${theme.audienceTable}`}>
                        <thead>
                          <tr>
                            <th>{t('stats.ua', locale)}</th>
                            <th className="text-end">{t('stats.count', locale)}</th>
                          </tr>
                        </thead>
                        <tbody>
                          {loading && !data && (
                            <tr>
                              <td colSpan={2}>
                                <Placeholder animation="glow">
                                  <Placeholder xs={12} />
                                  <Placeholder xs={10} />
                                  <Placeholder xs={8} />
                                </Placeholder>
                              </td>
                            </tr>
                          )}
                          {(data?.top?.user_agents ?? []).map((row, idx) => (
                            <tr key={idx}>
                              <td className="text-break">{row.user_agent}</td>
                              <td className="text-end fw-semibold">{formatNum(Number(row.count ?? 0))}</td>
                            </tr>
                          ))}
                          {(!data?.top?.user_agents || data.top.user_agents.length === 0) && (
                            <tr>
                              <td colSpan={2} className="text-muted">
                                {t('stats.noData', locale)}
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </Tab>
              </Tabs>
            </Card.Body>
          </Card>
        </motion.div>
          </div>
        </motion.div>
      </Container>
      </div>
    </div>
  )
}
