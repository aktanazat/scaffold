// Shared contract between frontend and backend. Do not change shape without updating both sides.

export type Language = "python" | "javascript" | "java" | "cpp";

// A teacher-authored assignment, as the teacher page posts it to /api/share. No DB.
export interface Assignment {
  title: string;
  language: Language;
  prompt: string; // the problem statement students see
  reference: string; // teacher's reference solution. Only ever reaches the link sealed with a server-only key.
  concepts: string[]; // target concepts, e.g. ["loops", "modulo", "string formatting"]
}

// What the student client knows.
export type StudentAssignment = Omit<Assignment, "reference">;

// What the share link token decodes to. `sealedReference` is AES-GCM ciphertext that only the
// server can open; it is absent when the server has no SCAFFOLD_SEAL_KEY.
export type SharePayload = StudentAssignment & { sealedReference?: string };

// POST /api/share response
export interface ShareResponse {
  token: string;
  referenceSealed: boolean;
}

export type Role = "student" | "tutor";

export interface ChatMessage {
  role: Role;
  content: string;
}

// Struggle signal the tutor classifies on every turn. Powers the live misconception panel.
export type StruggleKind =
  | "asked_for_answer" // student tried to get the solution handed to them
  | "syntax" // tripped on language syntax
  | "logic" // wrong approach / off-by-one / control flow
  | "concept_gap" // missing a required concept
  | "stuck_no_attempt" // not attempting, fishing
  | "progressing"; // moving forward fine

export interface TutorTurn {
  reply: string; // Socratic message shown to the student
  struggle: StruggleKind;
  concept: string | null; // which target concept this turn touched, if any
  withheldSolution: boolean; // true if the student tried to extract the answer and we deflected
}

// POST /api/tutor request/response
export interface TutorRequest {
  assignment: StudentAssignment;
  sealedReference?: string; // passed through from the share link, opened server-side
  code: string; // student's current code buffer
  messages: ChatMessage[]; // full conversation so far, last item is the new student message
}

export type TutorResponse = TutorTurn & { mode: "live" | "demo" };
