'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { useRouter, usePathname } from 'next/navigation';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { Menu, X, Award } from 'lucide-react';

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const t = useTranslations('Header');

  const handleLocaleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newLocale = e.target.value;
    const segments = pathname.split('/');
    if (segments.length > 1 && (segments[1] === 'en' || segments[1] === 'ko')) {
      segments[1] = newLocale;
      router.push(segments.join('/'));
    } else {
      router.push(`/${newLocale}`);
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
          {/* Language Selector */}
          <div className="relative">
            <select
              value={locale}
              onChange={handleLocaleChange}
              className="bg-card/60 border border-border/30 hover:border-primary/45 rounded-lg px-2 py-1 text-xs font-semibold text-foreground focus:outline-none cursor-pointer"
            >
              <option value="en" className="bg-background">🇬🇧 EN</option>
              <option value="ko" className="bg-background">🇰🇷 KO</option>
            </select>
          </div>
          
          <ConnectButton />
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
              <select
                value={locale}
                onChange={handleLocaleChange}
                className="bg-card border border-border/30 rounded-lg px-2 py-1 text-xs font-semibold text-foreground focus:outline-none cursor-pointer"
              >
                <option value="en">🇬🇧 EN</option>
                <option value="ko">🇰🇷 KO</option>
              </select>
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
