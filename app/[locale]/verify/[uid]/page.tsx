import React from 'react';
import Link from 'next/link';
import { Metadata } from 'next';
import { useTranslations } from 'next-intl';
import { Card, CardHeader, CardContent, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Button, buttonVariants } from '@/components/ui/button';
import { Award, ShieldAlert, ArrowLeft, ExternalLink, Calendar, UserCheck } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import CopyButton from '@/components/CopyButton';
import VerifyQR from '@/components/VerifyQR';
import { getPublicClient, decodeDiplomaData } from '@/lib/eas';
import { EAS_ADDRESS, SCHEMA_UID, EXPLORER_URL } from '@/lib/constants';
import { cn } from '@/lib/utils';

interface VerifyPageProps {
  params: {
    uid: string;
    locale: string;
  };
}

const GET_ATTESTATION_ABI = [
  {
    name: 'getAttestation',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'uid', type: 'bytes32' }],
    outputs: [
      {
        name: '',
        type: 'tuple',
        components: [
          { name: 'uid', type: 'bytes32' },
          { name: 'schema', type: 'bytes32' },
          { name: 'time', type: 'uint64' },
          { name: 'expirationTime', type: 'uint64' },
          { name: 'revocationTime', type: 'uint64' },
          { name: 'refUID', type: 'bytes32' },
          { name: 'recipient', type: 'address' },
          { name: 'attester', type: 'address' },
          { name: 'revocable', type: 'bool' },
          { name: 'data', type: 'bytes' },
        ],
      },
    ],
  },
] as const;

async function fetchAttestation(uid: string) {
  const publicClient = getPublicClient();
  try {
    const att = await publicClient.readContract({
      address: EAS_ADDRESS,
      abi: GET_ATTESTATION_ABI,
      functionName: 'getAttestation',
      args: [uid as `0x${string}`],
    });
    return att;
  } catch (error) {
    console.error('Error fetching attestation:', error);
    return null;
  }
}

export async function generateMetadata({ params }: VerifyPageProps): Promise<Metadata> {
  const attestation = await fetchAttestation(params.uid);
  if (!attestation || attestation.uid === '0x0000000000000000000000000000000000000000000000000000000000000000' || attestation.schema.toLowerCase() !== SCHEMA_UID.toLowerCase()) {
    return {
      title: 'Diploma Not Found | Dojang Diploma',
      description: 'The requested diploma attestation could not be found or verified.',
    };
  }

  try {
    const decoded = decodeDiplomaData(attestation.data);
    return {
      title: `Diploma for ${decoded.studentName} | Dojang Diploma`,
      description: `${decoded.courseName} — issued by ${decoded.issuerName} on GIWA Chain.`,
      openGraph: {
        title: `Diploma for ${decoded.studentName} — Verified on GIWA`,
        description: `Verified completion of ${decoded.courseName} from ${decoded.issuerName}.`,
        type: 'website',
      },
    };
  } catch {
    return {
      title: 'Verified Diploma | Dojang Diploma',
      description: 'On-chain verifiable diploma on GIWA Sepolia Testnet.',
    };
  }
}

