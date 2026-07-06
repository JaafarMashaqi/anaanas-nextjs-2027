'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { motion, useReducedMotion } from 'motion/react'
import { Tab, Tabs } from 'react-bootstrap'
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
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { BsBarChartLineFill } from 'react-icons/bs'
import AnanasStatsMascot from '@/components/statistics/AnanasStatsMascot'
import {
  CHART_PALETTE,
  PROMOTION_KPI_META,
  REACTION_COLORS,
  REACTION_EMOJIS,
  REACTION_TYPES,
  daysAgoISO,
  eventLabel,
  formatStatNum,
  listItemVariants,
  reactionLabel,
  todayISO,
  type ReactionTypeKey,
  type StatsKpi,
} from '@/components/statistics/statsUtils'
import theme from '@/components/statistics/statsTheme.module.css'
import { t } from '@/lib/translations'
import type { SupportedLocale } from '@/lib/localization'

type StatsData = {
  range: { from: string; to: string }
  totals: Record<string, number>
  daily: Array<Record<string, number | string>>
  breakdown: Array<{ event: string; count: number }>
  status_breakdown?: Array<{ status: string | null; count: number }>
  top?: {
    user_agents?: Array<{ user_agent: string; count: number }>
    posts?: Array<{ post_id: number; title: string; views: number }>
  }
  reactions?: {
    by_type?: Array<{ type: string; count: number }>
    daily_by_type?: Array<Record<string, number | string>>
  }
  promotion_totals?: Record<string, number>
  promotion_daily?: Array<Record<string, number | string>>
  featured_posts_count?: number
}

type MetricKey = 'impressions' | 'unique_impressions' | 'views' | 'likes' | 'comments' | 'shares' | 'chats' | 'calls'

