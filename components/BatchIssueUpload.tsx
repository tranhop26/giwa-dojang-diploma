'use client';

import React, { useState, useRef } from 'react';
import { useWriteContract, useAccount } from 'wagmi';
import { useTranslations } from 'next-intl';
import Papa from 'papaparse';
import { toast } from 'sonner';
import { Button, buttonVariants } from '@/components/ui/button';
import { Card, CardHeader, CardContent, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertCircle, Upload, CheckCircle2, Download, ExternalLink, RefreshCw } from 'lucide-react';
import { encodeDiplomaData, type DiplomaData } from '@/lib/eas';
import { EAS_ADDRESS, SCHEMA_UID, EXPLORER_URL } from '@/lib/constants';
import { cn } from '@/lib/utils';
import Link from 'next/link';

interface ParsedRow {
  index: number;
  recipient: string;
  studentName: string;
  courseName: string;
  completionDate: string;
  isValid: boolean;
  error?: string;
}

interface IssuedDiploma {
  studentName: string;
  courseName: string;
  recipient: string;
  uid: string;
}

const EAS_ABI = [
  {
    inputs: [
      {
        components: [
          { name: 'schema', type: 'bytes32' },
          {
            components: [
              { name: 'recipient', type: 'address' },
              { name: 'expirationTime', type: 'uint64' },
              { name: 'revocable', type: 'bool' },
              { name: 'refUID', type: 'bytes32' },
              { name: 'data', type: 'bytes' },
              { name: 'value', type: 'uint256' },
            ],
            name: 'data',
            type: 'tuple[]',
          },
        ],
        name: 'multiRequests',
        type: 'tuple[]',
      },
    ],
    name: 'multiAttest',
    outputs: [{ name: '', type: 'bytes32[]' }],
    stateMutability: 'payable',
    type: 'function',
  },
] as const;

