import { createCipheriv, createDecipheriv, randomBytes } from "node:crypto";

const ALGO = "aes-256-gcm";
const IV_LENGTH = 12;

function getKeyBuffer() {
  const raw = process.env.BSN_ENCRYPTION_KEY;
  if (!raw) throw new Error("BSN_ENCRYPTION_KEY is not configured");

  const normalized = raw.trim();
  let key: Buffer;
  if (/^[0-9a-fA-F]{64}$/.test(normalized)) {
    key = Buffer.from(normalized, "hex");
  } else {
    key = Buffer.from(normalized, "base64");
  }

  if (key.length !== 32) throw new Error("BSN_ENCRYPTION_KEY must decode to 32 bytes");
  return key;
}

export function encryptString(value: string): string {
  const key = getKeyBuffer();
  const iv = randomBytes(IV_LENGTH);
  const cipher = createCipheriv(ALGO, key, iv);
  const encrypted = Buffer.concat([cipher.update(value, "utf8"), cipher.final()]);
  const authTag = cipher.getAuthTag();
  return `v1:${iv.toString("base64")}:${authTag.toString("base64")}:${encrypted.toString("base64")}`;
}

export function decryptString(payload: string): string {
  const [version, ivB64, tagB64, dataB64] = payload.split(":");
  if (version !== "v1" || !ivB64 || !tagB64 || !dataB64) throw new Error("Invalid encrypted payload format");
  const key = getKeyBuffer();
  const decipher = createDecipheriv(ALGO, key, Buffer.from(ivB64, "base64"));
  decipher.setAuthTag(Buffer.from(tagB64, "base64"));
  const decrypted = Buffer.concat([decipher.update(Buffer.from(dataB64, "base64")), decipher.final()]);
  return decrypted.toString("utf8");
}

