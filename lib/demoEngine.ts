import type { ChatMessage, TutorRequest, TutorTurn } from "./types";

function lastStudentMessage(messages: ChatMessage[]): string {
  for (let i = messages.length - 1; i >= 0; i--) {
    if (messages[i].role === "student") return messages[i].content;
  }
  return "";
}

const ANSWER_PHRASES = [
  "give me the code",
  "give me the answer",
  "just tell me",
  "what's the answer",
  "whats the answer",
  "what is the answer",
  "show me the solution",
  "write it for me",
  "tell me the answer",
  "the answer",
  "the solution",
];

export function demoTutorTurn(req: TutorRequest): TutorTurn {
  const msg = lastStudentMessage(req.messages).toLowerCase().trim();
  const code = req.code;
  const lower = code.toLowerCase();

  if (ANSWER_PHRASES.some((p) => msg.includes(p))) {
    return {
      reply:
        "I'm not going to hand you the code. You'll actually remember this if you build it yourself. Walk me through what you think the first step is and we'll go from there.",
      struggle: "asked_for_answer",
      concept: null,
      withheldSolution: true,
    };
  }

  const hasLoop = /\b(for|while)\b/.test(lower);
  const hasMod = code.includes("%");
  const checks3 = /%\s*3\b/.test(code);
  const checks5 = /%\s*5\b/.test(code);
  const checks15 = /%\s*15\b/.test(code);
  const combinedFirst =
    /%\s*3[^\n]*(and|&&)[^\n]*%\s*5|%\s*5[^\n]*(and|&&)[^\n]*%\s*3/.test(code);
  const bothCase = checks15 || combinedFirst;
  const codeEmpty = code.trim().length === 0;
  const vagueMsg = msg.length < 25;

  if (codeEmpty && vagueMsg) {
    return {
      reply:
        "Start with the loop. Which construct in Python lets you walk through every number from 1 to 100 in order?",
      struggle: "stuck_no_attempt",
      concept: "loops",
      withheldSolution: false,
    };
  }

  if (hasLoop && !hasMod) {
    return {
      reply:
        "Good, the loop is moving. Now think about divisibility: what operator tells you whether a number divides evenly by 3 with nothing left over?",
      struggle: "concept_gap",
      concept: "modulo operator",
      withheldSolution: false,
    };
  }

  if (hasMod && checks3 && checks5 && !bothCase && !combinedFirst) {
    return {
      reply:
        "You're checking 3 and 5 separately, but trace n=15 in your head: which branch catches it right now? Think about the order your conditions run in.",
      struggle: "logic",
      concept: "conditionals",
      withheldSolution: false,
    };
  }

  if (hasLoop && checks3 && checks5 && (bothCase || combinedFirst)) {
    return {
      reply:
        "That ordering looks right. Hand-trace n=15 line by line and tell me what it prints. If that matches what you expect, you're basically there.",
      struggle: "progressing",
      concept: "conditionals",
      withheldSolution: false,
    };
  }

  return {
    reply:
      "You're making progress. What's the next case you haven't handled yet, and how would you test it on a single number?",
    struggle: "progressing",
    concept: null,
    withheldSolution: false,
  };
}
