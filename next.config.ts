import type {NextConfig} from "next";
import type {RemotePattern} from "next/dist/shared/lib/image-config";

function hostnameFromEnvUrl(raw?: string): string | null {
  const value = raw?.trim();
  if (!value) return null;
  try {
    return new URL(value).hostname;
  } catch {
    return null;
  }
}

/** Allow Next/Image optimizer for API/CDN media when explicitly enabled. */
function buildMediaRemotePatterns(): RemotePattern[] {
  const patterns: RemotePattern[] = [
    {
      protocol: 'http',
      hostname: 'localhost',
      port: '8000',
      pathname: '/storage/**',
    },
    {
      protocol: 'http',
      hostname: '127.0.0.1',
      port: '8000',
      pathname: '/storage/**',
    },
    {
      protocol: 'http',
      hostname: 'localhost',
      pathname: '/storage/**',
    },
    {
      protocol: 'http',
      hostname: '127.0.0.1',
      pathname: '/storage/**',
    },
    {
      protocol: 'http',
      hostname: 'localhost',
      port: '8000',
      pathname: '/post-media/**',
    },
    {
      protocol: 'http',
      hostname: '127.0.0.1',
      port: '8000',
      pathname: '/post-media/**',
    },
    {
      protocol: 'https',
      hostname: '**.amazonaws.com',
      pathname: '/**',
    },
    {
      protocol: 'https',
      hostname: '**.cloudfront.net',
      pathname: '/**',
    },
    {
      protocol: 'https',
      hostname: '**.anaanas.com',
      pathname: '/post-media/**',
    },
    {
      protocol: 'https',
      hostname: '**.anaanas.com',
      pathname: '/storage/**',
    },
  ];

  const hosts = new Set<string>(['admin.anaanas.com']);

  for (const envKey of ['NEXT_PUBLIC_API_BASE_URL', 'API_BASE_URL', 'NEXT_PUBLIC_MEDIA_CDN_URL'] as const) {
    const host = hostnameFromEnvUrl(process.env[envKey]);
    if (host) hosts.add(host);
  }

  for (const hostname of hosts) {
    patterns.push(
      { protocol: 'https', hostname, pathname: '/post-media/**' },
      { protocol: 'https', hostname, pathname: '/storage/**' },
    );
  }

  return patterns;
}

const nextConfig: NextConfig = {
    /* config options here */
    compress: true,
    experimental: {
        // Lower peak RAM during `next build` (Next.js 15+).
        webpackMemoryOptimizations: true,
        // Custom webpack config disables the default worker; re-enable to split memory.
        webpackBuildWorker: true,
    },
    allowedDevOrigins: [
        '127.0.0.1',
        'localhost:8080',
        '127.0.0.1:8080',
        'demo.anaanas.com',
        'demo.localhost',
        'localhost:3000',
        '127.0.0.1:3000',
        'jo.localhost',
        'jo.localhost:3000',
    ],
    images: {
        formats: ['image/avif', 'image/webp'],
        minimumCacheTTL: 60 * 60 * 24 * 7,
        // We only include SVGs that ship with the app (e.g. default user avatar).
        dangerouslyAllowSVG: true,
        contentDispositionType: 'attachment',
        contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
        remotePatterns: buildMediaRemotePatterns(),
    },
    async rewrites() {
        return [
            {
                source: '/sitemap-posts-:page(\\d+).xml',
                destination: '/sitemap-posts-page/:page',
            },
        ]
    },
    async headers() {
        return [
            {
                source: '/_next/static/:path*',
                headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }],
            },
            {
                source: '/assets/:path*',
                headers: [
                    {
                        key: 'Cache-Control',
                        value: 'public, max-age=86400, stale-while-revalidate=604800',
                    },
                ],
            },
            {
                source: '/styles/:path*',
                headers: [
                    {
                        key: 'Cache-Control',
                        value: 'public, max-age=86400, stale-while-revalidate=604800',
                    },
                ],
            },
        ]
    },
    // Transpile next-auth to avoid chunk generation issues
    transpilePackages: ['next-auth'],
    // Webpack configuration to fix next-auth issues
    webpack: (config, { isServer }) => {
        if (!isServer) {
            config.resolve.fallback = {
                ...config.resolve.fallback,
                fs: false,
                net: false,
                tls: false,
            };
        }
        return config;
    },
};

export default nextConfig;
