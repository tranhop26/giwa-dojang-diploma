'use client';

import React from 'react';
import { getDefaultConfig, RainbowKitProvider } from '@rainbow-me/rainbowkit';
import { WagmiProvider } from 'wagmi';
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';
import { giwaSepolia } from '@/lib/chain';

const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || '434d2a138947f6eb04f58c7340d82998';

const config = getDefaultConfig({
  appName: 'Dojang Diploma',
  projectId,
  chains: [giwaSepolia],
  ssr: true,
});

const queryClient = new QueryClient();

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
