'use client'

import { useEffect } from 'react'
import { useParams, usePathname, useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { DEFAULT_LOCALE, isSupportedLocale } from '@/lib/localization'
import styles from './myPosts.module.css'

export default function MyPostsLayout({ children }: { children: React.ReactNode }) {
  const { status } = useSession()
  const router = useRouter()
  const pathname = usePathname()
  const params = useParams<{ locale?: string }>()
  const localeParam = Array.isArray(params?.locale) ? params.locale[0] : params?.locale
  const locale = localeParam && isSupportedLocale(localeParam) ? localeParam : DEFAULT_LOCALE

  useEffect(() => {
    if (status === 'unauthenticated') {
      const next = encodeURIComponent(pathname || `/${locale}/my-posts`)
      router.replace(`/${locale}/auth/sign-in?callbackUrl=${next}`)
    }
  }, [status, router, pathname, locale])

  if (status === 'loading' || status === 'unauthenticated') {
    return (
      <main className={styles.page}>
        <div className={styles.container}>
          <div className={styles.shell}>
            <div className={styles.loadingShell}>
              <div className={styles.skeletonHero} />
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className={styles.skeletonRow} />
              ))}
            </div>
          </div>
        </div>
      </main>
    )
  }

  return children
}
