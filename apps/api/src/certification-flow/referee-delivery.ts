import { createCipheriv, createDecipheriv, createHash, randomBytes } from 'node:crypto';

import { FlowRuleError } from './certification-flow-rules';

const PREFIX = 'enc:v1:';
let ephemeralKey: Buffer | null = null;

function deliveryKey(): Buffer {
  const configured = process.env['REFEREE_DELIVERY_KEY']?.trim() ?? '';
  if (configured.length > 0) {
    return createHash('sha256').update(configured).digest();
  }
  const env = process.env['NODE_ENV'];
  if (env === 'development' || env === 'test') {
    ephemeralKey ??= randomBytes(32);
    return ephemeralKey;
  }
  throw new FlowRuleError('DELIVERY_KEY_UNCONFIGURED');
}

/** Opaque payload for the referee delivery channel. The API response never carries this secret. */
export function sealDelivery(plaintext: string): string {
  const iv = randomBytes(12);
  const cipher = createCipheriv('aes-256-gcm', deliveryKey(), iv);
  const ciphertext = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `${PREFIX}${Buffer.concat([iv, tag, ciphertext]).toString('base64url')}`;
}

export function openDelivery(payload: string): string {
  if (!payload.startsWith(PREFIX)) {
    throw new FlowRuleError('DELIVERY_OPAQUE');
  }
  const raw = Buffer.from(payload.slice(PREFIX.length), 'base64url');
  if (raw.length < 28) {
    throw new FlowRuleError('DELIVERY_OPAQUE');
  }
  const iv = raw.subarray(0, 12);
  const tag = raw.subarray(12, 28);
  const ciphertext = raw.subarray(28);
  const decipher = createDecipheriv('aes-256-gcm', deliveryKey(), iv);
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(ciphertext), decipher.final()]).toString('utf8');
}
