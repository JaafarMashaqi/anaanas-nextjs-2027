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
    /* Dev and `next build` must not share a directory. A production tree in
       `.next` makes `next dev` 404 its CSS and miss vendor-chunks/next-auth.js. */
    distDir: process.env.NEXT_DIST_DIR || '.next',
    compress: true,
    // App Router keeps compiled pages in the dev server. The default buffer (5
    // pages / 60s) stacked sign-in, search, auctions, and a listing to 2.8GB
    // on a 4GB machine and did not release them. Keep two, and drop the rest
    // quickly so the next cold compile does not start from that high-water mark.
    onDemandEntries: {
        maxInactiveAge: 15 * 1000,
        pagesBufferLength: 2,
    },
    experimental: {
        // Lower peak RAM during `next build` (Next.js 15+).
        webpackMemoryOptimizations: true,
        // Custom webpack config disables the default worker; re-enable to split memory.
        webpackBuildWorker: true,
        // One worker. Parallel compilers are what push a 4GB sandbox over the edge.
        cpus: 1,
        memoryBasedWorkersCount: true,
        serverSourceMaps: false,
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
        // The preview sandbox OOMs when Sharp decodes every remote listing
        // photo inside the dev server. Production builds do not set this env,
        // so the image optimizer stays on for the real deployment.
        unoptimized: process.env.ANANAS_PREVIEW_LOW_MEM === '1',
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
