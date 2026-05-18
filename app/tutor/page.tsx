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
import { DEMO_SCRIPT } from "@/lib/demoScript";
import { newSessionId, recordTurn } from "@/lib/sessionStore";
import { codeKeystrokes, messageKeystrokes, thinkPause } from "@/lib/humanType";
import { Nav } from "@/components/Nav";
import { CodeEditor } from "@/components/CodeEditor";

export const dynamic = "force-dynamic";

const TONE: Record<StruggleKind, { label: string; color: string }> = {
  asked_for_answer: { label: "Asked for the answer", color: "var(--rust)" },
  concept_gap: { label: "Concept gap", color: "var(--rust)" },
  logic: { label: "Logic", color: "var(--clay)" },
  syntax: { label: "Syntax", color: "var(--clay)" },
  stuck_no_attempt: { label: "Not attempting", color: "var(--clay)" },
  progressing: { label: "Progressing", color: "var(--sage)" },
};

interface Turn {
  kind: StruggleKind;
  concept: string | null;
  withheld: boolean;
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
function commonPrefix(a: string, b: string) {
  let i = 0;
  while (i < a.length && i < b.length && a[i] === b[i]) i++;
  return i;
}

function TutorView() {
  const sp = useSearchParams();
  const isDemo = sp.get("demo") === "1";

  const assignment: StudentAssignment | null = useMemo(() => {
    if (isDemo) return DEMO_STUDENT;
    const token = sp.get("a");
    if (!token) return null;
    const full = decodeAssignment(token);
    return full ? toStudentAssignment(full) : null;
  }, [isDemo, sp]);

  const session = useMemo(
    () => ({ id: newSessionId(), student: "You", title: assignment?.title ?? "" }),
    [assignment],
  );

  const [code, setCode] = useState("");
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [turns, setTurns] = useState<Turn[]>([]);
  const [busy, setBusy] = useState(false);
  const [mode, setMode] = useState<"live" | "demo" | null>(null);
  const [playing, setPlaying] = useState(false);
  const [caption, setCaption] = useState<string | null>(null);
  const playRef = useRef(false);
  const scroller = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!assignment) return;
    setMessages([
      {
        role: "tutor",
        content: `I'm your tutor for "${assignment.title}". Tell me your plan, or paste what you have. I won't write it for you, but I'll get you unstuck.`,
      },
    ]);
  }, [assignment]);

  useEffect(() => {
    scroller.current?.scrollTo({ top: scroller.current.scrollHeight, behavior: "smooth" });
  }, [messages, busy]);

  async function send(forced?: string): Promise<Turn | null> {
    const text = (forced ?? input).trim();
    if (!text || busy) return null;
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
      const t: Turn = { kind: data.struggle, concept: data.concept, withheld: data.withheldSolution };
      setTurns((x) => [...x, t]);
      recordTurn(session, t);
      return t;
    } catch {
      setMessages((m) => [...m, { role: "tutor", content: "I lost that one. Say it again?" }]);
      return null;
    } finally {
      setBusy(false);
    }
  }

  async function play() {
    if (playRef.current || !DEMO_SCRIPT.length) return;
    playRef.current = true;
    setPlaying(true);
    setMessages([]);
    setTurns([]);
    setCode("");
    setInput("");
    let buffer = "";
    const alive = () => playRef.current;
    await sleep(500);
    for (const step of DEMO_SCRIPT) {
      if (!alive()) break;
      setCaption(step.caption);

      const p = commonPrefix(buffer, step.code);
      if (step.code.length > p) {
        await sleep(thinkPause("before-code"));
        const delays = codeKeystrokes(step.code);
        for (let i = p; i < step.code.length; i++) {
          if (!alive()) break;
          setCode(step.code.slice(0, i + 1));
          await sleep(delays[i] ?? 38);
        }
      }
      buffer = step.code;
      if (!alive()) break;

      await sleep(thinkPause("before-message"));
      const md = messageKeystrokes(step.say);
      for (let i = 0; i < step.say.length; i++) {
        if (!alive()) break;
        setInput(step.say.slice(0, i + 1));
        await sleep(md[i] ?? 55);
      }
      if (!alive()) break;
      await sleep(260);
      await send(step.say);
      await sleep(thinkPause("review"));
    }
    setCaption(null);
    setPlaying(false);
    playRef.current = false;
  }

  function stop() {
    playRef.current = false;
    setPlaying(false);
    setCaption(null);
  }

  useEffect(() => {
    if (isDemo && sp.get("auto") === "1") {
      const id = setTimeout(() => void play(), 600);
      return () => clearTimeout(id);
    }
  }, [isDemo, sp]);

  if (!assignment) {
    return (
      <div className="min-h-screen">
        <Nav active="demo" />
        <main className="mx-auto max-w-[480px] px-6 pt-48 text-center">
          <h1 className="serif text-[30px]">No assignment in this link.</h1>
          <p className="mt-4 text-[14px] text-[var(--muted)]">
            Ask your teacher for the link, or open the demo.
          </p>
          <Link href="/tutor?demo=1" className="btn mt-8 inline-block">
            Open the FizzBuzz demo
          </Link>
        </main>
      </div>
    );
  }

  const locked = playing;
  const withheld = turns.filter((t) => t.withheld).length;
  const conceptState = assignment.concepts.map((c) => {
    const last = [...turns].reverse().find((t) => t.concept === c);
    const status = !last ? "untouched" : last.kind === "progressing" ? "steady" : "shaky";
    return { c, status };
  });

  return (
    <div className="h-screen">
      <Nav active="demo" />
      <main className="page mx-auto grid h-screen max-w-[1240px] grid-rows-[88px_1fr] px-6">
        <div className="flex items-end justify-between pb-4">
          <div>
            <p className="micro">Assignment</p>
            <h1 className="serif mt-1 text-[22px] leading-none">{assignment.title}</h1>
          </div>
          <div className="flex items-center gap-5 text-[var(--faint)]">
            {mode && <span className="micro">{mode === "live" ? "Live model" : "Demo engine"}</span>}
            <span className="micro">{assignment.language}</span>
            {isDemo && DEMO_SCRIPT.length > 0 && (
              <button
                className={playing ? "btn-quiet" : "btn"}
                onClick={playing ? stop : () => void play()}
              >
                {playing ? "Stop" : "Watch it solve FizzBuzz"}
              </button>
            )}
          </div>
        </div>

        <div className="grid min-h-0 grid-cols-1 gap-0 border-t border-[var(--hairline)] lg:grid-cols-[1fr_1.05fr_280px]">
          <section className="flex min-h-0 flex-col py-6 lg:pr-8">
            <p className="micro mb-3">Problem</p>
            <p className="mb-7 text-[14px] leading-[1.7] text-[var(--muted)]">
              {assignment.prompt}
            </p>
            <p className="micro mb-3">
              Your code{" "}
              <span className="normal-case tracking-normal text-[var(--faint)]">
                — the tutor reads it, it doesn&apos;t run it
              </span>
            </p>
            <CodeEditor
              value={code}
              onChange={setCode}
              language={assignment.language}
              readOnly={locked}
              placeholder={`# ${assignment.language}`}
            />
          </section>

          <section className="flex min-h-0 flex-col border-[var(--hairline)] py-6 lg:border-x lg:px-8">
            <div className="mb-4 flex items-baseline justify-between">
              <p className="micro">Tutor</p>
              {caption && (
                <p className="micro text-[var(--clay)]">{caption}</p>
              )}
            </div>
            <div ref={scroller} className="flex-1 space-y-6 overflow-y-auto pr-1">
              {messages.map((m, i) => (
                <div key={i} className={`fade-up ${m.role === "student" ? "flex justify-end" : ""}`}>
                  {m.role === "tutor" ? (
                    <p className="max-w-[92%] text-[14.5px] leading-[1.75] text-[var(--ink)]">
                      {m.content}
                    </p>
                  ) : (
                    <p className="max-w-[80%] rounded-2xl border border-[var(--hairline)] bg-[var(--raised)] px-4 py-2.5 text-[14px] leading-[1.6] text-[var(--muted)]">
                      {m.content}
                    </p>
                  )}
                </div>
              ))}
              {busy && <p className="breathe text-[14px] text-[var(--faint)]">thinking</p>}
            </div>
            <div className="mt-5 flex items-end gap-3 border-t border-[var(--hairline)] pt-4">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={locked}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) void send();
                }}
                placeholder={locked ? "Walkthrough playing…" : "Describe what you tried…  ⌘↵"}
                className="field min-h-[44px] resize-none disabled:opacity-50"
              />
              <button className="btn" onClick={() => void send()} disabled={busy || locked || !input.trim()}>
                Send
              </button>
            </div>
          </section>

          <section className="flex min-h-0 flex-col py-6 lg:pl-8">
            <p className="micro mb-5">Where you stand</p>

            <p className="micro mb-3 text-[var(--faint)]">Concepts</p>
            <div className="mb-9 space-y-3">
              {conceptState.map(({ c, status }) => (
                <div key={c} className="flex items-baseline justify-between gap-3">
                  <span className="text-[13.5px] text-[var(--muted)]">{c}</span>
                  <span
                    className="text-[11px]"
                    style={{
                      color:
                        status === "steady"
                          ? "var(--sage)"
                          : status === "shaky"
                            ? "var(--clay)"
                            : "var(--faint)",
                    }}
                  >
                    {status}
                  </span>
                </div>
              ))}
            </div>

            <p className="micro mb-3 text-[var(--faint)]">Struggle timeline</p>
            <div className="flex-1 space-y-2.5 overflow-y-auto">
              {turns.length === 0 && (
                <p className="text-[13px] leading-relaxed text-[var(--faint)]">
                  Fills in as you work. This is the read your teacher gets.
                </p>
              )}
              {turns.map((t, i) => (
                <div
                  key={i}
                  className="fade-up border-l-2 pl-3 text-[13px] text-[var(--muted)]"
                  style={{ borderColor: TONE[t.kind].color }}
                >
                  {TONE[t.kind].label}
                </div>
              ))}
            </div>

            {withheld > 0 && (
              <p className="mt-5 border-t border-[var(--hairline)] pt-4 text-[12px] leading-relaxed text-[var(--faint)]">
                Solution withheld {withheld}×. The tutor redirected instead of
                handing it over.
              </p>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}

export default function TutorPage() {
  return (
    <Suspense fallback={<div className="p-16 text-[var(--faint)]">Loading…</div>}>
      <TutorView />
    </Suspense>
  );
}
