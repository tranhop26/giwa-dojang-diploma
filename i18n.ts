import { notFound } from 'next/navigation';
import { getRequestConfig } from 'next-intl/server';

const locales = ['en', 'ko'];

export default getRequestConfig(async ({ locale }) => {
  const finalLocale = locale || 'en';
  if (!locales.includes(finalLocale as any)) notFound();

  return {
    locale: finalLocale,
    messages: (await import(`./messages/${finalLocale}.json`)).default
  };
});
