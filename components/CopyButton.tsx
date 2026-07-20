'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Copy, Check } from 'lucide-react';
import { toast } from 'sonner';

interface CopyButtonProps {
  text: string;
  label?: string;
  variant?: 'outline' | 'ghost' | 'default' | 'secondary';
  className?: string;
}

export default function CopyButton({ text, label, variant = 'ghost', className = '' }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast.success('Copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Failed to copy text.');
    }
  };

  return (
    <Button
      variant={variant}
      size="xs"
      onClick={handleCopy}
      className={`inline-flex items-center gap-1.5 h-7 px-2 text-xs font-normal border-border/30 hover:bg-muted ${className}`}
    >
      {copied ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
      {label && <span>{label}</span>}
    </Button>
  );
}
