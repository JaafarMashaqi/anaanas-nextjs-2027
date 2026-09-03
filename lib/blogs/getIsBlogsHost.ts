import { headers } from 'next/headers'

import { isBlogsHostFromHeader } from '@/lib/blogs/paths'

export async function getIsBlogsHost(): Promise<boolean> {
  const headersList = await headers()
  return isBlogsHostFromHeader(headersList.get('x-blogs-host'))
}
