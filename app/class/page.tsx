"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import type { StruggleKind } from "@/lib/types";
import { decodeAssignment } from "@/lib/share";
import { DEMO_STUDENT } from "@/lib/demoStudent";
import { seededCohort } from "@/lib/cohort";
import { sessionsFor, type StoredSession } from "@/lib/sessionStore";
import { Nav } from "@/components/Nav";

export const dynamic = "force-dynamic";

const LABEL: Record<StruggleKind, string> = {
  asked_for_answer: "Asked for the answer",
  concept_gap: "Concept gap",
  logic: "Logic",
  syntax: "Syntax",
  stuck_no_attempt: "Not attempting",
  progressing: "Progressing",
};

function dominant(s: StoredSession): StruggleKind {
  const weight: Record<StruggleKind, number> = {
    asked_for_answer: 5, concept_gap: 4, logic: 3, syntax: 2,
    stuck_no_attempt: 2, progressing: 0,
  };
  return [...s.turns].sort((a, b) => weight[b.kind] - weight[a.kind])[0]?.kind ?? "progressing";
}

function ClassView() {
  const sp = useSearchParams();
  const token = sp.get("a");

  const { title, concepts } = useMemo(() => {
    if (token) {
      const a = decodeAssignment(token);
      if (a) return { title: a.title, concepts: a.concepts };
    }
    return { title: DEMO_STUDENT.title, concepts: DEMO_STUDENT.concepts };
  }, [token]);

  const [live, setLive] = useState<StoredSession[]>([]);
  useEffect(() => {
    setLive(sessionsFor(title));
  }, [title]);

  const cohort = useMemo(() => {
    const seed = seededCohort(title);
    const seen = new Set(seed.map((s) => s.id));
    return [...seed, ...live.filter((s) => !seen.has(s.id) && s.turns.length)];
  }, [title, live]);

  const conceptRows = concepts.map((c) => {
    let steady = 0, shaky = 0, untouched = 0;
    for (const s of cohort) {
      const last = [...s.turns].reverse().find((t) => t.concept === c);
      if (!last) untouched++;
      else if (last.kind === "progressing") steady++;
      else shaky++;
    }
    return { c, steady, shaky, untouched, total: cohort.length || 1 };
  });

  const askedForAnswer = cohort.filter((s) => s.turns.some((t) => t.withheld)).length;
  const weakest = [...conceptRows].sort((a, b) => b.shaky - a.shaky)[0];

  return (
    <div className="min-h-screen">
      <Nav active="class" />
      <main className="mx-auto w-full max-w-[920px] px-6 pt-32 pb-24">
        <p className="micro mb-6">Teacher dashboard · {title}</p>
        <h1 className="serif text-[clamp(2rem,4.6vw,3.1rem)] leading-[1.08] max-w-[20ch]">
          {weakest && weakest.shaky > 0 ? (
            <>The class is shakiest on {weakest.c}.</>
          ) : (
            <>The class is moving through {title}.</>
          )}
        </h1>
        <p className="mt-7 max-w-[56ch] text-[15px] leading-[1.7] text-[var(--muted)]">
          {cohort.length} student{cohort.length === 1 ? "" : "s"} so far.{" "}
          {askedForAnswer > 0
            ? `${askedForAnswer} tried to get the answer outright; the tutor declined every time.`
            : "No one has tried to extract the answer."}{" "}
          This is the read teaching is usually blind to.
        </p>

        <hr className="rule mt-14" />

        <section className="grid gap-x-16 gap-y-8 py-14 md:grid-cols-[180px_1fr]">
          <h2 className="serif text-[24px] leading-tight">Concept mastery</h2>
          <div className="space-y-7">
            {conceptRows.map(({ c, steady, shaky, untouched, total }) => (
              <div key={c}>
                <div className="mb-2.5 flex items-baseline justify-between">
                  <span className="text-[14px] text-[var(--ink)]">{c}</span>
                  <span className="mono text-[12px] text-[var(--faint)]">
                    {steady}/{total} steady
                  </span>
                </div>
                <div className="flex h-[5px] overflow-hidden rounded-full bg-[var(--hairline-soft)]">
                  <span style={{ width: `${(steady / total) * 100}%`, background: "var(--sage)" }} />
                  <span style={{ width: `${(shaky / total) * 100}%`, background: "var(--clay)" }} />
                  <span style={{ width: `${(untouched / total) * 100}%`, background: "transparent" }} />
                </div>
              </div>
            ))}
          </div>
        </section>

        <hr className="rule" />

        <section className="grid gap-x-16 gap-y-8 py-14 md:grid-cols-[180px_1fr]">
          <h2 className="serif text-[24px] leading-tight">Roster</h2>
          <div>
            <div className="micro grid grid-cols-[1fr_auto_auto] gap-6 pb-3 text-[var(--faint)]">
              <span>Student</span>
              <span className="w-32 text-right">Where stuck</span>
              <span className="w-20 text-right">Withheld</span>
            </div>
            <div className="divide-y divide-[var(--hairline)]">
              {cohort.map((s) => {
                const d = dominant(s);
                const w = s.turns.filter((t) => t.withheld).length;
                return (
                  <div
                    key={s.id}
                    className="grid grid-cols-[1fr_auto_auto] items-center gap-6 py-3.5"
                  >
                    <span className="text-[14px] text-[var(--ink)]">{s.student}</span>
                    <span
                      className="w-32 text-right text-[13px]"
                      style={{
                        color:
                          d === "progressing"
                            ? "var(--sage)"
                            : d === "logic" || d === "syntax" || d === "stuck_no_attempt"
                              ? "var(--clay)"
                              : "var(--rust)",
                      }}
                    >
                      {LABEL[d]}
                    </span>
                    <span className="mono w-20 text-right text-[13px] text-[var(--muted)]">
                      {w > 0 ? `${w}×` : "—"}
                    </span>
                  </div>
                );
              })}
            </div>
            {cohort.length === 0 && (
              <p className="py-6 text-[13.5px] text-[var(--faint)]">
                No sessions yet for this assignment. Run the demo, then return
                here.
              </p>
            )}
          </div>
        </section>

        <footer className="flex items-center justify-between pt-10 text-[12px] text-[var(--faint)]">
          <span>Scaffold</span>
          <span>
            {token ? "Live sessions only for custom assignments" : "FizzBuzz includes a seeded class plus your live runs"}
          </span>
        </footer>
      </main>
    </div>
  );
}

export default function ClassPage() {
  return (
    <Suspense fallback={<div className="p-16 text-[var(--faint)]">Loading…</div>}>
      <ClassView />
    </Suspense>
  );
}
