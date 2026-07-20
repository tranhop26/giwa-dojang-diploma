'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { Menu, X, Award } from 'lucide-react';

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/60 backdrop-blur-md">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <Award className="h-6 w-6 text-primary group-hover:rotate-12 transition-transform duration-300" />
          <span className="font-display font-bold text-lg tracking-wider bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
            Dojang Diploma
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-muted-foreground">
          <Link href="/issue" className="hover:text-foreground transition-colors">
            Issue Diploma
          </Link>
          <Link href="/my-diplomas" className="hover:text-foreground transition-colors">
            My Diplomas
          </Link>
        </nav>

        {/* Right Action (Desktop) */}
        <div className="hidden md:flex items-center gap-4">
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
              href="/issue"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors py-2"
              onClick={() => setIsOpen(false)}
            >
              Issue Diploma
            </Link>
            <Link
              href="/my-diplomas"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors py-2"
              onClick={() => setIsOpen(false)}
            >
              My Diplomas
            </Link>
            <div className="pt-2 border-t border-border/20 flex justify-start">
              <ConnectButton />
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
