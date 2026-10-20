import type { Metadata, Viewport } from 'next'
import { headers } from 'next/headers'
import { Cairo, Inter } from 'next/font/google'
import NextTopLoader from 'nextjs-toploader'
import type { ReactNode } from 'react'
import Script from 'next/script'

import { DEFAULT_PAGE_TITLE } from '@/context/constants'
import { DEFAULT_LOCALE, isSupportedLocale } from '@/lib/localization'
import type { SupportedLocale } from '@/lib/localization'
import { isIndexingBotUserAgent } from '@/lib/seo/indexingBot'
import { getPublicSiteOrigin } from '@/lib/seo/siteUrl'
import { SPLASH_ENABLE_DELAY_MS } from '@/lib/perf/week1HomePerf'
import { isPreviewCountryMode } from '@/lib/preview/countryMode'

import logo from '@/assets/images/logo/logo500.png'
import faviconIco from '@/assets/favicon.ico'

import '@/assets/scss/style.scss'

import AppProvidersWrapper from '@/components/wrappers/AppProvidersWrapper'

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
  adjustFontFallback: true,
})

const cairo = Cairo({
  subsets: ['latin', 'arabic'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
  adjustFontFallback: true,
})

export const metadata: Metadata = {
  metadataBase: new URL(getPublicSiteOrigin()),
  title: {
    template: '%s | منصه اناناس للاعلانات الرقمية والتسويق والتجارة الاولى في الوطن العربي',
    default: DEFAULT_PAGE_TITLE,
  },
  description:
    'منصه اناناس للاعلانات الرقمية والتسويق والتجارة الاولى في الوطن العربي',
  applicationName: 'ANANAS',
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any', type: 'image/x-icon' },
      {
        url: typeof faviconIco === 'string' ? faviconIco : faviconIco.src,
        sizes: 'any',
        type: 'image/x-icon',
      },
    ],
    shortcut: '/favicon.ico',
    apple: '/favicon.ico',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#101828',
}

function resolveLocaleFromHeaderList(headersList: { get(name: string): string | null }): SupportedLocale {
  const localeFromHeader = headersList.get('x-locale')
  if (localeFromHeader && isSupportedLocale(localeFromHeader)) {
    return localeFromHeader
  }
  return DEFAULT_LOCALE
}

const localeStylesheetMap: Record<SupportedLocale, string> = {
  ar: '/styles/lang-ar.css?v=neo1',
  en: '/styles/lang-en.css?v=neo1',
}

function SplashScreen() {
  return (
    <div id="splash-screen" aria-hidden="true">
      <div className="splash-gradient" />
      <div className="splash-orb splash-orb--a" />
      <div className="splash-orb splash-orb--b" />
      <div className="splash-orb splash-orb--c" />

      <span className="splash-spark splash-spark--1" />
      <span className="splash-spark splash-spark--2" />
      <span className="splash-spark splash-spark--3" />
      <span className="splash-spark splash-spark--4" />
      <span className="splash-spark splash-spark--5" />
      <span className="splash-spark splash-spark--6" />

      <div className="splash-stage">
        <svg className="splash-ring splash-ring--outer" viewBox="0 0 240 240" fill="none" aria-hidden="true">
          <defs>
            <linearGradient id="splashRingGrad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#FFD166" />
              <stop offset="50%" stopColor="#F4A261" />
              <stop offset="100%" stopColor="#E76F51" />
            </linearGradient>
            <linearGradient id="splashArcGrad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#F4A261" stopOpacity="0" />
              <stop offset="50%" stopColor="#E76F51" stopOpacity="1" />
              <stop offset="100%" stopColor="#BA7BFF" stopOpacity="0" />
            </linearGradient>
          </defs>
          <circle
            cx="120"
            cy="120"
            r="110"
            stroke="url(#splashRingGrad)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeDasharray="2 10"
          />
          <circle
            cx="120"
            cy="120"
            r="110"
            stroke="url(#splashArcGrad)"
            strokeWidth="3"
            strokeLinecap="round"
            strokeDasharray="110 580"
          />
        </svg>
        <svg className="splash-ring splash-ring--inner" viewBox="0 0 240 240" fill="none" aria-hidden="true">
          <circle
            cx="120"
            cy="120"
            r="92"
            stroke="rgba(244,162,97,.55)"
            strokeWidth="1.25"
            strokeLinecap="round"
            strokeDasharray="3 14"
          />
        </svg>
        <div className="splash-pulse splash-pulse--1" />
        <div className="splash-pulse splash-pulse--2" />
        <div className="splash-pulse splash-pulse--3" />

        <div className="splash-logoWrap">
          <div className="splash-logoHalo" />
          <img
            alt=""
            src={typeof logo === 'string' ? logo : (logo as { src: string }).src}
            className="splash-logo"
            decoding="async"
            fetchPriority="low"
          />
        </div>
      </div>

      <div className="splash-brand">
        <span className="splash-brand__bar">
          <span className="splash-brand__barFill" />
        </span>
        <span className="splash-brand__meta">
          <span className="splash-brand__dot" />
          <span className="splash-brand__dot" />
          <span className="splash-brand__dot" />
        </span>
      </div>
    </div>
  )
}

