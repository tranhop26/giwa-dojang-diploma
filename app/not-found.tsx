import React from 'react';
import Link from 'next/link';
import { Card, CardHeader, CardContent, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button, buttonVariants } from '@/components/ui/button';
import { HelpCircle, ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function NotFound() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <main className="flex-1 flex items-center justify-center p-6 bg-background relative">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-primary/10 rounded-full blur-[100px] pointer-events-none" />
        <Card className="w-full max-w-md border-border/40 bg-card/60 backdrop-blur-md shadow-2xl text-center p-6">
          <CardHeader className="space-y-2">
            <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mx-auto mb-2">
              <HelpCircle className="h-6 w-6" />
            </div>
            <CardTitle className="font-display text-2xl">Page Not Found</CardTitle>
            <CardDescription>
              The page you are looking for does not exist or has been moved.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              We couldn't find the resource you requested. You can return to the dashboard.
            </p>
          </CardContent>
          <CardFooter className="flex justify-center">
            <Link href="/" className={cn(buttonVariants({ variant: "default" }), "gap-2")}>
              <ArrowLeft className="h-4 w-4" /> Back to Home
            </Link>
          </CardFooter>
        </Card>
      </main>

      <Footer />
    </div>
  );
}
