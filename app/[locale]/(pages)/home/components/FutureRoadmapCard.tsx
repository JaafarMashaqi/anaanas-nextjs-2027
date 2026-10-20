import { t } from '@/lib/translations'
import type { SupportedLocale } from '@/lib/localization'
import styles from './FutureRoadmapCard.module.css'

const ROADMAP_ITEMS: { icon: string; key: 'home.roadmap.pro' | 'home.roadmap.gold' | 'home.roadmap.family' }[] = [
  { icon: '🧠', key: 'home.roadmap.pro' },
  { icon: '🏆', key: 'home.roadmap.gold' },
  { icon: '🎁', key: 'home.roadmap.family' },
]

export default function FutureRoadmapCard({ locale }: { locale: SupportedLocale }) {
  return (
    <div className={styles.root}>
      <div className={styles.glowOrbs} aria-hidden>
        <span className={`${styles.orb} ${styles.orb1}`} />
        <span className={`${styles.orb} ${styles.orb2}`} />
        <span className={`${styles.orb} ${styles.orb3}`} />
      </div>

      <div className={styles.header}>
        <h2 className={styles.title}>
          <span className={styles.liveDot} aria-hidden />
          <span className={styles.titleText}>
            {t('home.futureRoadmap', locale)}
            <span className={styles.titleSub}> · {t('home.comingSoon', locale)}</span>
          </span>
        </h2>
        <p className={styles.note}>
          {locale === 'ar'
            ? 'استوديو الإعلان وهذه العضويات غير مربوطة بالدفع. لا يمكن شراؤها من هنا.'
            : 'Ad studio and these memberships are not connected to billing. They cannot be purchased here.'}
        </p>
        <div className={styles.pulseStrip} aria-hidden>
          <span className={styles.pulseBar} />
          <span className={styles.pulseBar} />
          <span className={styles.pulseBar} />
          <span className={styles.pulseBar} />
        </div>
      </div>

      <div className={styles.rows}>
        {ROADMAP_ITEMS.map((item) => (
          <div key={item.key} className={styles.row}>
            <div className={styles.left}>
              <div className={styles.iconWrap}>
                <span aria-hidden>{item.icon}</span>
              </div>
              <div className={styles.textBlock}>
                <span className={styles.itemTitle}>{t(item.key, locale)}</span>
              </div>
            </div>
            <span
              className={styles.phaseChip}
              role="img"
              aria-label={t('home.comingSoon', locale)}
              title={t('home.comingSoon', locale)}
            >
              ⏳
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
