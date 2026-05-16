// next-intl middleware is intentionally disabled for this single-locale (en-only) site.
// The [locale] routing structure has been removed to preserve clean /about, /services, etc. URLs.
// When Bengali (bn) support is added in v1.1, re-enable this with the localePrefixMode: 'always' strategy.
//
// import createMiddleware from 'next-intl/middleware';
// export default createMiddleware({ locales: ['en', 'bn'], defaultLocale: 'en' });

export function middleware() {
  // no-op
}

export const config = {
  matcher: [] // match nothing — effectively disabled
}
