'use client'

import { usePathname } from 'next/navigation'
import { useLayoutEffect } from 'react'

/**
 * Next.js App Router sometimes leaves the window a few pixels off the top
 * after client navigation (layout paint, scroll anchoring, focus, etc.).
 * Reset scroll synchronously on pathname changes, but skip when the URL has
 * a hash so in-page anchors still work.
 */
const ScrollToTopOnRoute = () => {
  const pathname = usePathname()

  useLayoutEffect(() => {
    if (typeof window === 'undefined') return
    const hash = window.location.hash
    if (hash && hash.length > 1) return
    if ('scrollRestoration' in window.history) window.history.scrollRestoration = 'manual'

    window.scrollTo(0, 0)
    document.documentElement.scrollTop = 0
    document.body.scrollTop = 0
  }, [pathname])

  return null
}

export default ScrollToTopOnRoute
