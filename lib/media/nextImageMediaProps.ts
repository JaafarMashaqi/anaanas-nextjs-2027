/**
 * Props for Next/Image when the src is Laravel/S3 media (admin.anaanas.com, CDN, etc.).
 * Bypasses `/_next/image` proxy so we never hit "url parameter is not allowed".
 * PostCard and listing components already use unoptimized for the same reason.
 */
export const remoteMediaImageProps = {
  unoptimized: true as const,
}
