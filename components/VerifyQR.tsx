'use client';

import React, { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';

export default function VerifyQR() {
  const [url, setUrl] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setUrl(window.location.href);
    }
  }, []);

  if (!url) {
    return (
      <div className="w-40 h-40 bg-muted/20 border border-border/20 rounded-xl animate-pulse flex items-center justify-center text-xs text-muted-foreground">
        Generating QR...
      </div>
    );
  }

  return (
    <div className="p-3 bg-white rounded-2xl shadow-inner border border-zinc-200 inline-block">
      <QRCodeSVG 
        value={url} 
        size={136} 
        level="M"
        fgColor="#0f0f23"
        bgColor="#ffffff"
      />
    </div>
  );
}
