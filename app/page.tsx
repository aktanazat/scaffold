"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { Language } from "@/lib/types";
import { encodeAssignment } from "@/lib/share";

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

  const ready = title.trim() && prompt.trim() && reference.trim();

  const link = useMemo(() => {
    if (!ready) return "";
    const token = encodeAssignment({
      title: title.trim(),
      language,
      prompt: prompt.trim(),
      reference: reference.trim(),
      concepts: concepts
        .split(",")
        .map((c) => c.trim())
        .filter(Boolean),
    });
    const origin = typeof window === "undefined" ? "" : window.location.origin;
    return `${origin}/tutor?a=${token}`;
  }, [ready, title, language, prompt, reference, concepts]);

  return (
    <main className="mx-auto w-full max-w-[1080px] px-6 py-10">
      <header className="flex items-center justify-between">
        <div className="flex items-baseline gap-3">
          <span className="text-[20px] font-semibold tracking-tight">Scaffold</span>
          <span className="label hidden sm:block">AI tutoring for CS classrooms</span>
        </div>
        <Link href="/tutor?demo=1" className="btn-ghost">
          Open the live demo →
        </Link>
      </header>

      <section className="mt-16 max-w-[680px] rise">
        <h1 className="text-[40px] leading-[1.08] font-semibold tracking-tight">
          The AI tutor that refuses to do the homework.
        </h1>
        <p className="mt-5 text-[16px] leading-relaxed text-[var(--text-dim)]">
          Every student now has an AI that hands them the answer. Scaffold is the
          one a teacher hands them instead. Paste an assignment and its solution;
          you get a link. Students get Socratic hints that never spell out the
          code, and you see exactly where each one got stuck.
        </p>
      </section>

      <section className="mt-12 grid gap-5 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="panel p-6 rise">
          <div className="label mb-5">Compose an assignment</div>

          <div className="grid gap-4">
            <div className="grid gap-2">
              <label className="label">Title</label>
              <input
                className="field"
                placeholder="Two Sum, week 4"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div className="grid gap-2">
              <label className="label">Language</label>
              <div className="flex flex-wrap gap-2">
                {LANGS.map((l) => (
                  <button
                    key={l.id}
                    onClick={() => setLanguage(l.id)}
                    className="btn-ghost"
                    style={
                      language === l.id
                        ? { borderColor: "var(--accent)", color: "var(--text)" }
                        : undefined
                    }
                  >
                    {l.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid gap-2">
              <label className="label">Problem the student sees</label>
              <textarea
                className="field min-h-[110px] resize-y leading-relaxed"
                placeholder="Given an array of integers, return indices of the two numbers that add up to a target."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
              />
            </div>

            <div className="grid gap-2">
              <label className="label">
                Reference solution — server-side only, never sent to the student
              </label>
              <textarea
                className="field mono min-h-[120px] resize-y text-[13px] leading-relaxed"
                placeholder={"def two_sum(nums, target):\n    ..."}
                value={reference}
                onChange={(e) => setReference(e.target.value)}
              />
            </div>

            <div className="grid gap-2">
              <label className="label">Target concepts — comma separated</label>
              <input
                className="field"
                placeholder="hash maps, complement search, single pass"
                value={concepts}
                onChange={(e) => setConcepts(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="panel flex flex-col p-6 rise">
          <div className="label mb-5">Shareable student link</div>

          {ready ? (
            <div className="flex flex-1 flex-col">
              <div className="panel mono break-all bg-[var(--panel-2)] p-3 text-[12px] leading-relaxed text-[var(--text-dim)]">
                {link}
              </div>
              <div className="mt-4 flex gap-2">
                <button
                  className="btn flex-1"
                  onClick={() => {
                    navigator.clipboard.writeText(link);
                    setCopied(true);
                    setTimeout(() => setCopied(false), 1600);
                  }}
                >
                  {copied ? "Copied" : "Copy link"}
                </button>
                <a className="btn-ghost" href={link} target="_blank" rel="noreferrer">
                  Preview
                </a>
              </div>
              <p className="mt-5 text-[13px] leading-relaxed text-[var(--text-faint)]">
                The solution is encoded for the server only. The student client
                never receives it; the tutor reasons against it privately.
              </p>
            </div>
          ) : (
            <div className="flex flex-1 flex-col justify-between">
              <p className="text-[14px] leading-relaxed text-[var(--text-faint)]">
                Fill in a title, the problem, and a reference solution. The link
                generates instantly — no account, no database, nothing to host.
              </p>
              <Link href="/tutor?demo=1" className="btn-ghost mt-6 text-center">
                Skip ahead — try the FizzBuzz demo
              </Link>
            </div>
          )}
        </div>
      </section>

      <section className="mt-12 grid gap-px overflow-hidden rounded-[10px] border border-[var(--line)] bg-[var(--line)] sm:grid-cols-3">
        {[
          {
            k: "Who it's for",
            v: "CS teachers and TAs who can't be in 30 places at once during a lab.",
          },
          {
            k: "What it refuses",
            v: "Writing the solution, pasting code over two lines, or revealing your reference.",
          },
          {
            k: "What you get back",
            v: "A live read of each student's struggle: syntax, logic, or a concept gap.",
          },
        ].map((c) => (
          <div key={c.k} className="bg-[var(--panel)] p-6">
            <div className="label mb-2">{c.k}</div>
            <p className="text-[14px] leading-relaxed text-[var(--text-dim)]">{c.v}</p>
          </div>
        ))}
      </section>

      <footer className="mt-14 text-[12px] text-[var(--text-faint)]">
        Scaffold · built for the CodeHS Summer Intern Challenge
      </footer>
    </main>
  );
}
