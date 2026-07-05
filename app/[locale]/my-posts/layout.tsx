'use client'

import { useEffect } from 'react'
import { useParams, usePathname, useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { DEFAULT_LOCALE, isSupportedLocale } from '@/lib/localization'

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
      <div className="d-flex justify-content-center align-items-center py-5">
        <div className="spinner-border text-primary" role="status" aria-hidden="true" />
      </div>
    )
  }

  return children
}
