import type { StudentAssignment } from "./types";

// Client-safe demo (no reference solution). Title MUST match DEMO_ASSIGNMENT.title
// so the API route swaps in the server-side reference.
export const DEMO_STUDENT: StudentAssignment = {
  title: "FizzBuzz",
  language: "python",
  prompt:
    "Print the numbers from 1 to 100. For multiples of 3 print \"Fizz\" instead of the number, for multiples of 5 print \"Buzz\", and for multiples of both 3 and 5 print \"FizzBuzz\".",
  concepts: ["loops", "modulo operator", "conditionals", "string output"],
};
