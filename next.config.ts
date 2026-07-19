import type {NextConfig} from "next";

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
        remotePatterns: [
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
                protocol: 'https',
                hostname: '**.amazonaws.com',
                pathname: '/**',
            },
            {
                protocol: 'https',
                hostname: '**.cloudfront.net',
                pathname: '/**',
            },
        ],
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
