import type { SharePayload, StudentAssignment } from "./types";

function b64encode(s: string): string {
  if (typeof window === "undefined") return Buffer.from(s, "utf-8").toString("base64url");
  return btoa(unescape(encodeURIComponent(s))).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function b64decode(s: string): string {
  const norm = s.replace(/-/g, "+").replace(/_/g, "/");
  if (typeof window === "undefined") return Buffer.from(norm, "base64").toString("utf-8");
  return decodeURIComponent(escape(atob(norm)));
}

// Picks only the fields a student may see, so an extra field (such as `reference` in a link
// made before sealing) is never carried forward.
export function toStudentAssignment(a: StudentAssignment): StudentAssignment {
  return {
    title: a.title,
    language: a.language,
    prompt: a.prompt,
    concepts: Array.isArray(a.concepts) ? a.concepts : [],
  };
}

// The share link token. Built only by POST /api/share, which seals the reference.
export function encodeShareToken(p: SharePayload): string {
  return b64encode(JSON.stringify(p));
}

export function decodeShareToken(token: string): SharePayload | null {
  try {
    const p = JSON.parse(b64decode(token)) as SharePayload;
    if (!p.title || !p.prompt || !p.language) return null;
    const sealedReference = typeof p.sealedReference === "string" ? p.sealedReference : undefined;
    return { ...toStudentAssignment(p), sealedReference };
  } catch {
    return null;
  }
}
