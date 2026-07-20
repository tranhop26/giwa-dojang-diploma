import { createPublicClient, http } from 'viem';
import { giwaSepolia } from '../lib/chain';

async function main() {
  const client = createPublicClient({
    chain: giwaSepolia,
    transport: http('https://sepolia-rpc.giwa.io'),
  });
  const block = await client.getBlockNumber();
  console.log("Current block:", block.toString());
}
main();
