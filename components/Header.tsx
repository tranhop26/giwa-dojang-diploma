'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { useRouter, usePathname } from 'next/navigation';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount, useBalance } from 'wagmi';
import { formatEther } from 'viem';
import { Menu, X, Award } from 'lucide-react';

function WalletBalanceDisplay({ address, chainId }: { address?: `0x${string}`; chainId?: number }) {
  const { data: balanceData, isLoading } = useBalance({
    address,
    chainId,
  });

  if (isLoading) {
    return <span className="text-xs text-muted-foreground font-mono">...</span>;
  }

  if (!balanceData) {
    return <span className="text-xs text-muted-foreground font-mono">0.0000 ETH</span>;
  }

  const num = Number(formatEther(balanceData.value));
  const formatted = isNaN(num) ? '0.0000' : num.toFixed(4);

  return <span className="text-xs text-violet-200 font-mono font-medium">{formatted} ETH</span>;
}

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const t = useTranslations('Header');

  const toggleLocale = () => {
    const nextLocale = locale === 'ko' ? 'en' : 'ko';
    const segments = pathname.split('/');
    if (segments.length > 1 && (segments[1] === 'en' || segments[1] === 'ko')) {
      segments[1] = nextLocale;
      router.push(segments.join('/'));
    } else {
      router.push(`/${nextLocale}`);
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/60 backdrop-blur-md">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href={`/${locale}`} className="flex items-center gap-2 group">
          <Award className="h-6 w-6 text-primary group-hover:rotate-12 transition-transform duration-300" />
          <span className="font-display font-bold text-lg tracking-wider bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
            {t('title')}
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-muted-foreground">
          <Link href={`/${locale}/issue`} className="hover:text-foreground transition-colors">
            {t('issue')}
          </Link>
          <Link href={`/${locale}/my-diplomas`} className="hover:text-foreground transition-colors">
            {t('myDiplomas')}
          </Link>
        </nav>

        {/* Right Action (Desktop) */}
        <div className="hidden md:flex items-center gap-4">
          {/* High contrast Language Switcher Button */}
          <button
            onClick={toggleLocale}
            type="button"
            className="h-9 px-3 rounded-xl bg-card border border-border/40 hover:border-primary/50 text-foreground font-bold text-xs flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
            title="Switch language / 언어 변경"
          >
            <span className="text-sm">{locale === 'ko' ? '🇰🇷' : '🇬🇧'}</span>
            <span className="font-bold text-foreground tracking-wide">
              {(locale || 'en').toUpperCase()}
            </span>
          </button>
          
          {/* Custom RainbowKit ConnectButton with safe Balance display */}
          <ConnectButton.Custom>
            {({
              account,
              chain,
              openAccountModal,
              openChainModal,
              openConnectModal,
              authenticationStatus,
              mounted,
            }) => {
              const ready = mounted && authenticationStatus !== 'loading';
              const connected =
                ready &&
                account &&
                chain &&
                (!authenticationStatus || authenticationStatus === 'authenticated');

              return (
                <div
                  {...(!ready && {
                    'aria-hidden': true,
                    style: {
                      opacity: 0,
                      pointerEvents: 'none',
                      userSelect: 'none',
                    },
                  })}
                >
                  {(() => {
                    if (!connected) {
                      return (
                        <button
                          onClick={openConnectModal}
                          type="button"
                          className="h-9 px-4 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-xs shadow-md shadow-primary/20 transition-all cursor-pointer"
                        >
                          Connect Wallet
                        </button>
                      );
                    }

                    if (chain.unsupported) {
                      return (
                        <button
                          onClick={openChainModal}
                          type="button"
                          className="h-9 px-4 rounded-xl bg-destructive text-destructive-foreground font-semibold text-xs shadow-md transition-all cursor-pointer"
                        >
                          Wrong Network
                        </button>
                      );
                    }

                    return (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={openChainModal}
                          type="button"
                          className="h-9 px-2.5 rounded-xl bg-card border border-border/40 hover:border-primary/40 text-foreground font-semibold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
                        >
                          {chain.hasIcon && (
                            <div className="w-4 h-4 rounded-full overflow-hidden shrink-0">
                              {chain.iconUrl && (
                                <img
                                  alt={chain.name ?? 'Chain icon'}
                                  src={chain.iconUrl}
                                  className="w-4 h-4"
                                />
                              )}
                            </div>
                          )}
                          <span>{chain.name}</span>
                        </button>

                        <button
                          onClick={openAccountModal}
                          type="button"
                          className="h-9 px-3 rounded-xl bg-card border border-border/40 hover:border-primary/40 text-foreground text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer"
                        >
                          <WalletBalanceDisplay address={account.address as `0x${string}`} chainId={chain.id} />
                          <span className="font-mono text-xs text-foreground bg-primary/20 px-2 py-0.5 rounded-md border border-primary/30">
                            {account.displayName}
                          </span>
                        </button>
                      </div>
                    );
                  })()}
                </div>
              );
            }}
          </ConnectButton.Custom>
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden p-2 text-muted-foreground hover:text-foreground focus:outline-none"
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Toggle menu"
        >
          {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Nav Drawer */}
      {isOpen && (
        <div className="md:hidden border-t border-border/40 bg-background/95 backdrop-blur-lg animate-in slide-in-from-top duration-200">
          <div className="px-4 py-4 space-y-4 flex flex-col">
            <Link
              href={`/${locale}/issue`}
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors py-2"
              onClick={() => setIsOpen(false)}
            >
              {t('issue')}
            </Link>
            <Link
              href={`/${locale}/my-diplomas`}
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors py-2"
              onClick={() => setIsOpen(false)}
            >
              {t('myDiplomas')}
            </Link>
            
            <div className="flex items-center justify-between pt-2 border-t border-border/20">
              <span className="text-xs text-muted-foreground">Language</span>
              <button
                onClick={() => {
                  toggleLocale();
                  setIsOpen(false);
                }}
                type="button"
                className="h-8 px-3 rounded-lg bg-card border border-border/30 text-foreground font-bold text-xs flex items-center gap-1.5 cursor-pointer"
              >
                <span>{locale === 'ko' ? '🇰🇷' : '🇬🇧'}</span>
                <span className="font-bold text-foreground">{(locale || 'en').toUpperCase()}</span>
              </button>
            </div>
            
            <div className="pt-2 border-t border-border/20 flex justify-start">
              <ConnectButton />
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