export default function BatchIssueUpload() {
  const [rows, setRows] = useState<ParsedRow[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [issuedDiplomas, setIssuedDiplomas] = useState<IssuedDiploma[]>([]);
  const t = useTranslations('Batch');
  const [txHash, setTxHash] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { address: connectedAddress } = useAccount();
  const { writeContractAsync } = useWriteContract();

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const toastId = toast.loading('Parsing CSV file...');
    
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const parsedRows: ParsedRow[] = results.data.map((row: any, i) => {
          const recipient = (row.recipient || '').trim();
          const studentName = (row.studentName || '').trim();
          const courseName = (row.courseName || '').trim();
          const completionDate = (row.completionDate || '').trim();
          
          let isValid = true;
          let error = '';

          // 1. Recipient check
          if (!/^0x[a-fA-F0-9]{40}$/.test(recipient)) {
            isValid = false;
            error = 'Invalid recipient address format. ';
          }
          // 2. Names checks
          if (!studentName) {
            isValid = false;
            error += 'Student name is empty. ';
          }
          if (!courseName) {
            isValid = false;
            error += 'Course name is empty. ';
          }
          // 3. Date check
          if (!completionDate || isNaN(new Date(completionDate).getTime())) {
            isValid = false;
            error += 'Invalid completion date format. ';
          }

          return {
            index: i + 1,
            recipient,
            studentName,
            courseName,
            completionDate,
            isValid,
            error: error.trim(),
          };
        });

        setRows(parsedRows);
        
        const invalidCount = parsedRows.filter(r => !r.isValid).length;
        if (invalidCount > 0) {
          toast.warning(`Parsed ${parsedRows.length} rows, but found ${invalidCount} validation errors.`, { id: toastId });
        } else {
          toast.success(`Successfully parsed ${parsedRows.length} valid rows!`, { id: toastId });
        }
      },
      error: (err) => {
        console.error('CSV parse error:', err);
        toast.error('Failed to parse CSV file.', { id: toastId });
      }
    });
  };

  const onSubmit = async () => {
    if (rows.length === 0 || rows.some(r => !r.isValid)) return;

    setIsSubmitting(true);
    const toastId = toast.loading(`Preparing batch of ${rows.length} diplomas...`);

    try {
      // 1. Encode all rows
      const attestData = rows.map(row => {
        const unixDate = Math.floor(new Date(row.completionDate).getTime() / 1000);
        const diplomaData: DiplomaData = {
          studentName: row.studentName,
          courseName: row.courseName,
          completionDate: unixDate,
          issuerName: 'GIWA Academy',
        };
        const encoded = encodeDiplomaData(diplomaData);
        return {
          recipient: row.recipient as `0x${string}`,
          expirationTime: 0n,
          revocable: true,
          refUID: '0x0000000000000000000000000000000000000000000000000000000000000000' as `0x${string}`,
          data: encoded as `0x${string}`,
          value: 0n,
        };
      });

      // 2. Submit transaction
      toast.loading('Confirm multiAttest transaction in your wallet...', { id: toastId });
      
      const hash = await writeContractAsync({
        address: EAS_ADDRESS,
        abi: EAS_ABI,
        functionName: 'multiAttest',
        account: connectedAddress,
        args: [
          [
            {
              schema: SCHEMA_UID,
              data: attestData,
            },
          ],
        ],
      });

      setTxHash(hash);
      toast.loading(`Transaction submitted! Confirming batch of ${rows.length} diplomas...`, { id: toastId });

      // 3. Wait for transaction receipt
      const receipt = await publicWaitForTx(hash);

      // 4. Extract all UIDs from logs
      const attestedLogs = receipt.logs.filter(
        (log: any) => log.address.toLowerCase() === EAS_ADDRESS.toLowerCase()
      );

      const uids = attestedLogs.map((log: any) => log.data).filter((uid: string) => uid && uid !== '0x');

      // 5. Map issued diplomas
      const results: IssuedDiploma[] = rows.map((row, idx) => ({
        studentName: row.studentName,
        courseName: row.courseName,
        recipient: row.recipient,
        uid: uids[idx] || hash, // Fallback to tx hash if log uid extraction failed
      }));

      setIssuedDiplomas(results);
      
      toast.success(`✅ Successfully issued ${results.length} diplomas!`, {
        id: toastId,
        action: {
          label: 'View Tx',
          onClick: () => window.open(`${EXPLORER_URL}/tx/${hash}`, '_blank'),
        },
      });
    } catch (error: any) {
      console.error('Batch issue failed:', error);
      
      let errorMsg = 'Failed to issue batch.';
      if (error.message?.includes('User rejected')) {
        errorMsg = 'Transaction rejected by user.';
      } else if (error.message?.includes('insufficient funds')) {
        errorMsg = 'Insufficient testnet ETH to cover gas.';
      }

      toast.error(`❌ Error: ${errorMsg}`, { id: toastId });
    } finally {
      setIsSubmitting(false);
    }
  };

  const publicWaitForTx = async (hash: `0x${string}`): Promise<any> => {
    const response = await fetch(`${process.env.NEXT_PUBLIC_RPC_URL || 'https://sepolia-rpc.giwa.io'}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'eth_getTransactionReceipt',
        params: [hash],
      }),
    });
    const result = await response.json();
    if (result.result) {
      return result.result;
    }
    await new Promise((resolve) => setTimeout(resolve, 1000));
    return publicWaitForTx(hash);
  };

  const hasInvalidRows = rows.some(r => !r.isValid);
  const canSubmit = rows.length > 0 && !hasInvalidRows && !isSubmitting;

  // Clear states to upload new CSV
  const resetUpload = () => {
    setRows([]);
    setIssuedDiplomas([]);
    setTxHash('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  if (issuedDiplomas.length > 0) {
    return (
      <Card className="w-full max-w-2xl mx-auto border-border/40 bg-card/60 backdrop-blur-md shadow-2xl">
        <CardHeader className="text-center pb-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center mx-auto mb-2">
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <CardTitle className="font-display text-2xl text-emerald-400">{t('successTitle')}</CardTitle>
          <CardDescription>
            {t('successDesc', { count: issuedDiplomas.length })}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-black/20 p-4 rounded-xl border border-border/20 text-xs flex justify-between items-center gap-4">
            <span className="text-muted-foreground font-medium">{t('txHash')}</span>
            <div className="flex items-center gap-1.5 overflow-hidden">
              <span className="font-mono text-muted-foreground truncate max-w-[200px]">{txHash}</span>
              <a
                href={`${EXPLORER_URL}/tx/${txHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline inline-flex items-center gap-1 shrink-0 ml-2"
              >
                {t('viewExplorer')} <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          </div>

          <div className="border border-border/30 rounded-xl overflow-hidden">
            <Table>
              <TableHeader className="bg-muted/40">
                <TableRow>
                  <TableHead className="text-xs">{t('tableStudent')}</TableHead>
                  <TableHead className="text-xs">{t('tableCourse')}</TableHead>
                  <TableHead className="text-xs text-right">{t('tableVerify')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {issuedDiplomas.map((dip, i) => (
                  <TableRow key={i}>
                    <TableCell className="font-medium text-sm py-3">{dip.studentName}</TableCell>
                    <TableCell className="text-xs text-muted-foreground py-3">{dip.courseName}</TableCell>
                    <TableCell className="text-right py-3">
                      <Link
                        href={`/verify/${dip.uid}`}
                        className={cn(buttonVariants({ variant: "outline", size: "xs" }), "h-7 text-xs gap-1")}
                      >
                        {t('btnVerify')} <ExternalLink className="h-3 w-3" />
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
        <CardFooter className="flex justify-center p-6 border-t border-border/20 bg-card/40">
          <Button onClick={resetUpload} variant="outline" className="gap-1.5 h-11 px-6">
            <Upload className="h-4 w-4" /> {t('btnAnother')}
          </Button>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-3xl mx-auto border-border/40 bg-card/60 backdrop-blur-md shadow-2xl">
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <CardTitle className="font-display text-2xl bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
              {t('title')}
            </CardTitle>
            <CardDescription>
              {t('desc')}
            </CardDescription>
          </div>
          
          <a
            href="/sample-batch.csv"
            download
            className={cn(buttonVariants({ variant: "outline", size: "sm" }), "h-9 gap-1.5 self-start sm:self-auto text-xs border-border/30 hover:bg-muted")}
          >
            <Download className="h-3.5 w-3.5" /> {t('sampleCsv')}
          </a>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Upload Container */}
        {rows.length === 0 ? (
          <div className="border-2 border-dashed border-border/40 hover:border-primary/40 rounded-2xl p-12 text-center transition-all bg-card/30 flex flex-col items-center justify-center group relative">
            <input
              type="file"
              accept=".csv"
              ref={fileInputRef}
              onChange={handleFileUpload}
              className="absolute inset-0 opacity-0 cursor-pointer"
            />
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-4 group-hover:scale-110 transition-transform duration-300">
              <Upload className="h-6 w-6" />
            </div>
            <h3 className="font-semibold text-lg mb-1">{t('uploadTitle')}</h3>
            <p className="text-sm text-muted-foreground max-w-sm mb-2">
              {t('uploadDesc')}
            </p>
            <span className="text-xs text-primary/70 font-medium">{t('uploadEncoding')}</span>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Action Bar */}
            <div className="flex items-center justify-between p-3.5 rounded-xl bg-card/45 border border-border/30 text-xs">
              <div className="flex items-center gap-2">
                <span className="font-bold text-foreground">{t('totalRows')}: {rows.length}</span>
                {hasInvalidRows && (
                  <span className="text-destructive font-semibold inline-flex items-center gap-1">
                    <AlertCircle className="h-3.5 w-3.5" /> {t('fixErrors')}
                  </span>
                )}
              </div>
              <Button onClick={resetUpload} size="xs" variant="outline" className="h-7 text-xs">
                {t('clearBtn')}
              </Button>
            </div>

            {/* Validation Table */}
            <div className="border border-border/30 rounded-xl overflow-hidden max-h-[350px] overflow-y-auto">
              <Table>
                <TableHeader className="bg-muted/40 sticky top-0 z-10 backdrop-blur-md">
                  <TableRow>
                    <TableHead className="w-12 text-xs">#</TableHead>
                    <TableHead className="text-xs">Student Name</TableHead>
                    <TableHead className="text-xs">Course Name</TableHead>
                    <TableHead className="text-xs">Completion Date</TableHead>
                    <TableHead className="text-xs">Recipient Address</TableHead>
                    <TableHead className="text-xs text-right">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map((row) => (
                    <TableRow
                      key={row.index}
                      className={cn(
                        !row.isValid && 'bg-destructive/10 hover:bg-destructive/15 text-destructive-foreground'
                      )}
                    >
                      <TableCell className="font-mono text-xs text-muted-foreground">{row.index}</TableCell>
                      <TableCell className="font-semibold text-foreground text-sm">{row.studentName || '—'}</TableCell>
                      <TableCell className="text-xs truncate max-w-[140px]">{row.courseName || '—'}</TableCell>
                      <TableCell className="text-xs font-mono">{row.completionDate || '—'}</TableCell>
                      <TableCell className="text-xs font-mono truncate max-w-[120px]">{row.recipient || '—'}</TableCell>
                      <TableCell className="text-right py-2.5">
                        {row.isValid ? (
                          <span className="text-emerald-400 text-xs font-medium">Valid</span>
                        ) : (
                          <span className="text-destructive text-[10px] font-bold block max-w-[150px] text-right truncate">
                            {row.error}
                          </span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        )}
      </CardContent>

      {rows.length > 0 && (
        <CardFooter className="flex justify-between items-center p-6 border-t border-border/20 bg-card/40 gap-4">
          <span className="text-xs text-muted-foreground">
            {t('footerNote')}
          </span>
          <Button
            onClick={onSubmit}
            disabled={!canSubmit}
            className="h-11 px-8 min-w-[180px] shadow-lg hover:shadow-primary/25"
          >
            {isSubmitting ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> {t('btnMinting')}
              </>
            ) : (
              t('btnMint', { count: rows.length })
            )}
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}
