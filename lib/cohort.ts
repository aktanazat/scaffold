import type { StoredSession } from "./sessionStore";

// Seeded class so the dashboard tells a story on the live link.
// Only applies to the built-in FizzBuzz demo; real assignments show only live sessions.
const FIZZBUZZ_COHORT: StoredSession[] = [
  {
    id: "seed-1", student: "Maya R.", title: "FizzBuzz",
    turns: [
      { kind: "stuck_no_attempt", concept: "loops", withheld: false },
      { kind: "concept_gap", concept: "modulo operator", withheld: false },
      { kind: "progressing", concept: "conditionals", withheld: false },
      { kind: "progressing", concept: "string output", withheld: false },
    ],
  },
  {
    id: "seed-2", student: "Devon K.", title: "FizzBuzz",
    turns: [
      { kind: "asked_for_answer", concept: null, withheld: true },
      { kind: "asked_for_answer", concept: null, withheld: true },
      { kind: "concept_gap", concept: "modulo operator", withheld: false },
      { kind: "logic", concept: "conditionals", withheld: false },
    ],
  },
  {
    id: "seed-3", student: "Priya S.", title: "FizzBuzz",
    turns: [
      { kind: "progressing", concept: "loops", withheld: false },
      { kind: "logic", concept: "conditionals", withheld: false },
      { kind: "logic", concept: "conditionals", withheld: false },
      { kind: "progressing", concept: "conditionals", withheld: false },
    ],
  },
  {
    id: "seed-4", student: "Theo B.", title: "FizzBuzz",
    turns: [
      { kind: "syntax", concept: "loops", withheld: false },
      { kind: "syntax", concept: "string output", withheld: false },
      { kind: "concept_gap", concept: "modulo operator", withheld: false },
    ],
  },
  {
    id: "seed-5", student: "Lin W.", title: "FizzBuzz",
    turns: [
      { kind: "progressing", concept: "loops", withheld: false },
      { kind: "progressing", concept: "modulo operator", withheld: false },
      { kind: "progressing", concept: "conditionals", withheld: false },
      { kind: "progressing", concept: "string output", withheld: false },
    ],
  },
  {
    id: "seed-6", student: "Omar H.", title: "FizzBuzz",
    turns: [
      { kind: "asked_for_answer", concept: null, withheld: true },
      { kind: "stuck_no_attempt", concept: "loops", withheld: false },
      { kind: "concept_gap", concept: "modulo operator", withheld: false },
    ],
  },
];

export function seededCohort(title: string): StoredSession[] {
  return title === "FizzBuzz" ? FIZZBUZZ_COHORT : [];
}
