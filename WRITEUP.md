Scaffold — CodeHS 2026 Summer Intern Challenge

Links
- Live demo: deploy in one click (no config), https://vercel.com/new/clone?repository-url=https://github.com/aktanazat/scaffold then open /tutor?demo=1
- Source: https://github.com/aktanazat/scaffold
- Walkthrough video: [Loom link — to add]

What it is
Scaffold is an AI coding tutor a CS teacher deploys for a single assignment in under a minute. The teacher pastes the problem and a reference solution and gets a shareable link. Students open the link, write code, and talk to a tutor that gives one Socratic nudge at a time and never writes the solution. The teacher gets the part that is usually invisible: a live read of where each student got stuck, classified as syntax, logic, a missing concept, or an attempt to extract the answer.

Why I built this
I started by reading what actually wins at the hackathons CodeHS hires from: TreeHacks, Cal Hacks, HackMIT, Hack the North, four years each. Two patterns held. First, the education winners are saturated in one place and empty in another: there are fifty student-facing AI tutors and almost no teacher-facing tools, and the 2025 wave was explicitly about the harm of students using AI to avoid thinking. Second, the projects that win are one tight loop you can demo from a single link, not a platform. Scaffold sits exactly on that gap. It is a teacher tool, it attacks the strongest current thesis in education, and it is the kind of thing that fits a vibe-coding platform, which the brief asked for as a bonus.

The judgment call is the product itself. The easy build is another chatbot that answers questions. The right build inverts the default: the interesting work is not the code the AI writes, it is the code the AI refuses to write. Withholding the answer well is harder and more useful than giving it, and it is the only version a teacher would actually hand to a class.

Who it is for
CS teachers and TAs who cannot be in thirty places at once during a lab, and who currently have no way to see how a student got to an answer, only the answer.

Key decisions
- Stateless by design. The assignment, including the reference solution, is encoded into the share link. No database, no accounts, nothing to host. The reference is stripped before anything reaches the browser; the tutor reasons against it server-side only. This is why a teacher can go from idea to deployed tutor in a minute.
- A demo engine, not just a model. The app runs on Claude when a key is set, and on a deterministic Socratic engine when it is not. A reviewer can always test the link even with zero configuration, and the guardrail logic is provable without a model in the loop. I chose this after the public demo could not assume a server-side key.
- Coordination. I scoped a frozen type contract first, then ran the backend and the frontend in parallel as separate agents against it so neither blocked the other. The backend was meant to go to Codex; its auth was dead, so I rerouted to a second agent without losing the parallelism. That recovery is the point: the plan survived a broken tool because the contract, not the tool, was the source of truth.

What I would do next
Persist sessions so the misconception panel becomes a real class dashboard across students and time. Add a teacher view that aggregates the whole class's struggle map for one assignment, which is the signal a department head would pay for.

Time
About one hour, as suggested.
