import createMiddleware from 'next-intl/middleware';

export default createMiddleware({
  locales: ['en', 'ko'],
  defaultLocale: 'en',
  localePrefix: 'always',
  localeDetection: true // enabled by default, handles Accept-Language header
});

export const config = {
  // Match all pathnames except for static files, API routes, and explorer tx checks
  matcher: [
    // Match all pathnames except for
    // - API routes
    // - _next (static files)
    // - favicon.ico, public files, etc.
    '/((?!api|_next|_vercel|.*\\..*).*)',
    // Match '/' and prefix-based paths
    '/'
  ]
};
