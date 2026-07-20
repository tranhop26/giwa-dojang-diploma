'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { encodeDiplomaData, type DiplomaData } from '@/lib/eas';
import { EAS_ADDRESS, SCHEMA_UID, EXPLORER_URL } from '@/lib/constants';

const issueFormSchema = z.object({
  recipient: z.string().regex(/^0x[a-fA-F0-9]{40}$/, 'Must be a valid 40-character hex Ethereum address'),
  studentName: z.string().min(1, 'Student name is required'),
  courseName: z.string().min(1, 'Course name is required'),
  completionDate: z.string().min(1, 'Completion date is required'),
  issuerName: z.string().min(1, 'Issuer name is required'),
});

type IssueFormValues = z.infer<typeof issueFormSchema>;

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
            type: 'tuple',
          },
        ],
        name: 'request',
        type: 'tuple',
      },
    ],
    name: 'attest',
    outputs: [{ name: '', type: 'bytes32' }],
    stateMutability: 'payable',
    type: 'function',
  },
] as const;

export default function IssueForm() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { writeContractAsync } = useWriteContract();
  const t = useTranslations('Issue');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<IssueFormValues>({
    resolver: zodResolver(issueFormSchema),
    defaultValues: {
      recipient: '',
      studentName: '',
      courseName: '',
      completionDate: '',
      issuerName: '',
    },
  });

  const onSubmit = async (values: IssueFormValues) => {
    setIsSubmitting(true);
    const toastId = toast.loading('Encoding data and preparing transaction...');

    try {
      // 1. Convert date to unix seconds
      const unixDate = Math.floor(new Date(values.completionDate).getTime() / 1000);

      // 2. Encode the diploma details
      const diplomaData: DiplomaData = {
        studentName: values.studentName,
        courseName: values.courseName,
        completionDate: unixDate,
        issuerName: values.issuerName,
      };
      const encodedData = encodeDiplomaData(diplomaData);

      // 3. Send transaction
      toast.loading('Please confirm transaction in your wallet...', { id: toastId });
      
      const hash = await writeContractAsync({
        address: EAS_ADDRESS,
        abi: EAS_ABI,
        functionName: 'attest',
        args: [
          {
            schema: SCHEMA_UID,
            data: {
              recipient: values.recipient as `0x${string}`,
              expirationTime: 0n,
              revocable: true,
              refUID: '0x0000000000000000000000000000000000000000000000000000000000000000',
              data: encodedData as `0x${string}`,
              value: 0n,
            },
          },
        ],
      });

      toast.loading('Issuing diploma (waiting for transaction confirmation)...', { id: toastId });
      
      // 4. Wait for receipt
      const receipt = await publicWaitForTx(hash);
      
      // 5. Extract UID from Attested event logs
      // Attested event logs topic: Registered or Attested?
      // Attested(address indexed recipient, address indexed attester, bytes32 uid, bytes32 indexed schema)
      // Log event topic 0 = Attested signature
      // Log event topic 1 = recipient
      // Log event topic 2 = attester
      // Log event topic 3 = schema
      // Log data = uid (non-indexed)
      const attestedLog = receipt.logs.find(
        (log: any) => log.address.toLowerCase() === EAS_ADDRESS.toLowerCase()
      );

      let uid = '';
      if (attestedLog) {
        // uid is bytes32 parameter in data (usually 32 bytes hex)
        uid = attestedLog.data;
      }

      if (!uid || uid === '0x') {
        // Fallback: if we can't extract UID, use transaction hash or scan log topics
        console.warn('Could not extract UID from logs directly, searching topics...');
        // Sometimes uid is returned in topics or log.data contains it
        uid = receipt.logs[0]?.data || '';
      }

      toast.success('✅ Diploma issued successfully!', {
        id: toastId,
        description: 'Your attestation has been confirmed on GIWA Sepolia.',
        action: {
          label: 'View Tx',
          onClick: () => window.open(`${EXPLORER_URL}/tx/${hash}`, '_blank'),
        },
      });

      // Redirect to verification view
      if (uid && uid !== '0x') {
        router.push(`/verify/${uid}`);
      } else {
        router.push(`/my-diplomas`);
      }
    } catch (error: any) {
      console.error('Tx failed:', error);
      
      let errorMsg = 'Failed to issue diploma.';
      if (error.message?.includes('User rejected')) {
        errorMsg = 'Transaction rejected by user.';
      } else if (error.message?.includes('insufficient funds')) {
        errorMsg = 'Insufficient testnet ETH to cover gas.';
      } else if (error.message?.includes('chain')) {
        errorMsg = 'Wrong chain selected. Please switch to GIWA Sepolia.';
      }

      toast.error(`❌ Error: ${errorMsg}`, { id: toastId });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Helper to wait for receipt
  const publicWaitForTx = async (hash: `0x${string}`) => {
    // We can use native fetch or a quick poll, but since we are using wagmi we can use publicClient or wait
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
    // Poll every 1s
    await new Promise((resolve) => setTimeout(resolve, 1000));
    return publicWaitForTx(hash);
  };

  return (
    <Card className="w-full max-w-xl mx-auto border-border/40 bg-card/60 backdrop-blur-md shadow-2xl">
      <CardHeader>
        <CardTitle className="font-display text-2xl bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
          {t('title')}
        </CardTitle>
        <CardDescription>
          {t('desc')}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="recipient">{t('recipient')}</Label>
            <Input
              id="recipient"
              placeholder="0x..."
              {...register('recipient')}
              className={errors.recipient ? 'border-destructive ring-destructive/20' : ''}
              disabled={isSubmitting}
            />
            {errors.recipient && (
              <p className="text-xs text-destructive mt-1">{errors.recipient.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="studentName">{t('studentName')}</Label>
            <Input
              id="studentName"
              placeholder="Jane Doe"
              {...register('studentName')}
              className={errors.studentName ? 'border-destructive ring-destructive/20' : ''}
              disabled={isSubmitting}
            />
            {errors.studentName && (
              <p className="text-xs text-destructive mt-1">{errors.studentName.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="courseName">{t('courseName')}</Label>
            <Input
              id="courseName"
              placeholder="Fullstack Web3 Development"
              {...register('courseName')}
              className={errors.courseName ? 'border-destructive ring-destructive/20' : ''}
              disabled={isSubmitting}
            />
            {errors.courseName && (
              <p className="text-xs text-destructive mt-1">{errors.courseName.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="completionDate">{t('completionDate')}</Label>
            <Input
              id="completionDate"
              type="date"
              {...register('completionDate')}
              className={errors.completionDate ? 'border-destructive ring-destructive/20' : ''}
              disabled={isSubmitting}
            />
            {errors.completionDate && (
              <p className="text-xs text-destructive mt-1">{errors.completionDate.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="issuerName">{t('issuerName')}</Label>
            <Input
              id="issuerName"
              placeholder="GIWA Academy"
              {...register('issuerName')}
              className={errors.issuerName ? 'border-destructive ring-destructive/20' : ''}
              disabled={isSubmitting}
            />
            {errors.issuerName && (
              <p className="text-xs text-destructive mt-1">{errors.issuerName.message}</p>
            )}
          </div>

          <Button type="submit" className="w-full h-11" disabled={isSubmitting}>
            {isSubmitting ? t('btnSubmitting') : t('btnSubmit')}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
