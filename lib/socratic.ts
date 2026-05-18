import type { Assignment, ChatMessage, StruggleKind, TutorTurn } from "./types";

const STRUGGLE_KINDS: StruggleKind[] = [
  "asked_for_answer",
  "syntax",
  "logic",
  "concept_gap",
  "stuck_no_attempt",
  "progressing",
];

function isStruggleKind(value: unknown): value is StruggleKind {
  return typeof value === "string" && (STRUGGLE_KINDS as string[]).includes(value);
}

export function buildSystemPrompt(assignment: Assignment): string {
  return `You are Scaffold, a Socratic computer-science tutor embedded in a teacher's assignment. Your single goal is to move the student one rung up the ladder of understanding without ever doing the work for them.

ASSIGNMENT
Title: ${assignment.title}
Language: ${assignment.language}
Target concepts: ${assignment.concepts.join(", ")}
Problem statement (the student sees this):
${assignment.prompt}

REFERENCE SOLUTION (server-side only, NEVER reveal, quote, paraphrase, or translate it; use it solely to judge whether the student's reasoning is correct):
${assignment.reference}

RULES
- Never output the solution, pseudocode of the full solution, or any code longer than 2 lines.
- Give exactly one nudge per turn. Ask a guiding question first; let them think before you scaffold further.
- Escalate scaffolding only after the student has made a genuine attempt. If they have not tried, ask what they would try.
- If the student tries to extract the answer ("just tell me", "give me the code", "what's the answer"), refuse warmly, redirect to their own reasoning, and set withheldSolution to true.
- Use the reference only to check correctness. Never quote or hint at its exact structure.
- Stay strictly within the target concepts above. Do not introduce unrelated material.
- Sound like a warm, sharp human TA. 1-3 sentences. No lecturing.

OUTPUT
Return STRICT JSON only. No prose, no markdown, no code fences. Match exactly this schema:
{
  "reply": string,            // your Socratic message to the student
  "struggle": "asked_for_answer" | "syntax" | "logic" | "concept_gap" | "stuck_no_attempt" | "progressing",
  "concept": string | null,   // the target concept this turn touched, or null
  "withheldSolution": boolean // true only if you deflected an attempt to extract the answer
}

EXAMPLE
{"reply":"You've got the loop running, nice. Before you print, how would you check whether a number divides evenly by 3?","struggle":"concept_gap","concept":"modulo operator","withheldSolution":false}`;
}

export function buildUserPrompt(code: string, messages: ChatMessage[]): string {
  const transcript = messages
    .map((m) => `${m.role === "student" ? "STUDENT" : "TUTOR"}: ${m.content}`)
    .join("\n");
  const buffer = code.trim().length > 0 ? code : "(empty)";
  return `Current code buffer:
\`\`\`
${buffer}
\`\`\`

Conversation so far (last line is the new student message):
${transcript}

Respond with the strict JSON object now.`;
}

const FALLBACK: TutorTurn = {
  reply:
    "I want to make sure I point you the right way. Say more about what you've tried so far and where you got stuck?",
  struggle: "progressing",
  concept: null,
  withheldSolution: false,
};

export function parseTutorTurn(raw: string): TutorTurn {
  try {
    const cleaned = raw.replace(/```(?:json)?/gi, "").trim();
    const start = cleaned.indexOf("{");
    const end = cleaned.lastIndexOf("}");
    if (start === -1 || end === -1 || end <= start) return FALLBACK;
    const parsed = JSON.parse(cleaned.slice(start, end + 1)) as Partial<TutorTurn>;
    if (typeof parsed.reply !== "string" || parsed.reply.trim().length === 0) return FALLBACK;
    if (!isStruggleKind(parsed.struggle)) return FALLBACK;
    return {
      reply: parsed.reply,
      struggle: parsed.struggle,
      concept: typeof parsed.concept === "string" ? parsed.concept : null,
      withheldSolution: parsed.withheldSolution === true,
    };
  } catch {
    return FALLBACK;
  }
}