const RootLayout = async ({ children }: Readonly<{ children: ReactNode }>) => {
  const headersList = await headers()
  const locale = resolveLocaleFromHeaderList(headersList)
  const direction = locale === 'ar' ? 'rtl' : 'ltr'
  const localeStylesheet = localeStylesheetMap[locale]
  const localeClassName = direction === 'rtl' ? 'is-rtl' : 'is-ltr'

  const userAgent = headersList.get('user-agent')
  const isIndexingBot = isIndexingBotUserAgent(userAgent)

  return (
    <html
      lang={locale}
      dir={direction}
      data-locale={locale}
      data-preview-country={isPreviewCountryMode() ? '1' : undefined}
      data-indexing-bot={isIndexingBot ? '1' : undefined}

      suppressHydrationWarning
    >
      <head suppressHydrationWarning>
        {/* Splash delayed so LCP can target real page content, not the logo overlay. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `setTimeout(function(){var root=document.getElementById("__next_splash");if(!root||root.childNodes.length===0){document.documentElement.classList.add("js-splash")}},${SPLASH_ENABLE_DELAY_MS})`,
          }}
        />
        <noscript>
          <style>{`#splash-screen{display:none!important;visibility:hidden!important;pointer-events:none!important}`}</style>
        </noscript>
        <style>{`@media (max-width:991.98px){.ananas-desktop-only{display:none!important}}@media (min-width:992px){.ananas-mobile-only{display:none!important}}#splash-screen{pointer-events:none!important}`}</style>
        {/* Blocking load: locale CSS (RTL/LTR tweaks, container, etc.) must apply reliably — async print→all can miss onLoad when cached. */}
        <link rel="stylesheet" href={localeStylesheet} />
      </head>
      <body
        className={`${locale === 'ar' ? cairo.className : inter.className} ${localeClassName}`}
        data-locale={locale}
        data-dir={direction}
        suppressHydrationWarning
      >
        {!isIndexingBot ? (
          <>
            <Script
              src="https://www.googletagmanager.com/gtag/js?id=G-J0WJ2TCK23"
              strategy="lazyOnload"
            />
            <Script id="google-analytics" strategy="lazyOnload">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', 'G-J0WJ2TCK23');
              `}
            </Script>
          </>
        ) : null}

        {!isIndexingBot ? <SplashScreen /> : null}

        {!isIndexingBot ? (
          <NextTopLoader color="#F4A261" showSpinner={false} height={3} shadow="0 0 10px #F4A261,0 0 5px #FFD166" />
        ) : null}

        <div id="__next_splash">
          <AppProvidersWrapper>{children}</AppProvidersWrapper>
        </div>
      </body>
    </html>
  )
}

export default RootLayout
