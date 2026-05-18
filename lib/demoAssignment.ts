import type { Assignment } from "./types";

export const DEMO_ASSIGNMENT: Assignment = {
  title: "FizzBuzz",
  language: "python",
  prompt:
    "Print the numbers from 1 to 100. For multiples of 3 print \"Fizz\" instead of the number, for multiples of 5 print \"Buzz\", and for numbers that are multiples of both 3 and 5 print \"FizzBuzz\".",
  reference: `for n in range(1, 101):
    if n % 15 == 0:
        print("FizzBuzz")
    elif n % 3 == 0:
        print("Fizz")
    elif n % 5 == 0:
        print("Buzz")
    else:
        print(n)`,
  concepts: ["loops", "modulo operator", "conditionals", "string output"],
};
