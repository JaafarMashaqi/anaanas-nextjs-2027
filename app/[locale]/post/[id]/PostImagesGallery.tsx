'use client'

import Image from 'next/image'
import { useEffect, useId } from 'react'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Navigation, Pagination, Keyboard } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/pagination'
import 'glightbox/dist/css/glightbox.min.css'
import { resolveMediaUrl } from '@/lib/media/resolveMediaUrl'
import { remoteMediaImageProps } from '@/lib/media/nextImageMediaProps'
import gstyles from './PostImagesGallery.module.css'

export default function PostImagesGallery({
  images,
  title,
  isRtl = false,
  variant = 'default',
}: {
  images: Array<{ url: string; alt?: string }>
  title?: string
  isRtl?: boolean
  variant?: 'default' | 'details'
}) {
  const galleryId = useId().replace(/:/g, '-')

  useEffect(() => {
    if (typeof window === 'undefined') return
    let instance: { destroy?: () => void } | null = null

    void import('glightbox').then(({ default: glightbox }) => {
      try {
        instance = glightbox({
          selector: `[data-glightbox-gallery="${galleryId}"]`,
          openEffect: 'fade',
          closeEffect: 'fade',
        })
      } catch (e) {
        console.error('Failed to init glightbox', e)
      }
    })

    return () => {
      try {
        instance?.destroy?.()
      } catch {
        // ignore
      }
    }
  }, [galleryId])

  if (!Array.isArray(images) || images.length === 0) return null

  const rootClass = variant === 'details' ? `${gstyles.root} ${gstyles.rootDetails}` : gstyles.root
  const stageClass = variant === 'details' ? `${gstyles.stage} ${gstyles.stageDetails}` : gstyles.stage
  const slideClass = variant === 'details' ? `${gstyles.slideBox} ${gstyles.slideBoxDetails}` : gstyles.slideBox
  const imgClass = variant === 'details' ? `${gstyles.img} ${gstyles.imgDetails}` : gstyles.img

  const sizes = '(max-width: 576px) 100vw, (max-width: 1200px) 92vw, 860px'

  if (images.length === 1) {
    const img = images[0]
    const src = resolveMediaUrl(img.url)
    return (
      <a
        href={src}
        className={`glightbox ${gstyles.anchor}`}
        data-glightbox-gallery={galleryId}
        data-gallery="post-images"
      >
        <div className={stageClass}>
          <Image
            fill
            className={imgClass}
            src={src}
            alt={img.alt ?? title ?? 'post image'}
            sizes={sizes}
            priority
            quality={82}
            fetchPriority="high"
            {...remoteMediaImageProps}
          />
        </div>
      </a>
    )
  }

  return (
    <div dir={isRtl ? 'rtl' : 'ltr'} className={`post-images-swiper ${rootClass}`}>
      <Swiper
        modules={[Navigation, Pagination, Keyboard]}
        navigation
        pagination={{ clickable: true }}
        keyboard={{ enabled: true }}
        spaceBetween={12}
        slidesPerView={1}
        loop={images.length > 1}
      >
        {images.map((img, idx) => {
          const src = resolveMediaUrl(img.url)
          return (
            <SwiperSlide key={`${img.url}-${idx}`}>
              <a
                href={src}
                className={`glightbox ${gstyles.anchor}`}
                data-glightbox-gallery={galleryId}
                data-gallery="post-images"
              >
                <div className={slideClass}>
                  <Image
                    fill
                    className={imgClass}
                    src={src}
                    alt={img.alt ?? title ?? 'post image'}
                    sizes={sizes}
                    priority={idx === 0}
                    quality={82}
                    fetchPriority={idx === 0 ? 'high' : 'low'}
                    {...remoteMediaImageProps}
                  />
                </div>
              </a>
            </SwiperSlide>
          )
        })}
      </Swiper>
    </div>
  )
}
