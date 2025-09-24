import { webcrypto as nodeWebcrypto } from "node:crypto";

const subtle = globalThis.crypto?.subtle ?? nodeWebcrypto.subtle;

const TEXT_ENCODER = new TextEncoder();
const TEXT_DECODER = new TextDecoder();

export async function deriveAesKey(saltBase64?: string) {
  const secret = process.env.ENCRYPTION_SECRET!;
  const saltBytes = saltBase64 ? fromBase64(saltBase64) : nodeRandomBytes(16);
  const keyMaterial = await subtle.importKey(
    "raw",
    TEXT_ENCODER.encode(secret),
    "PBKDF2",
    false,
    ["deriveKey"],
  );
  const key = await subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: saltBytes,
      iterations: 100_000,
      hash: "SHA-256",
    },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"],
  );
  return { key, salt: toBase64(saltBytes) } as const;
}

export async function encryptString(plaintext: string) {
  const { key, salt } = await deriveAesKey();
  const iv = nodeRandomBytes(12);
  const ciphertext = await subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    TEXT_ENCODER.encode(plaintext),
  );
  return {
    salt,
    iv: toBase64(iv),
    ciphertext: toBase64(new Uint8Array(ciphertext)),
  } as const;
}

export async function decryptString(ciphertextB64: string, ivB64: string, saltB64: string) {
  const { key } = await deriveAesKey(saltB64);
  const data = fromBase64(ciphertextB64);
  const iv = fromBase64(ivB64);
  const plaintext = await subtle.decrypt(
    { name: "AES-GCM", iv },
    key,
    data,
  );
  return TEXT_DECODER.decode(plaintext);
}

function nodeRandomBytes(length: number) {
  // Use WebCrypto getRandomValues when available, else fallback to node WebCrypto
  const array = new Uint8Array(length);
  (globalThis.crypto ?? nodeWebcrypto).getRandomValues(array);
  return array;
}

function toBase64(bytes: Uint8Array) {
  if (typeof Buffer !== "undefined") return Buffer.from(bytes).toString("base64");
  let binary = "";
  bytes.forEach((b) => (binary += String.fromCharCode(b)));
  return btoa(binary);
}

function fromBase64(b64: string) {
  if (typeof Buffer !== "undefined") return new Uint8Array(Buffer.from(b64, "base64"));
  const binary = atob(b64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}


