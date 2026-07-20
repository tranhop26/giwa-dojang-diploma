import * as fs from 'fs';
import * as path from 'path';

// Load env vars
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

// Type definitions to import dynamically
type DiplomaData = {
  studentName: string;
  courseName: string;
  completionDate: number; // unix seconds
  issuerName: string;
};

async function testRoundTrip() {
  console.log('Testing encode/decode round-trip...');
  
  const { encodeDiplomaData, decodeDiplomaData } = await import('../eas');
  
  const originalData: DiplomaData = {
    studentName: 'John Doe',
    courseName: 'GIWA Solidity Smart Contract Development',
    completionDate: Math.floor(Date.now() / 1000),
    issuerName: 'GIWA Bootcamp 2026',
  };

  const encoded = encodeDiplomaData(originalData);
  const decoded = decodeDiplomaData(encoded);

  console.log('Original data:', originalData);
  console.log('Decoded data:', decoded);

  if (
    originalData.studentName === decoded.studentName &&
    originalData.courseName === decoded.courseName &&
    originalData.completionDate === decoded.completionDate &&
    originalData.issuerName === decoded.issuerName
  ) {
    console.log('✅ Round-trip OK');
  } else {
    throw new Error('❌ Round-trip failed: Decoded data does not match original');
  }
}

async function testQueryZeroAddress() {
  console.log('\nTesting query attestations for zero address...');
  const { getAttestationsByRecipient } = await import('../queries');
  const zeroAddress = '0x0000000000000000000000000000000000000000';
  const results = await getAttestationsByRecipient(zeroAddress);
  console.log('Results (expected []):', results);
  if (Array.isArray(results) && results.length === 0) {
    console.log('✅ Query zero address OK');
  } else {
    throw new Error(`❌ Expected empty array, got: ${JSON.stringify(results)}`);
  }
}

async function main() {
  try {
    await testRoundTrip();
    await testQueryZeroAddress();
    console.log('\n🎉 All library tests passed!');
  } catch (err) {
    console.error('❌ Test failed:', err);
    process.exit(1);
  }
}

main();
