import { EAS_ADDRESS, SCHEMA_UID } from './constants';
import { getPublicClient, decodeDiplomaData, type DiplomaData } from './eas';

export type AttestationRecord = {
  uid: string;
  data: DiplomaData;
  issuer: string;
  time: number;
  revocationTime: number;
};

export async function getAttestationsByRecipient(
  recipient: `0x${string}`,
  includeRevoked: boolean = true
): Promise<AttestationRecord[]> {
  const publicClient = getPublicClient();

  try {
    const currentBlock = await publicClient.getBlockNumber();
    const fromBlock = currentBlock - BigInt(95000) > BigInt(0) ? currentBlock - BigInt(95000) : BigInt(0);

    const logs = await publicClient.getLogs({
      address: EAS_ADDRESS,
      event: {
        type: 'event',
        name: 'Attested',
        inputs: [
          { indexed: true, name: 'recipient', type: 'address' },
          { indexed: true, name: 'attester', type: 'address' },
          { indexed: false, name: 'uid', type: 'bytes32' },
          { indexed: true, name: 'schema', type: 'bytes32' },
        ],
      },
      args: {
        recipient,
        schema: SCHEMA_UID,
      },
      fromBlock,
    });

    // Get unique UIDs
    const uids = Array.from(
      new Set(
        logs
          .map((log) => log.args.uid)
          .filter((uid): uid is `0x${string}` => !!uid)
      )
    );

    const attestationPromises = uids.map(async (uid) => {
      try {
        const att = await publicClient.readContract({
          address: EAS_ADDRESS,
          abi: [
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
          ],
          functionName: 'getAttestation',
          args: [uid],
        });

        return att;
      } catch (error) {
        console.error(`Failed to fetch attestation for UID ${uid}:`, error);
        return null;
      }
    });

    const rawAttestations = await Promise.all(attestationPromises);

    const parsedAttestations = rawAttestations
      .filter(
        (att): att is NonNullable<typeof att> =>
          att !== null &&
          att.uid !== '0x0000000000000000000000000000000000000000000000000000000000000000'
      )
      .map((att) => {
        const decodedData = decodeDiplomaData(att.data);
        return {
          uid: att.uid,
          data: decodedData,
          issuer: att.attester,
          time: Number(att.time),
          revocationTime: Number(att.revocationTime),
        };
      });

    const filtered = includeRevoked
      ? parsedAttestations
      : parsedAttestations.filter((att) => att.revocationTime === 0);

    return filtered.sort((a, b) => b.time - a.time);
  } catch (error) {
    console.error('Failed to fetch logs or attestations:', error);
    return [];
  }
}
