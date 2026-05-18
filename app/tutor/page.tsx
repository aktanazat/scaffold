"use client";

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import type {
  ChatMessage,
  StruggleKind,
  StudentAssignment,
  TutorResponse,
} from "@/lib/types";
import { decodeAssignment, toStudentAssignment } from "@/lib/share";
import { DEMO_STUDENT } from "@/lib/demoStudent";

export const dynamic = "force-dynamic";

const STRUGGLE: Record<StruggleKind, { label: string; tone: string }> = {
  asked_for_answer: { label: "Asked for the answer", tone: "var(--bad)" },
  syntax: { label: "Syntax", tone: "var(--warn)" },
  logic: { label: "Logic", tone: "var(--warn)" },
  concept_gap: { label: "Concept gap", tone: "var(--bad)" },
  stuck_no_attempt: { label: "Not attempting", tone: "var(--warn)" },
  progressing: { label: "Progressing", tone: "var(--good)" },
};

interface Turn {
  kind: StruggleKind;
  concept: string | null;
  withheld: boolean;
  at: number;
}

function TutorView() {
  const sp = useSearchParams();

  const assignment: StudentAssignment | null = useMemo(() => {
    if (sp.get("demo") === "1") return DEMO_STUDENT;
    const token = sp.get("a");
    if (!token) return null;
    const full = decodeAssignment(token);
    return full ? toStudentAssignment(full) : null;
  }, [sp]);

  const [code, setCode] = useState("");
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [turns, setTurns] = useState<Turn[]>([]);
  const [busy, setBusy] = useState(false);
  const [mode, setMode] = useState<"live" | "demo" | null>(null);
  const scroller = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!assignment) return;
    setMessages([
      {
        role: "tutor",
        content: `I'm your tutor for "${assignment.title}". Tell me your plan, or paste what you've tried. I won't write the solution for you, but I'll get you unstuck.`,
      },
    ]);
  }, [assignment]);

  useEffect(() => {
    scroller.current?.scrollTo({ top: scroller.current.scrollHeight, behavior: "smooth" });
  }, [messages, busy]);

  if (!assignment) {
    return (
      <main className="mx-auto max-w-[560px] px-6 py-28 text-center">
        <h1 className="text-[22px] font-semibold">No assignment in this link.</h1>
        <p className="mt-3 text-[14px] text-[var(--text-dim)]">
          Ask your teacher for the link, or try the demo.
        </p>
        <Link href="/tutor?demo=1" className="btn mt-7 inline-block">
          Open the FizzBuzz demo
        </Link>
      </main>
    );
  }

  async function send() {
    const text = input.trim();
    if (!text || busy) return;
    const next: ChatMessage[] = [...messages, { role: "student", content: text }];
    setMessages(next);
    setInput("");
    setBusy(true);
    try {
      const res = await fetch("/api/tutor", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ assignment, code, messages: next }),
      });
      const data = (await res.json()) as TutorResponse;
      setMode(data.mode);
      setMessages((m) => [...m, { role: "tutor", content: data.reply }]);
      setTurns((t) => [
        ...t,
        { kind: data.struggle, concept: data.concept, withheld: data.withheldSolution, at: Date.now() },
      ]);
    } catch {
      setMessages((m) => [
        ...m,
        { role: "tutor", content: "I lost that one. Say it again?" },
      ]);
    } finally {
      setBusy(false);
    }
  }

  const withheldCount = turns.filter((t) => t.withheld).length;
  const conceptState = assignment.concepts.map((c) => {
    const hits = turns.filter((t) => t.concept === c);
    const last = hits[hits.length - 1];
    const status = !last
      ? "untouched"
      : last.kind === "progressing"
        ? "progressing"
        : "shaky";
    return { c, status };
  });

  return (
    <main className="mx-auto grid h-screen w-full max-w-[1280px] grid-rows-[auto_1fr] gap-4 px-5 py-5">
      <header className="flex items-center justify-between">
        <div className="flex items-baseline gap-3">
          <Link href="/" className="text-[16px] font-semibold tracking-tight">
            Scaffold
          </Link>
          <span className="label">{assignment.title}</span>
        </div>
        <div className="flex items-center gap-3">
          {mode && (
            <span className="label" style={{ color: "var(--text-dim)" }}>
              {mode === "live" ? "Live model" : "Demo engine"}
            </span>
          )}
          <span className="label">{assignment.language}</span>
        </div>
      </header>

      <div className="grid min-h-0 grid-cols-1 gap-4 lg:grid-cols-[1fr_1.05fr_300px]">
        <section className="panel flex min-h-0 flex-col p-5">
          <div className="label mb-3">Problem</div>
          <p className="mb-5 text-[14px] leading-relaxed text-[var(--text-dim)]">
            {assignment.prompt}
          </p>
          <div className="label mb-2">
            Your code · the tutor reads this, it doesn&apos;t run it
          </div>
          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            spellCheck={false}
            placeholder={`# write ${assignment.language} here`}
            className="field mono min-h-0 flex-1 resize-none text-[13px] leading-relaxed"
          />
        </section>

        <section className="panel flex min-h-0 flex-col">
          <div className="label border-b border-[var(--line-soft)] px-5 py-3">
            Tutor
          </div>
          <div ref={scroller} className="flex-1 space-y-4 overflow-y-auto px-5 py-4">
            {messages.map((m, i) => (
              <div
                key={i}
                className={`rise max-w-[88%] ${m.role === "student" ? "ml-auto" : ""}`}
              >
                <div
                  className="label mb-1"
                  style={{ color: m.role === "tutor" ? "var(--accent)" : "var(--text-faint)" }}
                >
                  {m.role === "tutor" ? "Tutor" : "You"}
                </div>
                <div
                  className="rounded-[9px] px-3.5 py-2.5 text-[14px] leading-relaxed"
                  style={{
                    background: m.role === "student" ? "var(--panel-2)" : "transparent",
                    border:
                      m.role === "student"
                        ? "1px solid var(--line)"
                        : "1px solid var(--line-soft)",
                  }}
                >
                  {m.content}
                </div>
              </div>
            ))}
            {busy && (
              <div className="thinking label" style={{ color: "var(--accent)" }}>
                Tutor is thinking
              </div>
            )}
          </div>
          <div className="border-t border-[var(--line-soft)] p-3">
            <div className="flex gap-2">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) send();
                }}
                placeholder="Ask, or describe what you tried…  (⌘/Ctrl+Enter)"
                className="field min-h-[52px] resize-none text-[14px]"
              />
              <button className="btn" onClick={send} disabled={busy || !input.trim()}>
                Send
              </button>
            </div>
          </div>
        </section>

        <section className="panel flex min-h-0 flex-col p-5">
          <div className="label mb-4">Where you stand</div>

          <div className="label mb-2" style={{ color: "var(--text-faint)" }}>
            Target concepts
          </div>
          <div className="mb-6 space-y-2">
            {conceptState.map(({ c, status }) => (
              <div key={c} className="flex items-center justify-between gap-3">
                <span className="text-[13px] text-[var(--text-dim)]">{c}</span>
                <span
                  className="label"
                  style={{
                    color:
                      status === "progressing"
                        ? "var(--good)"
                        : status === "shaky"
                          ? "var(--warn)"
                          : "var(--text-faint)",
                  }}
                >
                  {status}
                </span>
              </div>
            ))}
          </div>

          <div className="label mb-2" style={{ color: "var(--text-faint)" }}>
            Struggle timeline
          </div>
          <div className="flex-1 space-y-2 overflow-y-auto">
            {turns.length === 0 && (
              <p className="text-[13px] leading-relaxed text-[var(--text-faint)]">
                Fills in as you work. This is the read your teacher gets.
              </p>
            )}
            {turns.map((t, i) => (
              <div key={i} className="flex items-center gap-2.5">
                <span
                  className="h-2 w-2 shrink-0 rounded-full"
                  style={{ background: STRUGGLE[t.kind].tone }}
                />
                <span className="text-[13px] text-[var(--text-dim)]">
                  {STRUGGLE[t.kind].label}
                </span>
              </div>
            ))}
          </div>

          {withheldCount > 0 && (
            <div
              className="mt-4 rounded-[8px] px-3 py-2 text-[12px] leading-relaxed"
              style={{ border: "1px solid var(--line)", color: "var(--text-faint)" }}
            >
              Solution withheld {withheldCount}×. The tutor redirected instead of
              handing it over.
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

export default function TutorPage() {
  return (
    <Suspense fallback={<div className="p-10 text-[var(--text-faint)]">Loading…</div>}>
      <TutorView />
    </Suspense>
  );
}
