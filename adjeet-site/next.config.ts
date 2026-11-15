import type { NextConfig } from "next";
// Relative, not "@/": the config is loaded before the app's path aliases.
import { LEGACY_REGIONAL_REDIRECTS } from "./content/legacy-regional";

const isDev = process.env.NODE_ENV === 'development';

const securityHeaders = [
  { key: 'X-DNS-Prefetch-Control', value: 'on' },
  // frame-ancestors in CSP supersedes this in modern browsers; keep XFO as a
  // legacy fallback aligned to the same intent.
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  // No page opens a popup that needs window.opener, and WhatsApp links are
  // already noopener, so other windows get no handle on this one.
  { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
  {
    key: 'Permissions-Policy',
    value: [
      'camera=()',
      'microphone=()',
      'geolocation=()',
      'payment=()',
      'usb=()',
      'accelerometer=()',
      'gyroscope=()',
      'magnetometer=()',
      'interest-cohort=()',
    ].join(', '),
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload',
  },
  {
    key: 'Content-Security-Policy',
    value: [
      "default-src 'self'",
      // React 19 requires eval() in development for debugging callstacks.
      // 'unsafe-eval' is ONLY added in dev. Production stays strict.
      // gtag.js comes from googletagmanager.com; google-analytics.com serves no
      // script the site loads, so it is only in connect-src.
      `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ''} https://www.googletagmanager.com https://challenges.cloudflare.com`,
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      "img-src 'self' data: https:",
      // GA4 hits: consent-denied cookieless pings go to www.google.com/g/collect,
      // consent-granted hits go to regional hosts such as
      // region1.google-analytics.com and region1.analytics.google.com.
      "connect-src 'self' https://*.google-analytics.com https://analytics.google.com https://*.analytics.google.com https://www.google.com https://www.googletagmanager.com https://challenges.cloudflare.com",
      "frame-src https://www.google.com https://maps.google.com https://challenges.cloudflare.com",
      "frame-ancestors 'none'",
      "base-uri 'none'",
      "form-action 'self'",
      "object-src 'none'",
      "upgrade-insecure-requests",
    ].join('; '),
  },
];

const nextConfig: NextConfig = {
  // The retired regional pages answer 308 to the page that absorbed them, so
  // their links and the little ranking they had carry over. Redirects run
  // before the filesystem, and any query string is passed through.
  async redirects() {
    return [
      ...LEGACY_REGIONAL_REDIRECTS.map(({ source, destination }) => ({ source, destination, permanent: true })),
      // The production deployment's vercel.app host would otherwise serve a
      // second copy of the site. Only this exact host matches, so preview
      // deployments and localhost are untouched.
      {
        source: '/:path*',
        has: [{ type: 'host' as const, value: 'adjeet.vercel.app' }],
        destination: 'https://adjeet.in/:path*',
        permanent: true,
      },
    ];
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: securityHeaders,
      },
      // Raw public media that pages reference by path (not through the image
      // optimizer, whose output Next caches itself). The files rarely change,
      // and a changed file keeps working after at most 30 days.
      ...['/hero/:path*', '/brand/:path*', '/client-logos/:path*', '/images/:path*'].map((source) => ({
        source,
        headers: [{ key: 'Cache-Control', value: 'public, max-age=2592000, stale-while-revalidate=86400' }],
      })),
    ];
  },
};

export default nextConfig;

