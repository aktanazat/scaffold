"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { Language } from "@/lib/types";
import { encodeAssignment } from "@/lib/share";
import { Nav } from "@/components/Nav";

const LANGS: { id: Language; label: string }[] = [
  { id: "python", label: "Python" },
  { id: "javascript", label: "JavaScript" },
  { id: "java", label: "Java" },
  { id: "cpp", label: "C++" },
];

export default function TeacherPage() {
  const [title, setTitle] = useState("");
  const [language, setLanguage] = useState<Language>("python");
  const [prompt, setPrompt] = useState("");
  const [reference, setReference] = useState("");
  const [concepts, setConcepts] = useState("");
  const [copied, setCopied] = useState(false);

  const ready = Boolean(title.trim() && prompt.trim() && reference.trim());

  const link = useMemo(() => {
    if (!ready) return "";
    const token = encodeAssignment({
      title: title.trim(),
      language,
      prompt: prompt.trim(),
      reference: reference.trim(),
      concepts: concepts.split(",").map((c) => c.trim()).filter(Boolean),
    });
    const origin = typeof window === "undefined" ? "" : window.location.origin;
    return `${origin}/tutor?a=${token}`;
  }, [ready, title, language, prompt, reference, concepts]);

  return (
    <div className="min-h-screen">
      <Nav active="compose" />

      <main className="page mx-auto w-full max-w-[920px] px-6">
        <section className="pt-32 pb-20">
          <p className="micro mb-7">Scaffold · AI tutoring for CS classrooms</p>
          <h1 className="serif text-[clamp(2.6rem,6vw,4.4rem)] leading-[1.04] max-w-[16ch]">
            The AI tutor that refuses to do the homework.
          </h1>
          <p className="mt-9 max-w-[54ch] text-[16px] leading-[1.7] text-[var(--muted)]">
            Every student already has an AI that hands them the answer. This is
            the one a teacher hands them instead. Paste an assignment and its
            solution. You get a link. Students get hints that never spell out the
            code, and you see exactly where each one got stuck.
          </p>
        </section>

        <hr className="rule" />

        <section className="grid gap-x-16 gap-y-10 py-16 md:grid-cols-[180px_1fr]">
          <div>
            <h2 className="serif text-[26px] leading-tight">Compose</h2>
            <p className="mt-3 text-[13.5px] leading-relaxed text-[var(--muted)]">
              No account. No database. The link is the whole product.
            </p>
          </div>

          <div className="space-y-9">
            <label className="block">
              <span className="micro">Title</span>
              <input
                className="field mt-3"
                placeholder="Two Sum — week 4 lab"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </label>

            <div>
              <span className="micro">Language</span>
              <div className="mt-4 flex flex-wrap gap-2">
                {LANGS.map((l) => (
                  <button
                    key={l.id}
                    onClick={() => setLanguage(l.id)}
                    className="btn-quiet"
                    style={
                      language === l.id
                        ? { borderColor: "var(--ink)", background: "var(--ink)", color: "var(--paper)" }
                        : undefined
                    }
                  >
                    {l.label}
                  </button>
                ))}
              </div>
            </div>

            <label className="block">
              <span className="micro">Problem the student sees</span>
              <textarea
                className="field mt-3 min-h-[76px] resize-y leading-relaxed"
                placeholder="Return the indices of the two numbers that add up to the target."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
              />
            </label>

            <label className="block">
              <span className="micro">Reference solution</span>
              <span className="ml-2 text-[11px] text-[var(--faint)]">
                server-side only · never sent to the student
              </span>
              <textarea
                className="code-field mt-3 min-h-[120px] resize-y"
                placeholder={"def two_sum(nums, target):\n    seen = {}"}
                value={reference}
                onChange={(e) => setReference(e.target.value)}
              />
            </label>

            <label className="block">
              <span className="micro">Target concepts</span>
              <input
                className="field mt-3"
                placeholder="hash maps, complement search, single pass"
                value={concepts}
                onChange={(e) => setConcepts(e.target.value)}
              />
            </label>

            <div className="pt-2">
              {ready ? (
                <div className="fade-up">
                  <span className="micro">Shareable student link</span>
                  <div className="mono mt-3 break-all border-b border-[var(--hairline)] pb-3 text-[12.5px] text-[var(--muted)]">
                    {link}
                  </div>
                  <div className="mt-5 flex items-center gap-3">
                    <button
                      className="btn"
                      onClick={() => {
                        navigator.clipboard.writeText(link);
                        setCopied(true);
                        setTimeout(() => setCopied(false), 1600);
                      }}
                    >
                      {copied ? "Copied" : "Copy link"}
                    </button>
                    <a className="btn-quiet" href={link} target="_blank" rel="noreferrer">
                      Open as student
                    </a>
                  </div>
                </div>
              ) : (
                <p className="text-[13.5px] text-[var(--faint)]">
                  Fill in a title, the problem, and a reference solution. The
                  link generates the moment it is valid.{" "}
                  <Link href="/tutor?demo=1" className="text-[var(--ink)] underline underline-offset-4">
                    Or skip to the FizzBuzz demo.
                  </Link>
                </p>
              )}
            </div>
          </div>
        </section>

        <hr className="rule" />

        <section className="grid gap-x-16 gap-y-8 py-16 md:grid-cols-[180px_1fr]">
          <h2 className="serif text-[26px] leading-tight">The idea</h2>
          <div className="max-w-[60ch] space-y-5 text-[15px] leading-[1.75] text-[var(--muted)]">
            <p>
              The easy build is another chatbot that answers questions. The
              interesting work is the answer it withholds. A tutor that hands
              over the code teaches a student to wait for the next prompt; one
              that refuses teaches them to read their own.
            </p>
            <p className="text-[var(--ink)]">
              So Scaffold gives one nudge per turn, never more than two lines of
              code, and never the reference. The part it sends back to you is
              the part teaching has always been blind to: where the thinking
              broke, not just whether the answer was right.
            </p>
          </div>
        </section>

        <footer className="flex items-center justify-between py-12 text-[12px] text-[var(--faint)]">
          <span>Scaffold</span>
          <span>Built for the CodeHS 2026 Summer Intern Challenge</span>
        </footer>
      </main>
    </div>
  );
}
