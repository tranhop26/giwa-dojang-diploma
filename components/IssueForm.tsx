'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useWriteContract, useAccount, useReadContract } from 'wagmi';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';
import { AlertTriangle, Sparkles } from 'lucide-react';
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { encodeDiplomaData, type DiplomaData } from '@/lib/eas';
import { EAS_ADDRESS, SCHEMA_UID, EXPLORER_URL, SCHEMA_REGISTRY_ADDRESS, DIPLOMA_SCHEMA } from '@/lib/constants';

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

const SCHEMA_REGISTRY_ABI = [
  {
    inputs: [{ name: 'uid', type: 'bytes32' }],
    name: 'getSchema',
    outputs: [
      {
        components: [
          { name: 'uid', type: 'bytes32' },
          { name: 'resolver', type: 'address' },
          { name: 'revocable', type: 'bool' },
          { name: 'schema', type: 'string' },
        ],
        name: '',
        type: 'tuple',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { name: 'schema', type: 'string' },
      { name: 'resolver', type: 'address' },
      { name: 'revocable', type: 'bool' },
    ],
    name: 'register',
    outputs: [{ name: '', type: 'bytes32' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
] as const;

export default function IssueForm() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const { address: connectedAddress } = useAccount();
  const { writeContractAsync } = useWriteContract();
  const t = useTranslations('Issue');

  // Check if Schema is registered on-chain
  const { data: schemaData, refetch: refetchSchema } = useReadContract({
    address: SCHEMA_REGISTRY_ADDRESS,
    abi: SCHEMA_REGISTRY_ABI,
    functionName: 'getSchema',
    args: [SCHEMA_UID],
  });

  const isSchemaRegistered = Boolean(
    schemaData &&
    schemaData.uid &&
    schemaData.uid !== '0x0000000000000000000000000000000000000000000000000000000000000000'
  );

  const handleRegisterSchema = async (): Promise<boolean> => {
    setIsRegistering(true);
    const toastId = toast.loading('Registering diploma schema on GIWA Sepolia...');
    try {
      const hash = await writeContractAsync({
        address: SCHEMA_REGISTRY_ADDRESS,
        abi: SCHEMA_REGISTRY_ABI,
        functionName: 'register',
        account: connectedAddress,
        args: [DIPLOMA_SCHEMA, '0x0000000000000000000000000000000000000000', true],
      });

      toast.loading('Schema transaction submitted. Waiting for confirmation...', { id: toastId });
      await publicWaitForTx(hash);
      toast.success('✅ Schema registered successfully on GIWA Sepolia!', { id: toastId });
      refetchSchema();
      return true;
    } catch (err: any) {
      console.error('Register schema failed:', err);
      toast.error('❌ Failed to register schema: ' + (err.shortMessage || err.message), { id: toastId });
      return false;
    } finally {
      setIsRegistering(false);
    }
  };

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<IssueFormValues>({
    resolver: zodResolver(issueFormSchema),
    mode: 'onSubmit',
    reValidateMode: 'onBlur',
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

    // 0. Ensure schema is registered first
    if (!isSchemaRegistered) {
      const ok = await handleRegisterSchema();
      if (!ok) {
        setIsSubmitting(false);
        return;
      }
    }

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
        account: connectedAddress,
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
      
      const attestedLog = receipt.logs.find(
        (log: any) => log.address.toLowerCase() === EAS_ADDRESS.toLowerCase()
      );

      let uid = '';
      if (attestedLog) {
        uid = attestedLog.data;
      }

      if (!uid || uid === '0x') {
        console.warn('Could not extract UID from logs directly, searching topics...');
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
        {!isSchemaRegistered && (
          <div className="p-4 mb-6 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs space-y-2">
            <div className="flex items-center gap-2 font-bold text-amber-400 text-sm">
              <AlertTriangle className="h-4 w-4" /> Action Required: Register Schema On-Chain
            </div>
            <p>
              The EAS Diploma Schema must be registered on GIWA Sepolia before issuing attestations. Click below to register it once (gas fee ~0.00005 ETH).
            </p>
            <Button
              type="button"
              size="sm"
              onClick={handleRegisterSchema}
              disabled={isRegistering}
              className="bg-amber-500 hover:bg-amber-600 text-black font-semibold h-8 text-xs cursor-pointer shadow-md"
            >
              {isRegistering ? (
                'Registering Schema...'
              ) : (
                <span className="flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5" /> 1-Click Register Schema On-Chain
                </span>
              )}
            </Button>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="recipient">{t('recipient')}</Label>
              {connectedAddress && (
                <button
                  type="button"
                  onClick={() => setValue('recipient', connectedAddress)}
                  className="text-[11px] text-primary hover:underline font-medium cursor-pointer"
                >
                  Use My Connected Address ({connectedAddress.slice(0, 6)}...{connectedAddress.slice(-4)})
                </button>
              )}
            </div>
            <Input
              id="recipient"
              placeholder="0x..."
              defaultValue=""
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
