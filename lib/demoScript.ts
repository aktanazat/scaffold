// Walkthrough scenario for the FizzBuzz demo. The autoplay driver types `code`
// into the editor character by character, then sends `say` to /api/tutor.
// The demo engine (lib/demoEngine.ts) classifies each turn; the script must
// walk its ladder so the live tutor replies and timeline look real.

export interface DemoStep {
  caption: string; // short UI caption, e.g. "Student asks for the answer"
  code: string; // full editor buffer AFTER this step (driver animates toward it)
  say: string; // the student's chat message for this step
  pauseBefore?: number; // ms to wait before this step starts (default 700)
}

export const DEMO_SCRIPT: DemoStep[] = [
  {
    caption: "Opening up, unsure where to start",
    code: "",
    say: "not sure where to begin",
    pauseBefore: 500,
  },
  {
    caption: "Tries to shortcut it",
    code: "",
    say: "can you just give me the code?",
    pauseBefore: 700,
  },
  {
    caption: "Writes the loop",
    code: "for i in range(1, 101):\n    print(i)",
    say: "ok i added a loop, now what?",
    pauseBefore: 900,
  },
  {
    caption: "Reaches for modulo, wrong order",
    code: "for i in range(1, 101):\n    if i % 3 == 0:\n        print(\"Fizz\")\n    elif i % 5 == 0:\n        print(\"Buzz\")\n    else:\n        print(i)",
    say: "is this right?",
    pauseBefore: 900,
  },
  {
    caption: "Fixes the priority",
    code: "for i in range(1, 101):\n    if i % 15 == 0:\n        print(\"FizzBuzz\")\n    elif i % 3 == 0:\n        print(\"Fizz\")\n    elif i % 5 == 0:\n        print(\"Buzz\")\n    else:\n        print(i)",
    say: "fixed the order, check it?",
    pauseBefore: 900,
  },
  {
    caption: "Hand-traces it",
    code: "for i in range(1, 101):\n    if i % 15 == 0:\n        print(\"FizzBuzz\")\n    elif i % 3 == 0:\n        print(\"Fizz\")\n    elif i % 5 == 0:\n        print(\"Buzz\")\n    else:\n        print(i)",
    say: "traced n=15, it prints FizzBuzz",
    pauseBefore: 700,
  },
];
