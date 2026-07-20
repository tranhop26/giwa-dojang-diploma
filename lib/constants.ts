export const CHAIN_ID = Number(process.env.NEXT_PUBLIC_CHAIN_ID || '91342');
export const RPC_URL = process.env.NEXT_PUBLIC_RPC_URL || 'https://sepolia-rpc.giwa.io';
export const EXPLORER_URL = process.env.NEXT_PUBLIC_EXPLORER_URL || 'https://sepolia-explorer.giwa.io';
export const EAS_ADDRESS = (process.env.NEXT_PUBLIC_EAS_CONTRACT_ADDRESS || '0x4200000000000000000000000000000000000021') as `0x${string}`;
export const SCHEMA_REGISTRY_ADDRESS = (process.env.NEXT_PUBLIC_SCHEMA_REGISTRY_ADDRESS || '0x4200000000000000000000000000000000000020') as `0x${string}`;

export const DIPLOMA_SCHEMA = "string studentName, string courseName, uint64 completionDate, string issuerName";

export const SCHEMA_UID = process.env.NEXT_PUBLIC_SCHEMA_UID as `0x${string}`;

if (!SCHEMA_UID) {
  throw new Error(
    "Missing NEXT_PUBLIC_SCHEMA_UID. Please register your schema using 'pnpm register-schema' and add the UID to your .env.local file."
  );
}
