'use client';

import React from 'react';
import { useAccount, useSwitchChain, useChainId } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import IssueForm from '@/components/IssueForm';
import BatchIssueUpload from '@/components/BatchIssueUpload';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { CHAIN_ID } from '@/lib/constants';

export default function IssuePage() {
  const { isConnected } = useAccount();
  const chainId = useChainId();
  const { switchChain } = useSwitchChain();

  const isCorrectNetwork = chainId === CHAIN_ID;

  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="flex-1 flex flex-col bg-background relative overflow-hidden py-12">
        {/* Background blobs */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-primary/10 rounded-full blur-[100px] pointer-events-none" />

        <div className="container mx-auto px-4 relative z-10">
          {!isConnected ? (
            <Card className="w-full max-w-md mx-auto border-border/40 bg-card/60 backdrop-blur-md shadow-2xl text-center p-6 mt-12">
              <CardHeader className="space-y-2">
                <CardTitle className="font-display text-2xl">Connect Your Wallet</CardTitle>
                <CardDescription>
                  You must connect an authorized issuer wallet to mint Dojang diplomas on-chain.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex justify-center pt-4">
                <ConnectButton />
              </CardContent>
            </Card>
          ) : !isCorrectNetwork ? (
            <Card className="w-full max-w-md mx-auto border-border/40 bg-card/60 backdrop-blur-md shadow-2xl text-center p-6 mt-12">
              <CardHeader className="space-y-2">
                <CardTitle className="font-display text-2xl text-amber-500">Wrong Network</CardTitle>
                <CardDescription>
                  Dojang Diploma operates on GIWA Sepolia Testnet (Chain ID: {CHAIN_ID}).
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 pt-4">
                <p className="text-sm text-muted-foreground">
                  Please switch your active wallet network to proceed.
                </p>
                <Button
                  onClick={() => switchChain({ chainId: CHAIN_ID })}
                  className="w-full h-11 bg-amber-500 hover:bg-amber-600 text-black font-semibold"
                >
                  Switch to GIWA Sepolia
                </Button>
              </CardContent>
            </Card>
          ) : (
            <Tabs defaultValue="single" className="w-full max-w-3xl mx-auto space-y-6">
              <div className="flex justify-center">
                <TabsList className="grid grid-cols-2 w-[300px] border border-border/30 bg-muted/40 p-1 rounded-xl">
                  <TabsTrigger value="single" className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-semibold">Single Issue</TabsTrigger>
                  <TabsTrigger value="batch" className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-semibold">Batch Issue (CSV)</TabsTrigger>
                </TabsList>
              </div>
              
              <TabsContent value="single" className="focus-visible:outline-none">
                <IssueForm />
              </TabsContent>
              
              <TabsContent value="batch" className="focus-visible:outline-none">
                <BatchIssueUpload />
              </TabsContent>
            </Tabs>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
