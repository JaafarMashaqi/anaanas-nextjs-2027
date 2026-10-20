'use client'

import dynamic from 'next/dynamic'

const CreatePostCardLazy = dynamic(() => import('@/components/cards/CreatePostCard'), {
  ssr: false,
  loading: () => (
    <div
      aria-hidden="true"
      style={{
        borderRadius: 18,
        border: '1px solid #e6e8ef',
        borderInlineStart: '3px solid #f5c518',
        background: '#ffffff',
        padding: '0.7rem 0.75rem',
        marginBottom: '1rem',
      }}
    >
      <div style={{ height: 14, width: '42%', borderRadius: 8, background: '#f3f4f6' }} />
      <div style={{ height: 40, marginTop: 10, borderRadius: 12, background: '#f7f8fa' }} />
    </div>
  ),
})

export default function CreatePostCardLazyClient() {
  return <CreatePostCardLazy />
}
