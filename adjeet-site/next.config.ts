import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV === 'development';

const securityHeaders = [
  { key: 'X-DNS-Prefetch-Control', value: 'on' },
  // frame-ancestors in CSP supersedes this in modern browsers; keep XFO as a
  // legacy fallback aligned to the same intent.
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
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
      `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ''} https://www.googletagmanager.com https://www.google-analytics.com https://challenges.cloudflare.com`,
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
  // The e2e job builds with E2E_UNOPTIMIZED_IMAGES=1, so `next start` serves
  // images as they are. Next's built-in optimizer, which `next start` uses
  // (Vercel resizes with its own service, so adjeet.in is unaffected), wedges
  // an image size for good once a request for it is aborted mid-resize: every
  // later request for that size hangs. A test that ends while the hero image
  // is resizing aborts exactly such a request, and the next page to load that
  // size never fires `load`. Never set on Vercel.
  images: { unoptimized: process.env.E2E_UNOPTIMIZED_IMAGES === '1' },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;

