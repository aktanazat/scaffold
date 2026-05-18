import type { StruggleKind } from "./types";

export interface StoredTurn {
  kind: StruggleKind;
  concept: string | null;
  withheld: boolean;
}

export interface StoredSession {
  id: string;
  student: string;
  title: string;
  turns: StoredTurn[];
}

const KEY = "scaffold.sessions.v1";

function readAll(): StoredSession[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? "[]") as StoredSession[];
  } catch {
    return [];
  }
}

export function newSessionId(): string {
  return Math.random().toString(36).slice(2, 8);
}

export function recordTurn(
  session: { id: string; student: string; title: string },
  turn: StoredTurn,
) {
  if (typeof window === "undefined") return;
  const all = readAll();
  let s = all.find((x) => x.id === session.id);
  if (!s) {
    s = { id: session.id, student: session.student, title: session.title, turns: [] };
    all.push(s);
  }
  s.turns.push(turn);
  localStorage.setItem(KEY, JSON.stringify(all.slice(-40)));
}

export function sessionsFor(title: string): StoredSession[] {
  return readAll().filter((s) => s.title === title);
}
