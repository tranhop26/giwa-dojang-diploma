import React from 'react';
import { useTranslations } from 'next-intl';

export default function Footer() {
  const t = useTranslations('Footer');

  return (
    <footer className="w-full border-t border-border/40 bg-card/30 py-8 mt-auto">
      <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
        <div>
          <p>© {new Date().getFullYear()} Dojang Diploma. All rights reserved.</p>
          <p className="text-xs mt-1 text-primary/80 font-medium">
            {t('compliance')}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-6">
          <a
            href="https://docs.giwa.io"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-foreground transition-colors"
          >
            GIWA Docs
          </a>
          <a
            href="https://faucet.giwa.io"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-foreground transition-colors"
          >
            Faucet
          </a>
          <a
            href="https://sepolia-explorer.giwa.io"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-foreground transition-colors"
          >
            Explorer
          </a>
        </div>
      </div>
    </footer>
  );
}