export default async function VerifyPage({ params }: VerifyPageProps) {
  const { uid, locale } = params;
  const attestation = await fetchAttestation(uid);
  const t = useTranslations('Verify');

  const isValidAttestation = 
    attestation && 
    attestation.uid !== '0x0000000000000000000000000000000000000000000000000000000000000000' && 
    attestation.schema.toLowerCase() === SCHEMA_UID.toLowerCase();

  if (!isValidAttestation) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 flex items-center justify-center p-6 bg-background relative">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-destructive/10 rounded-full blur-[100px] pointer-events-none" />
          <Card className="w-full max-w-md border-border/40 bg-card/60 backdrop-blur-md shadow-2xl text-center p-6">
            <CardHeader className="space-y-2">
              <div className="w-12 h-12 rounded-xl bg-destructive/10 text-destructive flex items-center justify-center mx-auto mb-2">
                <ShieldAlert className="h-6 w-6" />
              </div>
              <CardTitle className="font-display text-2xl">{t('notFoundTitle')}</CardTitle>
              <CardDescription>
                {t('notFoundDesc')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                {t('notFoundPrompt')}
              </p>
            </CardContent>
            <CardFooter className="flex justify-center">
              <Link href={`/${locale}`} className={cn(buttonVariants({ variant: "default" }), "gap-2")}>
                <ArrowLeft className="h-4 w-4" /> {t('btnBack')}
              </Link>
            </CardFooter>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  // Decode the data
  const data = decodeDiplomaData(attestation.data);

  // Determine status
  const now = Math.floor(Date.now() / 1000);
  const expirationTime = Number(attestation.expirationTime);
  const revocationTime = Number(attestation.revocationTime);

  let status: 'valid' | 'revoked' | 'expired' = 'valid';
  if (revocationTime > 0) {
    status = 'revoked';
  } else if (expirationTime > 0 && expirationTime < now) {
    status = 'expired';
  }

  const formattedCompletionDate = new Date(data.completionDate * 1000).toLocaleDateString(locale === 'ko' ? 'ko-KR' : 'en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const formattedIssueTime = new Date(Number(attestation.time) * 1000).toLocaleDateString(locale === 'ko' ? 'ko-KR' : 'en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  // Verify URL for share link
  const verifyUrl = `${process.env.NEXT_PUBLIC_EXPLORER_URL ? 'https://dojang-diploma.vercel.app' : 'http://localhost:3000'}/verify/${uid}`;

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <main className="flex-1 flex flex-col items-center justify-center py-16 px-4 bg-background relative overflow-hidden">
        {/* Background cosmic glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/10 rounded-full blur-[120px] pointer-events-none" />

        <div className="grid lg:grid-cols-[1fr_280px] gap-6 max-w-5xl w-full relative z-10 items-start">
          <div className="space-y-6 w-full">
            {/* Status Badge */}
            <div className="flex justify-center">
              {status === 'valid' && (
                <Badge className="bg-emerald-500 hover:bg-emerald-600 text-black px-4 py-1.5 text-xs font-semibold tracking-wider gap-1.5 shadow-lg shadow-emerald-500/10">
                  <UserCheck className="h-3.5 w-3.5" /> {t('verified')}
                </Badge>
              )}
              {status === 'revoked' && (
                <Badge variant="destructive" className="px-4 py-1.5 text-xs font-semibold tracking-wider gap-1.5 shadow-lg">
                  <ShieldAlert className="h-3.5 w-3.5" /> {t('revoked')}
                </Badge>
              )}
              {status === 'expired' && (
                <Badge className="bg-zinc-600 hover:bg-zinc-700 text-white px-4 py-1.5 text-xs font-semibold tracking-wider gap-1.5 shadow-lg">
                  <Calendar className="h-3.5 w-3.5" /> {t('expired')}
                </Badge>
              )}
            </div>

            {/* Diploma Card */}
            <Card className="border-border/40 bg-card/60 backdrop-blur-md shadow-2xl relative overflow-hidden">
              {/* Top decorative gradient border */}
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-primary via-violet-400 to-secondary" />

              <CardHeader className="text-center pt-10 pb-6 space-y-2">
                <Award className="h-12 w-12 text-primary mx-auto opacity-90" />
                <CardTitle className="font-display tracking-widest text-sm uppercase text-primary/80 mt-2">
                  {t('certTitle')}
                </CardTitle>
              </CardHeader>

              <CardContent className="px-6 md:px-10 text-center space-y-8 pb-10">
                <div className="space-y-2">
                  <span className="text-xs text-muted-foreground uppercase tracking-widest">{t('presentedTo')}</span>
                  <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground font-display">
                    {data.studentName}
                  </h2>
                </div>

                <div className="space-y-2">
                  <span className="text-xs text-muted-foreground uppercase tracking-widest">{t('forCompleting')}</span>
                  <p className="text-xl md:text-2xl font-medium text-violet-200">
                    {data.courseName}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-6 pt-4 max-w-md mx-auto">
                  <div className="space-y-1">
                    <span className="text-[10px] text-muted-foreground uppercase tracking-widest block">{t('completionDate')}</span>
                    <span className="text-sm font-semibold text-foreground">{formattedCompletionDate}</span>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] text-muted-foreground uppercase tracking-widest block">{t('verifiedIssuer')}</span>
                    <span className="text-sm font-semibold text-foreground">{data.issuerName}</span>
                  </div>
                </div>

                <Separator className="bg-border/30 my-6" />

                {/* Technical Details */}
                <div className="space-y-3.5 text-left text-xs text-muted-foreground max-w-lg mx-auto bg-black/20 p-4 rounded-xl border border-border/20">
                  <div className="flex justify-between items-center gap-4">
                    <span className="font-medium shrink-0">{t('recipientAddress')}</span>
                    <div className="flex items-center gap-1.5 overflow-hidden">
                      <span className="font-mono truncate">{attestation.recipient}</span>
                      <CopyButton text={attestation.recipient} />
                    </div>
                  </div>

                  <div className="flex justify-between items-center gap-4">
                    <span className="font-medium shrink-0">{t('issuerAddress')}</span>
                    <div className="flex items-center gap-1.5 overflow-hidden">
                      <span className="font-mono truncate">{attestation.attester}</span>
                      <CopyButton text={attestation.attester} />
                    </div>
                  </div>

                  <div className="flex justify-between items-center gap-4">
                    <span className="font-medium shrink-0">{t('issueDate')}</span>
                    <span>{formattedIssueTime}</span>
                  </div>

                  <div className="flex justify-between items-center gap-4">
                    <span className="font-medium shrink-0">{t('attestationUid')}</span>
                    <div className="flex items-center gap-1.5 overflow-hidden">
                      <span className="font-mono truncate">{uid}</span>
                      <CopyButton text={uid} />
                    </div>
                  </div>

                  {status === 'revoked' && (
                    <div className="flex justify-between items-center gap-4 text-destructive font-medium border-t border-destructive/10 pt-2 mt-2">
                      <span>{t('revokedDate')}</span>
                      <span>{new Date(revocationTime * 1000).toLocaleDateString(locale === 'ko' ? 'ko-KR' : 'en-US')}</span>
                    </div>
                  )}
                </div>
              </CardContent>

              <CardFooter className="flex flex-col sm:flex-row justify-center gap-4 p-6 border-t border-border/20 bg-card/40">
                <CopyButton
                  text={verifyUrl}
                  label={t('btnCopy')}
                  variant="outline"
                  className="w-full sm:w-auto h-10 px-4 text-foreground hover:bg-muted/80"
                />
                <a
                  href={`${EXPLORER_URL}/tx/${uid}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(buttonVariants({ variant: "default" }), "w-full sm:w-auto h-10 gap-2")}
                >
                  <ExternalLink className="h-4 w-4" /> {t('btnExplorer')}
                </a>
              </CardFooter>
            </Card>
          </div>

          {/* Sidebar / QR Code column */}
          <div className="space-y-6 w-full lg:sticky lg:top-24">
            <Card className="border-border/40 bg-card/60 backdrop-blur-md shadow-2xl p-6 flex flex-col items-center text-center space-y-4">
              <div className="space-y-1.5">
                <h4 className="font-display font-bold text-sm tracking-wide text-foreground">{t('offlineTitle')}</h4>
                <p className="text-[11px] text-muted-foreground leading-relaxed max-w-[200px]">
                  {t('offlineDesc')}
                </p>
              </div>
              <VerifyQR />
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
