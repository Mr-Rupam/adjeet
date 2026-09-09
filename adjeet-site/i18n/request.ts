/**
 * Single-locale (en) config.
 *
 * There is deliberately no middleware. next-intl's routing middleware was
 * removed along with the [locale] segment so the site keeps clean /about,
 * /services, ... URLs. A no-op `middleware.ts` was left behind holding that
 * note; it matched nothing, did nothing, and tripped Next 16's
 * middleware-to-proxy deprecation warning on every build, so it is gone.
 *
 * To add Bengali in v1.1: add 'bn' to `locales` below, add messages/bn.json,
 * and reintroduce routing as a `proxy.ts` (Next 16 renamed the convention;
 * `middleware.ts` is deprecated) using localePrefixMode 'always'.
 */
import {getRequestConfig} from 'next-intl/server';
import {notFound} from 'next/navigation';

const locales = ['en'] as const;
type Locale = (typeof locales)[number];

export default getRequestConfig(async ({locale}) => {
  if (!locales.includes(locale as Locale)) notFound();

  const validLocale = locale as Locale;

  return {
    locale: validLocale,
    messages: (await import(`../messages/${validLocale}.json`)).default
  };
});
