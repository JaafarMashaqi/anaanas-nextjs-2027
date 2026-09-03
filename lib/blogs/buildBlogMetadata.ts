import type { Metadata } from 'next'

import { getIsBlogsHost } from '@/lib/blogs/getIsBlogsHost'
import {
  blogCategoryPath,
  blogListPath,
  blogPostPath,
} from '@/lib/blogs/paths'
import { DEFAULT_LOCALE, SUPPORTED_LOCALES, type SupportedLocale } from '@/lib/localization'
import { resolveSeoOrigin } from '@/lib/seo/resolveSeoOrigin'

type BlogMetadataInput = {
  locale: SupportedLocale
  title: string
  description: string
  pathname: string
  type?: 'website' | 'article'
  imageUrl?: string | null
  publishedAt?: string | null
  robots?: Metadata['robots']
}

function absoluteUrl(origin: string, pathname: string): string {
  const path = pathname.startsWith('/') ? pathname : `/${pathname}`
  return `${origin.replace(/\/$/, '')}${path}`
}

function hreflangAlternates(
  origin: string,
  buildPath: (locale: SupportedLocale) => string,
): Record<string, string> {
  const languages: Record<string, string> = {}
  for (const locale of SUPPORTED_LOCALES) {
    languages[locale] = absoluteUrl(origin, buildPath(locale))
  }
  languages['x-default'] = absoluteUrl(origin, buildPath(DEFAULT_LOCALE))
  return languages
}

export async function buildBlogPageMetadata(
  input: BlogMetadataInput,
): Promise<Metadata> {
  const origin = await resolveSeoOrigin()
  const isBlogsHost = await getIsBlogsHost()
  const canonicalPath = input.pathname
  const canonical = absoluteUrl(origin, canonicalPath)
  const pageTitle = input.title.includes('ANANAS') ? input.title : `${input.title} | ANANAS`

  const languages = hreflangAlternates(origin, (locale) => {
    if (isBlogsHost) {
      if (canonicalPath === blogListPath(input.locale, true)) {
        return blogListPath(locale, true)
      }
      const catMatch = canonicalPath.match(/^\/[^/]+\/cat\/([^/]+)/)
      if (catMatch) {
        return blogCategoryPath(locale, catMatch[1], true)
      }
      const postMatch = canonicalPath.match(/^\/[^/]+\/([^/]+)$/)
      if (postMatch && postMatch[1] !== 'cat') {
        return blogPostPath(locale, postMatch[1], true)
      }
    }

    const countryList = blogListPath(locale, false)
    if (canonicalPath === blogListPath(input.locale, false)) {
      return countryList
    }
    const countryCat = canonicalPath.match(/^\/[^/]+\/blogs\/cat\/([^/]+)/)
    if (countryCat) {
      return blogCategoryPath(locale, countryCat[1], false)
    }
    const countryPost = canonicalPath.match(/^\/[^/]+\/blogs\/([^/]+)/)
    if (countryPost && countryPost[1] !== 'cat') {
      return blogPostPath(locale, countryPost[1], false)
    }
    return canonicalPath.replace(`/${input.locale}`, `/${locale}`)
  })

  return {
    title: pageTitle,
    description: input.description,
    robots: input.robots,
    alternates: {
      canonical,
      languages,
    },
    openGraph: {
      title: input.title,
      description: input.description,
      type: input.type ?? 'website',
      url: canonical,
      locale: input.locale === 'ar' ? 'ar_AR' : 'en_US',
      ...(input.imageUrl ? { images: [{ url: input.imageUrl }] } : {}),
      ...(input.type === 'article' && input.publishedAt
        ? { publishedTime: input.publishedAt }
        : {}),
    },
    twitter: {
      card: input.imageUrl ? 'summary_large_image' : 'summary',
      title: input.title,
      description: input.description,
      ...(input.imageUrl ? { images: [input.imageUrl] } : {}),
    },
  }
}

export function buildBlogArticleJsonLd(input: {
  origin: string
  locale: SupportedLocale
  title: string
  description: string
  slug: string
  isBlogsHost: boolean
  coverImageUrl?: string | null
  publishedAt?: string | null
  authorName?: string | null
}) {
  const url = absoluteUrl(
    input.origin,
    blogPostPath(input.locale, input.slug, input.isBlogsHost),
  )
  const image = input.coverImageUrl?.startsWith('http')
    ? input.coverImageUrl
    : input.coverImageUrl
      ? absoluteUrl(input.origin, input.coverImageUrl)
      : undefined

  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: input.title,
    description: input.description,
    url,
    inLanguage: input.locale,
    datePublished: input.publishedAt ?? undefined,
    image: image ? [image] : undefined,
    author: input.authorName
      ? { '@type': 'Person', name: input.authorName }
      : { '@type': 'Organization', name: 'ANANAS' },
    publisher: {
      '@type': 'Organization',
      name: 'ANANAS',
    },
  }
}
