import { SchemaEncoder } from '@ethereum-attestation-service/eas-sdk';
import { createPublicClient, http } from 'viem';
import { giwaSepolia } from './chain';
import { RPC_URL, DIPLOMA_SCHEMA } from './constants';

export type DiplomaData = {
  studentName: string;
  courseName: string;
  completionDate: number; // unix seconds
  issuerName: string;
};

export function encodeDiplomaData(data: DiplomaData): string {
  const schemaEncoder = new SchemaEncoder(DIPLOMA_SCHEMA);
  return schemaEncoder.encodeData([
    { name: "studentName", value: data.studentName, type: "string" },
    { name: "courseName", value: data.courseName, type: "string" },
    { name: "completionDate", value: data.completionDate, type: "uint64" },
    { name: "issuerName", value: data.issuerName, type: "string" },
  ]);
}

export function decodeDiplomaData(rawData: string): DiplomaData {
  const schemaEncoder = new SchemaEncoder(DIPLOMA_SCHEMA);
  const decoded = schemaEncoder.decodeData(rawData);
  
  const studentNameItem = decoded.find(item => item.name === 'studentName');
  const courseNameItem = decoded.find(item => item.name === 'courseName');
  const completionDateItem = decoded.find(item => item.name === 'completionDate');
  const issuerNameItem = decoded.find(item => item.name === 'issuerName');

  return {
    studentName: (studentNameItem?.value.value as string) || '',
    courseName: (courseNameItem?.value.value as string) || '',
    completionDate: Number(completionDateItem?.value.value || 0),
    issuerName: (issuerNameItem?.value.value as string) || '',
  };
}

export function getPublicClient() {
  return createPublicClient({
    chain: giwaSepolia,
    transport: http(RPC_URL),
  });
}
