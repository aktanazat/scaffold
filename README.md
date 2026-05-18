# Scaffold

The AI tutor that refuses to do the homework.

Every student now has an AI that hands them the answer. Scaffold is the one a teacher hands them instead. A CS teacher pastes an assignment and its reference solution, gets a shareable link, and sends it to a class. Students get Socratic hints that never spell out the code. The teacher gets a live read of where each student got stuck: syntax, logic, or a missing concept.

## Try it

Live: **https://scaffold-mocha.vercel.app**

- [Built-in FizzBuzz tutor session](https://scaffold-mocha.vercel.app/tutor?demo=1)
- [Teacher class dashboard](https://scaffold-mocha.vercel.app/class)
- Or compose your own assignment on the home page and share the generated link.

It ships with a deterministic demo engine, so the public link works with zero configuration.

## Run locally

```bash
npm install
npm run dev          # http://localhost:3000
```

Optional live mode: set `ANTHROPIC_API_KEY` and the tutor runs on `claude-sonnet-4-6`. With no key it falls back to the deterministic demo engine, so the public link never breaks for a reviewer.

## How it works

- **Stateless.** The assignment (including the reference solution) is base64-encoded into the share link. No database, nothing to host, no accounts. The reference is stripped before anything reaches the student's browser; the tutor reasons against it server-side only.
- **Guardrail.** The system prompt and the demo engine both enforce one rule hard: never output the solution, never reveal the reference, never paste more than two lines of code. If a student tries to extract the answer, the tutor redirects and the turn is flagged.
- **Signal back to the teacher.** Every turn is classified into a struggle kind (`asked_for_answer`, `syntax`, `logic`, `concept_gap`, `stuck_no_attempt`, `progressing`) and mapped to a target concept, rendered as a live misconception panel.

## Stack

Next.js 15 (App Router) · TypeScript · Tailwind v4 · Anthropic SDK · deployed on Vercel.

Built for the CodeHS 2026 Summer Intern Challenge.
