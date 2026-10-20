'use client'

import Link from 'next/link'
import { useEffect } from 'react'
import { useParams, usePathname } from 'next/navigation'
import { BsChatDots, BsCompass, BsHouse, BsPerson, BsShop } from 'react-icons/bs'

import { DEFAULT_LOCALE, isSupportedLocale, type SupportedLocale } from '@/lib/localization'

import styles from './MobileProductNav.module.css'

const ITEMS = [
  { id: 'home', ar: 'الرئيسية', en: 'Home', icon: BsHouse, path: '' },
  { id: 'explore', ar: 'استكشف', en: 'Explore', icon: BsCompass, path: '/search' },
  { id: 'market', ar: 'السوق', en: 'Market', icon: BsShop, path: '/market-pulse' },
  { id: 'messages', ar: 'الرسائل', en: 'Messages', icon: BsChatDots, path: '/messaging' },
  { id: 'account', ar: 'حسابي', en: 'Account', icon: BsPerson, path: '/settings/account' },
] as const

function isActive(pathname: string, locale: string, path: string) {
  const href = `/${locale}${path}`
  if (!path) return pathname === `/${locale}` || pathname === `/${locale}/`
  if (path === '/market-pulse') {
    return pathname.startsWith(href) || pathname.includes('/sections/') || pathname.includes('/stores') || pathname.includes('/pages/auction')
  }
  if (path === '/settings/account') {
    return pathname.includes('/settings') || pathname.includes('/profile') || pathname.includes('/my-posts')
  }
  return pathname === href || pathname.startsWith(`${href}/`)
}

export default function MobileProductNav() {
  const params = useParams<{ locale?: string }>()
  const pathname = usePathname() || ''
  const fromParams = Array.isArray(params?.locale) ? params.locale[0] : params?.locale
  const locale: SupportedLocale = fromParams && isSupportedLocale(fromParams) ? fromParams : DEFAULT_LOCALE
  const hidden = pathname.includes('/auth/')

  useEffect(() => {
    const root = document.documentElement
    if (hidden) {
      root.classList.remove('ananas-has-product-nav')
      return
    }
    root.classList.add('ananas-has-product-nav')
    return () => root.classList.remove('ananas-has-product-nav')
  }, [hidden])

  if (hidden) return null

  return (
    <>
      <style>{`@media (max-width:991.98px){html.ananas-has-product-nav body{padding-bottom:calc(68px + env(safe-area-inset-bottom))}}@media (min-width:992px){html.ananas-has-product-nav body{padding-bottom:0}}`}</style>
      <nav className={styles.nav} aria-label={locale === 'ar' ? 'تنقل أناناس' : 'ANANAS navigation'}>
      {ITEMS.map((item) => {
        const Icon = item.icon
        const active = isActive(pathname, locale, item.path)
        return (
          <Link
            key={item.id}
            href={`/${locale}${item.path}`}
            className={active ? styles.itemActive : styles.item}
            aria-current={active ? 'page' : undefined}
          >
            <Icon size={18} aria-hidden />
            <span>{locale === 'ar' ? item.ar : item.en}</span>
          </Link>
        )
      })}
    </nav>
    </>
  )
}
