'use client';

import React, { useEffect } from 'react';
import { Card, CardHeader, CardContent, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button, buttonVariants } from '@/components/ui/button';
import { ShieldAlert, RefreshCw, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Global application error:', error);
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center p-6 bg-background text-foreground relative">
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-destructive/10 rounded-full blur-[100px] pointer-events-none" />
      <Card className="w-full max-w-md border-border/40 bg-card/60 backdrop-blur-md shadow-2xl text-center p-6">
        <CardHeader className="space-y-2">
          <div className="w-12 h-12 rounded-xl bg-destructive/10 text-destructive flex items-center justify-center mx-auto mb-2">
            <ShieldAlert className="h-6 w-6" />
          </div>
          <CardTitle className="font-display text-2xl">Application Error</CardTitle>
          <CardDescription>
            Something went wrong while rendering this page.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground break-words font-mono bg-black/20 p-3 rounded-lg border border-border/20">
            {error.message || 'An unexpected error occurred.'}
          </p>
        </CardContent>
        <CardFooter className="flex flex-col sm:flex-row justify-center gap-3 pt-4">
          <Button onClick={() => reset()} className="w-full sm:w-auto gap-2">
            <RefreshCw className="h-4 w-4" /> Try Again
          </Button>
          <Link href="/" className={cn(buttonVariants({ variant: "outline" }), "w-full sm:w-auto gap-2")}>
            <ArrowLeft className="h-4 w-4" /> Back Home
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
