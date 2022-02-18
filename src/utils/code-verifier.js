import { Crypto } from "@peculiar/webcrypto";
import crypto from 'crypto';

function _base64UrlEncode(byteArray) {
    const charCodes = String.fromCharCode(...byteArray);
    return Buffer.from(charCodes, 'binary')
        .toString('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=/g, '');
}

async function _sha256(verifier) {
    const msgBuffer = new TextEncoder('utf-8').encode(verifier);
    // hash the message
    const webcrypto = new Crypto();
    const hashBuffer = await webcrypto.subtle.digest('SHA-256', msgBuffer);
    return new Uint8Array(hashBuffer);
}

export async function generateVerifierChallengePair() {
  const randomBytes = crypto.randomBytes(32);
  const verifier = _base64UrlEncode(randomBytes);
  const challenge = await _sha256(verifier).then(_base64UrlEncode);
  return [verifier, challenge];
}

export function generateRandomStateOrNonce() {
  const randomBytes = crypto.randomBytes(32);
  return _base64UrlEncode(randomBytes);
}