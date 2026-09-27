import { createCipheriv, createDecipheriv, createHash, randomBytes } from "node:crypto";

// Server-only. Seals the teacher's reference solution with AES-256-GCM so the share link can
// carry it without a student being able to read it. The key comes from SCAFFOLD_SEAL_KEY and
// never leaves the server.

const IV_BYTES = 12;
const TAG_BYTES = 16;

function keyFrom(secret: string): Buffer {
  return createHash("sha256").update(secret).digest();
}

export function sealReference(reference: string, secret: string): string {
  const iv = randomBytes(IV_BYTES);
  const cipher = createCipheriv("aes-256-gcm", keyFrom(secret), iv);
  const body = Buffer.concat([cipher.update(reference, "utf8"), cipher.final()]);
  return Buffer.concat([iv, cipher.getAuthTag(), body]).toString("base64url");
}

// Returns null for a wrong key or a tampered token.
export function openReference(sealed: string, secret: string): string | null {
  try {
    const raw = Buffer.from(sealed, "base64url");
    const decipher = createDecipheriv("aes-256-gcm", keyFrom(secret), raw.subarray(0, IV_BYTES), {
      authTagLength: TAG_BYTES,
    });
    decipher.setAuthTag(raw.subarray(IV_BYTES, IV_BYTES + TAG_BYTES));
    return Buffer.concat([decipher.update(raw.subarray(IV_BYTES + TAG_BYTES)), decipher.final()]).toString("utf8");
  } catch {
    return null;
  }
}
