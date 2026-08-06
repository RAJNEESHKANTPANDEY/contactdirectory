// Edge-compatible auth helpers. Uses the Web Crypto API (available in both
// the Node.js runtime and the Edge runtime) so the same code can verify
// sessions in middleware and in API routes.

export const SESSION_COOKIE = 'dh_session';
const SECRET = process.env.SESSION_SECRET || 'directoryhq-dev-secret-change-me';
const SESSION_HOURS = 12;

function toBase64Url(bytes: ArrayBuffer | Uint8Array): string {
  const arr = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  let str = '';
  for (const b of arr) str += String.fromCharCode(b);
  return btoa(str).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function fromBase64Url(input: string): Uint8Array {
  const b64 = input.replace(/-/g, '+').replace(/_/g, '/');
  const padded = b64 + '='.repeat((4 - (b64.length % 4)) % 4);
  const str = atob(padded);
  const arr = new Uint8Array(str.length);
  for (let i = 0; i < str.length; i++) arr[i] = str.charCodeAt(i);
  return arr;
}

async function getKey(): Promise<CryptoKey> {
  const enc = new TextEncoder().encode(SECRET);
  return crypto.subtle.importKey('raw', enc, { name: 'HMAC', hash: 'SHA-256' }, false, [
    'sign',
    'verify',
  ]);
}

export async function createSessionToken(username: string): Promise<string> {
  const payload = {
    sub: username,
    role: 'admin',
    exp: Date.now() + SESSION_HOURS * 60 * 60 * 1000,
  };
  const payloadB64 = toBase64Url(new TextEncoder().encode(JSON.stringify(payload)));
  const key = await getKey();
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(payloadB64));
  const sigB64 = toBase64Url(sig);
  return `${payloadB64}.${sigB64}`;
}

export async function verifySessionToken(token: string | undefined | null): Promise<boolean> {
  if (!token) return false;
  const parts = token.split('.');
  if (parts.length !== 2) return false;
  const [payloadB64, sigB64] = parts;
  try {
    const key = await getKey();
    const valid = await crypto.subtle.verify(
      'HMAC',
      key,
      fromBase64Url(sigB64) as BufferSource,
      new TextEncoder().encode(payloadB64) as BufferSource
    );
    if (!valid) return false;
    const payload = JSON.parse(new TextDecoder().decode(fromBase64Url(payloadB64)));
    if (!payload.exp || Date.now() > payload.exp) return false;
    return true;
  } catch {
    return false;
  }
}

export function checkPassword(password: string): boolean {
  const plain = process.env.ADMIN_PASSWORD || 'admin123';
  return password === plain;
}
