'use client';

import React from 'react';
import { useAccount } from 'wagmi';
import { useQuery } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCw, AlertTriangle, Inbox } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import CopyButton from '@/components/CopyButton';
import DiplomaCard from '@/components/DiplomaCard';
import { getAttestationsByRecipient } from '@/lib/queries';

export default function MyDiplomasPage() {
  const { address, isConnected } = useAccount();
  const t = useTranslations('MyDiplomas');

  const { data: diplomas, isLoading, isError, refetch } = useQuery({
    queryKey: ['my-diplomas', address],
    queryFn: () => getAttestationsByRecipient(address!),
    enabled: !!address && isConnected,
  });

  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="flex-1 flex flex-col bg-background relative overflow-hidden py-12">
        {/* Background cosmic glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-primary/10 rounded-full blur-[100px] pointer-events-none" />

        <div className="container mx-auto px-4 relative z-10 space-y-8">
          {!isConnected ? (
            <Card className="w-full max-w-md mx-auto border-border/40 bg-card/60 backdrop-blur-md shadow-2xl text-center p-6 mt-12">
              <CardHeader className="space-y-2">
                <CardTitle className="font-display text-2xl">{t('connectTitle')}</CardTitle>
                <CardDescription>
                  {t('connectDesc')}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex justify-center pt-4">
                <ConnectButton />
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {/* Profile/Address Banner */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 border border-border/30 rounded-2xl bg-card/40 backdrop-blur-md">
                <div className="space-y-1">
                  <span className="text-[10px] text-muted-foreground uppercase tracking-widest block font-medium">
                    {t('viewingWallet')}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm text-violet-200">{address}</span>
                    <CopyButton text={address || ''} />
                  </div>
                </div>
                
                {isLoading && (
                  <Button disabled variant="outline" size="sm" className="h-9 gap-1.5 text-xs">
                    <RefreshCw className="h-3.5 w-3.5 animate-spin" /> {t('syncing')}
                  </Button>
                )}
                {!isLoading && (
                  <Button onClick={() => refetch()} variant="outline" size="sm" className="h-9 gap-1.5 text-xs">
                    <RefreshCw className="h-3.5 w-3.5" /> {t('refresh')}
                  </Button>
                )}
              </div>

              {/* Grid content */}
              {isLoading ? (
                <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-[260px] rounded-2xl border border-border/20 bg-card/30 animate-pulse flex flex-col justify-between p-6">
                      <div className="space-y-3">
                        <div className="w-10 h-10 rounded-lg bg-border/40" />
                        <div className="w-3/4 h-5 rounded bg-border/40" />
                        <div className="w-1/2 h-3 rounded bg-border/40" />
                      </div>
                      <div className="w-full h-9 rounded bg-border/40" />
                    </div>
                  ))}
                </div>
              ) : isError ? (
                <Card className="border-destructive/30 bg-destructive/5 text-center p-8 max-w-md mx-auto">
                  <CardHeader className="space-y-2">
                    <div className="w-12 h-12 rounded-xl bg-destructive/10 text-destructive flex items-center justify-center mx-auto mb-2">
                      <AlertTriangle className="h-6 w-6" />
                    </div>
                    <CardTitle className="font-display text-lg text-destructive">{t('syncErrorTitle')}</CardTitle>
                    <CardDescription>
                      {t('syncErrorDesc')}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-2">
                    <Button onClick={() => refetch()} className="w-full">
                      {t('retry')}
                    </Button>
                  </CardContent>
                </Card>
              ) : diplomas && diplomas.length > 0 ? (
                <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
                  {diplomas.map((diploma) => (
                    <DiplomaCard
                      key={diploma.uid}
                      uid={diploma.uid}
                      studentName={diploma.data.studentName}
                      courseName={diploma.data.courseName}
                      completionDate={diploma.data.completionDate}
                      issuerName={diploma.data.issuerName}
                      issuer={diploma.issuer}
                      time={diploma.time}
                      revocationTime={diploma.revocationTime}
                    />
                  ))}
                </div>
              ) : (
                <Card className="border-border/30 bg-card/20 text-center p-12 max-w-md mx-auto">
                  <CardHeader className="space-y-2">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mx-auto mb-2">
                      <Inbox className="h-6 w-6" />
                    </div>
                    <CardTitle className="font-display text-lg">{t('emptyTitle')}</CardTitle>
                    <CardDescription>
                      {t('emptyDesc')}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4 pt-2 text-sm text-muted-foreground">
                    <p>
                      {t('emptyPrompt')}
                    </p>
                    <div className="flex justify-center">
                      <CopyButton text={address || ''} label={t('copyMy')} variant="outline" className="h-10 px-4 text-foreground" />
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
