import type { Assignment, StudentAssignment } from "./types";

function b64encode(s: string): string {
  if (typeof window === "undefined") return Buffer.from(s, "utf-8").toString("base64url");
  return btoa(unescape(encodeURIComponent(s))).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function b64decode(s: string): string {
  const norm = s.replace(/-/g, "+").replace(/_/g, "/");
  if (typeof window === "undefined") return Buffer.from(norm, "base64").toString("utf-8");
  return decodeURIComponent(escape(atob(norm)));
}

// Teacher link carries the full assignment (incl. reference, used server-side only).
export function encodeAssignment(a: Assignment): string {
  return b64encode(JSON.stringify(a));
}

export function decodeAssignment(token: string): Assignment | null {
  try {
    const a = JSON.parse(b64decode(token)) as Assignment;
    if (!a.title || !a.prompt || !a.language) return null;
    return a;
  } catch {
    return null;
  }
}

export function toStudentAssignment(a: Assignment): StudentAssignment {
  const { reference, ...rest } = a;
  void reference;
  return rest;
}
