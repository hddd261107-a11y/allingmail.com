/**
 * Utilities for client-side cryptographic security & password generation.
 * All computations use native Web Crypto API and run 100% locally in browser.
 */

// Generate a random secure password
export interface PasswordGenOptions {
  length: number;
  useUpper: boolean;
  useLower: boolean;
  useNumbers: boolean;
  useSymbols: boolean;
}

export function generateSecurePassword(options: PasswordGenOptions): string {
  const { length, useUpper, useLower, useNumbers, useSymbols } = options;
  const upperChars = 'ABCDEFGHJKLMNPQRSTUVWXYZ'; // exclude ambiguous I, O
  const lowerChars = 'abcdefghijkmnopqrstuvwxyz'; // exclude ambiguous l
  const numberChars = '23456789'; // exclude 0, 1
  const symbolChars = '!@#$%^&*-_=+?';

  let pool = '';
  const guaranteed: string[] = [];

  if (useUpper) {
    pool += upperChars;
    guaranteed.push(upperChars[Math.floor(Math.random() * upperChars.length)]);
  }
  if (useLower) {
    pool += lowerChars;
    guaranteed.push(lowerChars[Math.floor(Math.random() * lowerChars.length)]);
  }
  if (useNumbers) {
    pool += numberChars;
    guaranteed.push(numberChars[Math.floor(Math.random() * numberChars.length)]);
  }
  if (useSymbols) {
    pool += symbolChars;
    guaranteed.push(symbolChars[Math.floor(Math.random() * symbolChars.length)]);
  }

  if (!pool) {
    pool = lowerChars + numberChars;
    guaranteed.push(lowerChars[0]);
  }

  const remainingLength = Math.max(0, length - guaranteed.length);
  const randomBytes = new Uint32Array(remainingLength);
  window.crypto.getRandomValues(randomBytes);

  const result = [...guaranteed];
  for (let i = 0; i < remainingLength; i++) {
    result.push(pool[randomBytes[i] % pool.length]);
  }

  // Shuffle array securely
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }

  return result.join('');
}

// Simple password strength checker (0 to 4)
export function evaluatePasswordStrength(password: string): {
  score: number;
  label: string;
  colorClass: string;
} {
  if (!password) {
    return { score: 0, label: 'Trống', colorClass: 'text-slate-400' };
  }

  let score = 0;
  if (password.length >= 8) score += 1;
  if (password.length >= 12) score += 1;
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score += 1;
  if (/\d/.test(password)) score += 1;
  if (/[^A-Za-z0-9]/.test(password)) score += 1;

  // Normalized to 1-4
  const normalized = Math.min(4, Math.max(1, score));

  switch (normalized) {
    case 1:
      return { score: 1, label: 'Yếu', colorClass: 'text-rose-500' };
    case 2:
      return { score: 2, label: 'Trung bình', colorClass: 'text-amber-500' };
    case 3:
      return { score: 3, label: 'Mạnh', colorClass: 'text-emerald-500' };
    case 4:
    default:
      return { score: 4, label: 'Rất an toàn', colorClass: 'text-cyan-400' };
  }
}

// AES-GCM 256-bit Key derivation from master passphrase
async function deriveKey(passphrase: string, salt: Uint8Array): Promise<CryptoKey> {
  const enc = new TextEncoder();
  const keyMaterial = await window.crypto.subtle.importKey(
    'raw',
    enc.encode(passphrase),
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  );

  return window.crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt as unknown as BufferSource,
      iterations: 100000,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

// Encrypt payload to base64
export async function encryptVaultData(plainText: string, passphrase: string): Promise<string> {
  const enc = new TextEncoder();
  const salt = window.crypto.getRandomValues(new Uint8Array(16));
  const iv = window.crypto.getRandomValues(new Uint8Array(12));
  const key = await deriveKey(passphrase, salt);

  const encryptedContent = await window.crypto.subtle.encrypt(
    { name: 'AES-GCM', iv: iv as unknown as BufferSource },
    key,
    enc.encode(plainText) as unknown as BufferSource
  );

  const combined = new Uint8Array(salt.length + iv.length + encryptedContent.byteLength);
  combined.set(salt, 0);
  combined.set(iv, salt.length);
  combined.set(new Uint8Array(encryptedContent), salt.length + iv.length);

  return btoa(String.fromCharCode(...combined));
}

// Decrypt base64 payload
export async function decryptVaultData(cipherBase64: string, passphrase: string): Promise<string> {
  const rawStr = atob(cipherBase64);
  const combined = new Uint8Array(rawStr.length);
  for (let i = 0; i < rawStr.length; i++) {
    combined[i] = rawStr.charCodeAt(i);
  }

  const salt = combined.slice(0, 16);
  const iv = combined.slice(16, 28);
  const ciphertext = combined.slice(28);

  const key = await deriveKey(passphrase, salt);
  const decrypted = await window.crypto.subtle.decrypt(
    { name: 'AES-GCM', iv: iv as unknown as BufferSource },
    key,
    ciphertext as unknown as BufferSource
  );

  return new TextDecoder().decode(decrypted);
}
