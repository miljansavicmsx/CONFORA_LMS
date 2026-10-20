import { deflateSync } from 'node:zlib';

/** Bitstring status list: bit 1 means the credential is withdrawn. */
export function statusListBits(revokedIndexes: readonly number[]): Buffer {
  const highest = revokedIndexes.reduce((max, index) => Math.max(max, index), 0);
  const length = Math.max(16, Math.ceil((highest + 1) / 8));
  const bytes = Buffer.alloc(length);
  for (const index of revokedIndexes) {
    const byteIndex = Math.floor(index / 8);
    const bit = index % 8;
    const current = bytes[byteIndex] ?? 0;
    bytes[byteIndex] = current | (1 << bit);
  }
  return bytes;
}

export function encodedStatusList(revokedIndexes: readonly number[]): string {
  return deflateSync(statusListBits(revokedIndexes)).toString('base64url');
}

export function statusListCredential(
  encodedList: string,
  statusListUrl: string,
): Record<string, unknown> {
  return {
    '@context': ['https://www.w3.org/ns/credentials/v2'],
    type: ['VerifiableCredential', 'BitstringStatusListCredential'],
    issuer: 'https://confora.example/issuers/development',
    credentialSubject: {
      id: statusListUrl,
      type: 'BitstringStatusList',
      statusPurpose: 'revocation',
      encodedList,
    },
  };
}
