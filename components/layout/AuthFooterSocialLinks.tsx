'use client'

import Link from 'next/link'
import type { ReactNode } from 'react'
import {
  FaFacebookSquare,
  FaInstagramSquare,
  FaLinkedin,
  FaPhoneSquareAlt,
  FaTwitterSquare,
  FaWhatsappSquare,
  FaYoutubeSquare,
} from 'react-icons/fa'

import { usePlatformPublicSettingsData } from '@/context/PlatformPublicSettingsContext'

type SocialItem = {
  key: string
  href: string
  label: string
  icon: ReactNode
}

/**
 * Renders only configured contact/social links from platform public settings.
 * Empty admin values omit the whole `<li>` (no placeholder `#` links).
 */
export default function AuthFooterSocialLinks() {
  const { social, contact } = usePlatformPublicSettingsData()

  const items: SocialItem[] = []

  if (social.facebook) {
    items.push({
      key: 'facebook',
      href: social.facebook,
      label: 'Facebook',
      icon: <FaFacebookSquare />,
    })
  }
  if (social.twitter) {
    items.push({
      key: 'twitter',
      href: social.twitter,
      label: 'X / Twitter',
      icon: <FaTwitterSquare />,
    })
  }
  if (social.linkedin) {
    items.push({
      key: 'linkedin',
      href: social.linkedin,
      label: 'LinkedIn',
      icon: <FaLinkedin />,
    })
  }
  if (social.youtube) {
    items.push({
      key: 'youtube',
      href: social.youtube,
      label: 'YouTube',
      icon: <FaYoutubeSquare />,
    })
  }
  if (social.instagram) {
    items.push({
      key: 'instagram',
      href: social.instagram,
      label: 'Instagram',
      icon: <FaInstagramSquare />,
    })
  }
  if (contact.phone_href) {
    items.push({
      key: 'phone',
      href: contact.phone_href,
      label: contact.phone ? `Call ${contact.phone}` : 'Phone',
      icon: <FaPhoneSquareAlt />,
    })
  }
  if (contact.whatsapp_href) {
    items.push({
      key: 'whatsapp',
      href: contact.whatsapp_href,
      label: contact.whatsapp ? `WhatsApp ${contact.whatsapp}` : 'WhatsApp',
      icon: <FaWhatsappSquare />,
    })
  }

  if (items.length === 0) {
    return null
  }

  return (
    <ul className="auth-footer-social">
      {items.map((item) => {
        const isExternal = item.href.startsWith('http')
        return (
          <li key={item.key}>
            {isExternal ? (
              <a href={item.href} target="_blank" rel="noopener noreferrer" aria-label={item.label}>
                {item.icon}
              </a>
            ) : (
              <Link href={item.href} aria-label={item.label}>
                {item.icon}
              </Link>
            )}
          </li>
        )
      })}
    </ul>
  )
}
