import { createWalletClient, http, createPublicClient, Hex } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { giwaSepolia } from '../lib/chain';
import * as fs from 'fs';
import * as path from 'path';

// Load .env.local manually
const envPath = path.resolve(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf-8');
  envContent.split(/\r?\n/).forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) return;
    const index = trimmed.indexOf('=');
    if (index !== -1) {
      const key = trimmed.substring(0, index).trim();
      let value = trimmed.substring(index + 1).trim();
      if (value.startsWith('"') && value.endsWith('"')) {
        value = value.slice(1, -1);
      } else if (value.startsWith("'") && value.endsWith("'")) {
        value = value.slice(1, -1);
      }
      process.env[key] = value;
    }
  });
}

const privateKey = process.env.DEPLOYER_PRIVATE_KEY;
if (!privateKey) {
  console.error('❌ Error: DEPLOYER_PRIVATE_KEY is missing in .env.local');
  process.exit(1);
}

// SchemaRegistry details
const SCHEMA_REGISTRY_ADDRESS = '0x4200000000000000000000000000000000000020' as const;
const SCHEMA_REGISTRY_ABI = [
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
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: 'uid', type: 'bytes32' },
      { indexed: true, name: 'registerer', type: 'address' },
    ],
    name: 'Registered',
    type: 'event',
  },
] as const;

async function main() {
  const rpcUrl = process.env.NEXT_PUBLIC_RPC_URL || 'https://sepolia-rpc.giwa.io';
  const account = privateKeyToAccount(privateKey as Hex);
  
  console.log(`Deploying from account: ${account.address}`);

  const walletClient = createWalletClient({
    account,
    chain: giwaSepolia,
    transport: http(rpcUrl),
  });

  const publicClient = createPublicClient({
    chain: giwaSepolia,
    transport: http(rpcUrl),
  });

  const schema = 'string studentName, string courseName, uint64 completionDate, string issuerName';
  const resolver = '0x0000000000000000000000000000000000000000' as const;
  const revocable = true;

  console.log('Registering schema...');
  
  const hash = await walletClient.writeContract({
    address: SCHEMA_REGISTRY_ADDRESS,
    abi: SCHEMA_REGISTRY_ABI,
    functionName: 'register',
    args: [schema, resolver, revocable],
  });

  console.log(`Transaction submitted: ${hash}`);
  console.log('Waiting for receipt...');

  const receipt = await publicClient.waitForTransactionReceipt({ hash });

  // Find the Registered event log and extract the schema UID
  const log = receipt.logs.find(
    (l) =>
      l.address.toLowerCase() === SCHEMA_REGISTRY_ADDRESS.toLowerCase()
  );

  if (!log) {
    console.error('❌ Registered event log not found in receipt.');
    process.exit(1);
  }

  // Registered event has topics: [eventSignature, uid, registerer]
  const schemaUid = log.topics[1];

  if (!schemaUid) {
    console.error('❌ Schema UID could not be extracted from event logs.');
    process.exit(1);
  }

  console.log(`\n✅ Schema registered!`);
  console.log(`Schema UID: ${schemaUid}`);
  console.log(`Transaction: ${process.env.NEXT_PUBLIC_EXPLORER_URL || 'https://sepolia-explorer.giwa.io'}/tx/${hash}`);
  console.log(`\n👉 Add this to .env.local:`);
  console.log(`NEXT_PUBLIC_SCHEMA_UID=${schemaUid}`);
}

main().catch((err) => {
  console.error('❌ Error executing script:', err);
  process.exit(1);
});
