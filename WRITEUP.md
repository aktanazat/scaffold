Scaffold: CodeHS 2026 Summer Intern Challenge

Links
- Live: https://scaffold-mocha.vercel.app
- Watch it solve itself: https://scaffold-mocha.vercel.app/tutor?demo=1&auto=1
- Teacher dashboard: https://scaffold-mocha.vercel.app/class
- Source: https://github.com/aktanazat/scaffold
- Loom walkthrough: [add link before submitting]

What it is
An AI coding tutor a CS teacher deploys for one assignment in under a minute. Paste the problem and a reference solution, get a shareable link. Students get Socratic hints that never write the code or reveal the solution. The teacher gets a live read of where each student got stuck.

Why I built it
I read four years of winners at TreeHacks, Cal Hacks, HackMIT, and Hack the North. There are fifty student-facing AI tutors and almost no teacher tools, and the strongest thesis in 2025 was that students now use AI to skip the thinking. The hard part is the answer the tutor withholds. That is the only version a teacher would actually hand to a class, and it is the one nobody built.

Who it is for
CS teachers and TAs who cannot be in thirty places at once during a lab.

How it holds up
Stateless: the assignment encodes into the link, no database, and the reference solution never reaches the student's browser. It ships with a deterministic engine so the public link works with zero setup, and the demo plays itself at a human typing cadence so a reviewer sees the full loop without touching a key.

Built in a focused session, with subagents handling the backend and the typing model in parallel. The walkthrough video above shows it end to end.
