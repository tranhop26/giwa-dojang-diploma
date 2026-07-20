'use client';

import React from 'react';
import Link from 'next/link';
import { Card, CardHeader, CardContent, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button, buttonVariants } from '@/components/ui/button';
import { Award, ArrowRight, ShieldAlert, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { DiplomaData } from '@/lib/eas';

interface DiplomaCardProps {
  uid: string;
  studentName: string;
  courseName: string;
  completionDate: number;
  issuerName: string;
  issuer: string;
  time: number;
  revocationTime: number;
}

export default function DiplomaCard({
  uid,
  studentName,
  courseName,
  completionDate,
  issuerName,
  revocationTime,
}: DiplomaCardProps) {
  const isRevoked = revocationTime > 0;
  
  const formattedCompletionDate = new Date(completionDate * 1000).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  return (
    <Card className="border-border/40 bg-card/65 backdrop-blur-md shadow-lg hover:shadow-2xl hover:border-primary/40 hover:-translate-y-1 transition-all duration-300 relative overflow-hidden flex flex-col h-full">
      {/* Decorative colored line */}
      <div className={`absolute top-0 left-0 right-0 h-1 ${isRevoked ? 'bg-destructive' : 'bg-primary'}`} />

      {/* Revocation Badge */}
      <div className="absolute top-4 right-4">
        {isRevoked ? (
          <Badge variant="destructive" className="text-[10px] font-semibold uppercase tracking-wider py-0.5 px-2">
            <ShieldAlert className="h-3 w-3 mr-1 inline" /> Revoked
          </Badge>
        ) : (
          <Badge className="bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20 text-[10px] font-semibold uppercase tracking-wider py-0.5 px-2">
            Verified
          </Badge>
        )}
      </div>

      <CardHeader className="pt-6 pb-2 space-y-2">
        <Award className={`h-8 w-8 ${isRevoked ? 'text-destructive' : 'text-primary'}`} />
        <CardTitle className="font-display text-lg line-clamp-1 mt-1 text-foreground">
          {studentName}
        </CardTitle>
        <CardDescription className="line-clamp-2 text-xs text-muted-foreground min-h-[2rem]">
          {courseName}
        </CardDescription>
      </CardHeader>

      <CardContent className="py-2 flex-grow space-y-3">
        <div className="flex justify-between items-center text-xs">
          <span className="text-muted-foreground">Issuer:</span>
          <span className="font-semibold text-foreground max-w-[140px] truncate">{issuerName}</span>
        </div>
        <div className="flex justify-between items-center text-xs">
          <span className="text-muted-foreground">Completed:</span>
          <span className="font-semibold text-foreground inline-flex items-center gap-1">
            <Calendar className="h-3 w-3 text-muted-foreground" /> {formattedCompletionDate}
          </span>
        </div>
      </CardContent>

      <CardFooter className="pt-4 pb-5 px-6 border-t border-border/10 bg-card/10">
        <Link
          href={`/verify/${uid}`}
          className={cn(buttonVariants({ variant: isRevoked ? 'outline' : 'default' }), "w-full h-9 gap-1.5")}
        >
          View Certificate <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </CardFooter>
    </Card>
  );
}
