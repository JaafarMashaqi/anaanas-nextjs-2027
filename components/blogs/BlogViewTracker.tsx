'use client'

import { useEffect, useRef } from 'react'

import { logBlogView } from '@/lib/api/blogs'

type BlogViewTrackerProps = {
  blogId: number
}

const BlogViewTracker = ({ blogId }: BlogViewTrackerProps) => {
  const loggedRef = useRef(false)

  useEffect(() => {
    if (loggedRef.current) return
    loggedRef.current = true
    void logBlogView(blogId)
  }, [blogId])

  return null
}

export default BlogViewTracker