export default function ProfileStatisticsClient({
  locale = 'ar',
  initial,
}: {
  locale?: SupportedLocale
  initial: StatsData | null
}) {
  const reducedMotion = useReducedMotion()
  const isAr = locale === 'ar'

  const [from, setFrom] = useState<string>(initial?.range?.from ?? '')
  const [to, setTo] = useState<string>(initial?.range?.to ?? '')
  const [data, setData] = useState<StatsData | null>(initial)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [metric, setMetric] = useState<MetricKey>('impressions')

  const apply = async (nextFrom = from, nextTo = to) => {
    setLoading(true)
    setError(null)
    try {
      const qs = new URLSearchParams()
      if (nextFrom) qs.set('from', nextFrom)
      if (nextTo) qs.set('to', nextTo)
      const res = await fetch(`/api/posts/my-statistics?${qs.toString()}`, {
        method: 'GET',
        headers: { Accept: 'application/json' },
        cache: 'no-store',
      })
      const json = await res.json().catch(() => ({}))
      if (!res.ok || !json?.success) throw new Error(json?.message || t('profile.stats.loadError', locale))
      setData(json.data as StatsData)
    } catch (e) {
      setError(e instanceof Error ? e.message : t('profile.stats.loadError', locale))
    } finally {
      setLoading(false)
    }
  }

  const setPreset = (days: number) => {
    const nf = daysAgoISO(days - 1)
    const nt = todayISO()
    setFrom(nf)
    setTo(nt)
    void apply(nf, nt)
  }

  useEffect(() => {
    if (initial?.range?.from && initial?.range?.to) return
    const nf = daysAgoISO(29)
    const nt = todayISO()
    setFrom(nf)
    setTo(nt)
  }, [initial?.range?.from, initial?.range?.to])

  const daily = Array.isArray(data?.daily) ? data!.daily : []
  const totals = data?.totals ?? {}
  const rangeHint = `${from} → ${to}`

  const kpis: StatsKpi[] = useMemo(
    () => [
      { key: 'total_posts', label: t('profile.stats.totalPosts', locale), value: Number(totals.total_posts ?? 0), color: '#177dc1', hint: isAr ? 'إجمالي (كل الوقت)' : 'Lifetime' },
      { key: 'active_posts', label: t('profile.stats.activePosts', locale), value: Number(totals.active_posts ?? 0), color: '#0cbc87', hint: isAr ? 'نشط الآن' : 'Currently active' },
      { key: 'impressions', label: t('stats.kpi.impressions', locale), value: Number(totals.impressions ?? 0), color: '#177dc1', hint: rangeHint },
      { key: 'unique_impressions', label: t('stats.kpi.uniqueImpressions', locale), value: Number(totals.unique_impressions ?? 0), color: '#ba7bff', hint: rangeHint },
      { key: 'views', label: t('stats.kpi.views', locale), value: Number(totals.views ?? 0), color: '#151515', hint: rangeHint },
      { key: 'interactions', label: t('profile.stats.interactions', locale), value: Number(totals.interactions ?? 0), color: '#fecb01', hint: rangeHint },
      { key: 'likes', label: t('stats.event.likes', locale), value: Number(totals.likes ?? 0), color: '#1877f2', hint: rangeHint },
      { key: 'comments', label: t('stats.event.comments', locale), value: Number(totals.post_comments ?? totals.comments ?? 0), color: '#6610f2', hint: rangeHint },
      { key: 'calls', label: t('stats.kpi.calls', locale), value: Number(totals.calls ?? 0), color: '#e76f51', hint: rangeHint },
      { key: 'shares', label: t('stats.kpi.shares', locale), value: Number(totals.shares ?? 0), color: '#4f9ef8', hint: rangeHint },
      { key: 'chats', label: t('stats.kpi.chats', locale), value: Number(totals.chats ?? 0), color: '#f59e0b', hint: rangeHint },
      { key: 'unlikes', label: t('stats.event.unlikes', locale), value: Number(totals.unlikes ?? 0), color: '#64748b', hint: rangeHint },
    ],
    [totals, locale, isAr, rangeHint],
  )

  const promotionKpis = useMemo(() => {
    const src = data?.promotion_totals ?? {}
    return Object.entries(PROMOTION_KPI_META).map(([key, meta]) => ({
      key,
      label: isAr ? meta.ar : meta.en,
      value: Number(src[key] ?? 0),
      color: meta.color,
      hint: rangeHint,
    }))
  }, [data, isAr, rangeHint])

  const breakdownForChart = useMemo(() => {
    const src = Array.isArray(data?.breakdown) ? data!.breakdown : []
    return src
      .filter((x) => (x?.count ?? 0) > 0)
      .map((x) => ({ name: eventLabel(x.event, locale), value: Number(x.count ?? 0) }))
  }, [data, locale])

  const reactionByType = useMemo(() => {
    const src = Array.isArray(data?.reactions?.by_type) ? data!.reactions!.by_type! : []
    return REACTION_TYPES.map((type) => {
      const found = src.find((x) => String(x.type).toLowerCase() === type)
      return {
        type,
        name: reactionLabel(type, locale),
        emoji: REACTION_EMOJIS[type],
        color: REACTION_COLORS[type],
        count: Number(found?.count ?? 0),
      }
    })
  }, [data, locale])

  const reactionDaily = useMemo(() => {
    const src = Array.isArray(data?.reactions?.daily_by_type) ? data!.reactions!.daily_by_type! : []
    return src.map((row) => {
      const out: Record<string, number | string> = { date: String(row.date) }
      REACTION_TYPES.forEach((type) => {
        out[type] = Number(row[type] ?? 0)
      })
      return out
    })
  }, [data])

  const metricOptions: Array<{ key: MetricKey; label: string; color: string }> = [
    { key: 'impressions', label: t('stats.kpi.impressions', locale), color: '#177dc1' },
    { key: 'unique_impressions', label: t('stats.kpi.uniqueImpressions', locale), color: '#ba7bff' },
    { key: 'views', label: t('stats.kpi.views', locale), color: '#151515' },
    { key: 'likes', label: t('stats.event.likes', locale), color: '#1877f2' },
    { key: 'comments', label: t('stats.event.comments', locale), color: '#6610f2' },
    { key: 'shares', label: t('stats.event.shares', locale), color: '#4f9ef8' },
    { key: 'chats', label: t('stats.kpi.chats', locale), color: '#f59e0b' },
    { key: 'calls', label: t('stats.kpi.calls', locale), color: '#0cbc87' },
  ]
  const activeMetric = metricOptions.find((m) => m.key === metric) ?? metricOptions[0]

  const topPosts = Array.isArray(data?.top?.posts) ? data!.top!.posts! : []
  const topAgents = Array.isArray(data?.top?.user_agents) ? data!.top!.user_agents! : []

  const dailyInteractions = useMemo(
    () =>
      daily.map((d) => ({
        date: String(d.date),
        interactions:
          Number(d.likes ?? 0) + Number(d.comments ?? 0) + Number(d.shares ?? 0) + Number(d.chats ?? 0) + Number(d.calls ?? 0),
      })),
    [daily],
  )

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

  const hasPromotionData =
    promotionKpis.some((k) => k.value > 0) || Number(data?.featured_posts_count ?? 0) > 0

  const renderKpiGrid = (items: StatsKpi[], promo = false) => (
    <div className={theme.kpiGrid}>
      {items.map((k, idx) => (
        <motion.div
          key={k.key}
          className={`${theme.kpiCard} ${promo ? theme.kpiPromo : ''}`}
          custom={idx}
          variants={listItemVariants}
          initial={reducedMotion ? false : 'hidden'}
          animate="show"
          whileHover={reducedMotion ? undefined : { y: -3 }}
        >
          <div className={theme.kpiLabel}>{loading && !data ? '…' : k.label}</div>
          <div className={theme.kpiValue} style={{ color: k.color }}>
            {loading && !data ? '—' : formatStatNum(k.value, locale)}
          </div>
          {k.hint && <div className={theme.kpiHint}>{k.hint}</div>}
        </motion.div>
      ))}
    </div>
  )

  return (
    <div className={theme.pageRoot} dir={isAr ? 'rtl' : 'ltr'}>
      <div className={theme.container}>
        <motion.section
          className={theme.shell}
          initial={reducedMotion ? false : { opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.38 }}
        >
          <div className={theme.hero}>
            <div className={theme.heroMesh} aria-hidden />
            <div className={theme.heroInner}>
              <div className={theme.heroCopy}>
                <div className={theme.heroTitleRow}>
                  <h1 className={theme.heroTitle}>
                    <BsBarChartLineFill aria-hidden />
                    {t('profile.stats.title', locale)}
                  </h1>
                </div>
                <p className={theme.heroSubtitle}>{t('profile.stats.subtitle', locale)}</p>
              </div>
              <AnanasStatsMascot />
            </div>
          </div>

          <div className={theme.toolbar}>
            <div className={theme.toolbarGrid}>
              <div>
                <label className={theme.fieldLabel}>{t('stats.from', locale)}</label>
                <input type="date" className={theme.dateInput} value={from} onChange={(e) => setFrom(e.target.value)} />
              </div>
              <div>
                <label className={theme.fieldLabel}>{t('stats.to', locale)}</label>
                <input type="date" className={theme.dateInput} value={to} onChange={(e) => setTo(e.target.value)} />
              </div>
              <div className={theme.toolbarActions}>
                <button type="button" className={theme.btnPrimary} disabled={loading} onClick={() => void apply()}>
                  {loading ? t('stats.loading', locale) : t('stats.apply', locale)}
                </button>
                <button type="button" className={theme.btnGhost} disabled={loading} onClick={() => setPreset(7)}>
                  {t('stats.preset.7d', locale)}
                </button>
                <button type="button" className={theme.btnGhost} disabled={loading} onClick={() => setPreset(30)}>
                  {t('stats.preset.30d', locale)}
                </button>
                <button type="button" className={theme.btnGhost} disabled={loading} onClick={() => setPreset(90)}>
                  {t('stats.preset.90d', locale)}
                </button>
              </div>
            </div>
            {error && <div className={theme.errorBanner}>{error}</div>}
          </div>

          <div className={theme.body}>
            {renderKpiGrid(kpis)}
            {promotionKpis.some((k) => k.value > 0) && (
              <>
                <h2 className={theme.sectionTitle}>{isAr ? 'إحصائيات التمييز' : 'Promotion analytics'}</h2>
                {renderKpiGrid(promotionKpis.filter((k) => k.value > 0), true)}
              </>
            )}

            <div className={`${theme.tabsShell} mt-2`}>
              <Tabs defaultActiveKey="overview" className="mb-3">
                <Tab eventKey="overview" title={t('stats.tabs.overview', locale)}>
                  <div className={theme.metricPicker}>
                    {metricOptions.map((m) => (
                      <button
                        key={m.key}
                        type="button"
                        className={`${theme.metricPill} ${metric === m.key ? theme.metricPillActive : ''}`}
                        onClick={() => setMetric(m.key)}
                      >
                        {m.label}
                      </button>
                    ))}
                  </div>
                  <div className={theme.gridMainSide}>
                    <div className={theme.chartPanel}>
                      <h3 className={theme.sectionTitle}>{t('profile.stats.dailyTitle', locale)}</h3>
                      <div className={theme.chartArea}>
                        {loading && !data ? (
                          <div className={theme.panelSkeleton} />
                        ) : (
                          <ResponsiveContainer>
                            <LineChart data={daily}>
                              <CartesianGrid strokeDasharray="3 3" stroke="rgba(30,24,18,0.08)" />
                              <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                              <YAxis tick={{ fontSize: 11 }} />
                              <Tooltip />
                              <Legend />
                              <Line type="monotone" dataKey={activeMetric.key} name={activeMetric.label} stroke={activeMetric.color} strokeWidth={2} dot={false} />
                            </LineChart>
                          </ResponsiveContainer>
                        )}
                      </div>
                    </div>
                    <div className={theme.chartPanel}>
                      <h3 className={theme.sectionTitle}>{t('profile.stats.breakdownTitle', locale)}</h3>
                      <div className={theme.chartArea}>
                        {breakdownForChart.length === 0 ? (
                          <p className={theme.emptyText}>{t('profile.stats.emptyBreakdown', locale)}</p>
                        ) : (
                          <ResponsiveContainer>
                            <PieChart>
                              <Pie data={breakdownForChart} dataKey="value" nameKey="name" innerRadius={52} outerRadius={82} paddingAngle={2}>
                                {breakdownForChart.map((_, idx) => (
                                  <Cell key={idx} fill={CHART_PALETTE[idx % CHART_PALETTE.length]} />
                                ))}
                              </Pie>
                              <Tooltip />
                              <Legend />
                            </PieChart>
                          </ResponsiveContainer>
                        )}
                      </div>
                    </div>
                  </div>
                </Tab>

                <Tab eventKey="interactions" title={t('stats.tabs.interactions', locale) ?? (isAr ? 'التفاعلات' : 'Interactions')}>
                  <div className={theme.grid2}>
                    <div className={theme.chartPanel}>
                      <h3 className={theme.sectionTitle}>{t('profile.stats.interactionsDaily', locale)}</h3>
                      <div className={theme.chartAreaSm}>
                        <ResponsiveContainer>
                          <BarChart data={dailyInteractions}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                            <YAxis tick={{ fontSize: 11 }} />
                            <Tooltip />
                            <Bar dataKey="interactions" fill="#ba7bff" radius={[6, 6, 0, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                    <div className={theme.chartPanel}>
                      <h3 className={theme.sectionTitle}>{isAr ? 'تفاعلات يومية' : 'Daily engagement'}</h3>
                      <div className={theme.chartAreaSm}>
                        <ResponsiveContainer>
                          <BarChart data={daily}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                            <YAxis tick={{ fontSize: 11 }} />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="likes" fill="#1877f2" radius={[4, 4, 0, 0]} />
                            <Bar dataKey="comments" fill="#6610f2" radius={[4, 4, 0, 0]} />
                            <Bar dataKey="shares" fill="#4f9ef8" radius={[4, 4, 0, 0]} />
                            <Bar dataKey="calls" fill="#0cbc87" radius={[4, 4, 0, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </div>
                </Tab>

                <Tab eventKey="reactions" title={isAr ? 'التفاعلات التعبيرية' : 'Reactions'}>
                  <div className={theme.gridMainSide}>
                    <div className={theme.chartPanel}>
                      <div className={theme.chartAreaSm}>
                        <ResponsiveContainer>
                          <PieChart>
                            <Pie
                              data={reactionByType.filter((x) => x.count > 0).map((x) => ({ name: `${x.emoji} ${x.name}`, value: x.count }))}
                              dataKey="value"
                              nameKey="name"
                              innerRadius={48}
                              outerRadius={78}
                            >
                              {reactionByType.filter((x) => x.count > 0).map((x) => (
                                <Cell key={x.type} fill={x.color} />
                              ))}
                            </Pie>
                            <Tooltip />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                      <div className="d-flex flex-wrap gap-2 mt-2">
                        {reactionByType.map((r) => (
                          <span key={r.type} className={theme.reactionChip}>
                            {r.emoji} {r.name}: {formatStatNum(r.count, locale)}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className={theme.chartPanel}>
                      <div className={theme.chartArea}>
                        <ResponsiveContainer>
                          <BarChart data={reactionDaily}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                            <YAxis tick={{ fontSize: 10 }} />
                            <Tooltip />
                            <Legend />
                            {REACTION_TYPES.map((type) => (
                              <Bar key={type} dataKey={type} stackId="r" fill={REACTION_COLORS[type]} />
                            ))}
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </div>
                </Tab>

                <Tab eventKey="audience" title={t('stats.tabs.audience', locale)}>
                  <div className={theme.chartPanel}>
                    {topAgents.length === 0 ? (
                      <p className={theme.emptyText}>{isAr ? 'لا توجد بيانات جمهور بعد.' : 'No audience data yet.'}</p>
                    ) : (
                      <table className={theme.audienceTable}>
                        <thead>
                          <tr>
                            <th>{isAr ? 'المتصفح / الجهاز' : 'Browser / device'}</th>
                            <th>{isAr ? 'الظهور' : 'Impressions'}</th>
                          </tr>
                        </thead>
                        <tbody>
                          {topAgents.map((row) => (
                            <tr key={row.user_agent}>
                              <td>{row.user_agent}</td>
                              <td>{formatStatNum(row.count, locale)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                </Tab>

                {hasPromotionData && (
                  <Tab eventKey="promotion" title={isAr ? 'التمييز' : 'Promotion'}>
                    <div className={theme.chartPanel}>
                      <h3 className={theme.sectionTitle}>{isAr ? 'أحداث التمييز اليومية' : 'Daily promotion events'}</h3>
                      <div className={theme.chartArea}>
                        {promotionDaily.every(
                          (d) =>
                            d.featured_impression +
                              d.homepage_pin_view +
                              d.popup_shown +
                              d.popup_click +
                              d.listing_boost_impression ===
                            0,
                        ) ? (
                          <p className={theme.emptyText}>{isAr ? 'لا توجد أحداث تمييز في هذه الفترة.' : 'No promotion events in this period.'}</p>
                        ) : (
                          <ResponsiveContainer>
                            <BarChart data={promotionDaily}>
                              <CartesianGrid strokeDasharray="3 3" stroke="rgba(30,24,18,0.08)" />
                              <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                              <YAxis tick={{ fontSize: 11 }} />
                              <Tooltip />
                              <Legend />
                              <Bar dataKey="featured_impression" name={isAr ? 'ظهور مميز' : 'Featured'} fill="#f59e0b" radius={[4, 4, 0, 0]} />
                              <Bar dataKey="homepage_pin_view" name={isAr ? 'الرئيسية' : 'Homepage pin'} fill="#d97706" radius={[4, 4, 0, 0]} />
                              <Bar dataKey="popup_shown" name={isAr ? 'عرض منبثق' : 'Popup views'} fill="#b45309" radius={[4, 4, 0, 0]} />
                              <Bar dataKey="popup_click" name={isAr ? 'نقرات منبثق' : 'Popup clicks'} fill="#92400e" radius={[4, 4, 0, 0]} />
                              <Bar dataKey="listing_boost_impression" name={isAr ? 'تعزيز القوائم' : 'Listing boost'} fill="#ca8a04" radius={[4, 4, 0, 0]} />
                            </BarChart>
                          </ResponsiveContainer>
                        )}
                      </div>
                    </div>
                  </Tab>
                )}

                <Tab eventKey="posts" title={isAr ? 'أفضل الإعلانات' : 'Top listings'}>
                  {topPosts.length === 0 ? (
                    <p className={theme.emptyText}>{isAr ? 'لا توجد مشاهدات في هذه الفترة.' : 'No views in this period.'}</p>
                  ) : (
                    <ul className={theme.topPostsList}>
                      {topPosts.map((p) => (
                        <li key={p.post_id}>
                          <Link href={`/${locale}/post/${p.post_id}/statistics`} className={theme.topPostRow}>
                            <span className={theme.topPostTitle}>{p.title || `#${p.post_id}`}</span>
                            <span className={theme.topPostMetric}>{formatStatNum(p.views, locale)} {isAr ? 'مشاهدة' : 'views'}</span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </Tab>
              </Tabs>
            </div>

            {Array.isArray(data?.status_breakdown) && data!.status_breakdown!.length > 0 && (
              <div className={`${theme.chartPanel} mt-3`}>
                <h3 className={theme.sectionTitle}>{t('profile.stats.statusBreakdown', locale)}</h3>
                <div className={theme.chartAreaSm}>
                  <ResponsiveContainer>
                    <BarChart
                      data={data!.status_breakdown!.map((s) => ({
                        status: s.status || t('profile.stats.statusUnknown', locale),
                        count: s.count,
                      }))}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="status" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 11 }} />
                      <Tooltip />
                      <Bar dataKey="count" fill="#177dc1" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}
          </div>
        </motion.section>
      </div>
    </div>
  )
}
