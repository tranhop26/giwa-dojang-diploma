import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./i18n.ts');

/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  webpack: (config) => {
    if (!config.resolve.fallback) {
      config.resolve.fallback = {};
    }
    // Disable resolving of optional/peer dependencies in wagmi to prevent webpack build compilation errors
    config.resolve.fallback['@base-org/account'] = false;
    config.resolve.fallback['@coinbase/wallet-sdk'] = false;
    config.resolve.fallback['@metamask/connect-evm'] = false;
    config.resolve.fallback['porto/internal'] = false;
    config.resolve.fallback['@safe-global/safe-apps-sdk'] = false;
    config.resolve.fallback['@safe-global/safe-apps-provider'] = false;
    config.resolve.fallback['@walletconnect/ethereum-provider'] = false;
    config.resolve.fallback['accounts'] = false;
    return config;
  }
};

export default withNextIntl(nextConfig);
