// Shared contract between frontend and backend. Do not change shape without updating both sides.

export type Language = "python" | "javascript" | "java" | "cpp";

// A teacher-authored assignment. Encoded into the share link (base64 JSON), no DB.
export interface Assignment {
  title: string;
  language: Language;
  prompt: string; // the problem statement students see
  reference: string; // teacher's reference solution. NEVER sent to the student client. Server-only reasoning aid.
  concepts: string[]; // target concepts, e.g. ["loops", "modulo", "string formatting"]
}

// What the student client knows. Note: `reference` is stripped before encoding the student link.
export type StudentAssignment = Omit<Assignment, "reference">;

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
  code: string; // student's current code buffer
  messages: ChatMessage[]; // full conversation so far, last item is the new student message
}

export type TutorResponse = TutorTurn & { mode: "live" | "demo" };
