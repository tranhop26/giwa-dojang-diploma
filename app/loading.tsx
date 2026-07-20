import React from 'react';
import { Loader2 } from 'lucide-react';

export default function Loading() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background text-foreground">
      <Loader2 className="h-10 w-10 text-primary animate-spin" />
      <p className="text-sm text-muted-foreground mt-4 font-medium animate-pulse">
        Loading Dojang Diploma...
      </p>
    </div>
  );
}
