"use client";

import { useLayoutEffect, useRef } from "react";
import Prism from "prismjs";
import "prismjs/components/prism-clike";
import "prismjs/components/prism-python";
import "prismjs/components/prism-javascript";
import "prismjs/components/prism-java";
import "prismjs/components/prism-c";
import "prismjs/components/prism-cpp";
import type { Language } from "@/lib/types";

const GRAMMAR: Record<Language, { g: Prism.Grammar; id: string }> = {
  python: { g: Prism.languages.python, id: "python" },
  javascript: { g: Prism.languages.javascript, id: "javascript" },
  java: { g: Prism.languages.java, id: "java" },
  cpp: { g: Prism.languages.cpp, id: "cpp" },
};

const BOX: React.CSSProperties = {
  margin: 0,
  border: 0,
  padding: 15,
  fontFamily: "var(--mono)",
  fontSize: 13,
  lineHeight: 1.7,
  tabSize: 4,
  whiteSpace: "pre",
  wordBreak: "normal",
  overflowWrap: "normal",
  fontVariantLigatures: "none",
  fontFeatureSettings: "normal",
};

export function CodeEditor({
  value,
  onChange,
  language,
  readOnly,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  language: Language;
  readOnly?: boolean;
  placeholder?: string;
}) {
  const { g, id } = GRAMMAR[language];
  const pre = useRef<HTMLPreElement>(null);
  const ta = useRef<HTMLTextAreaElement>(null);

  const html =
    Prism.highlight(value, g, id) + (value.endsWith("\n") || value === "" ? "\n" : "");

  useLayoutEffect(() => {
    const t = ta.current, p = pre.current;
    if (!t || !p) return;
    const sync = () => {
      p.scrollTop = t.scrollTop;
      p.scrollLeft = t.scrollLeft;
    };
    t.addEventListener("scroll", sync);
    return () => t.removeEventListener("scroll", sync);
  }, []);

  return (
    <div className="code-surface min-h-0 flex-1">
      <pre
        ref={pre}
        aria-hidden
        className="absolute inset-0 overflow-auto"
        style={{ ...BOX, color: "var(--ink)", pointerEvents: "none" }}
      >
        <code dangerouslySetInnerHTML={{ __html: html }} />
      </pre>
      <textarea
        ref={ta}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        readOnly={readOnly}
        spellCheck={false}
        autoCapitalize="off"
        autoCorrect="off"
        placeholder={placeholder}
        className="code-ta absolute inset-0 resize-none overflow-auto bg-transparent"
        style={{ ...BOX, color: "transparent", caretColor: "var(--ink)" }}
      />
    </div>
  );
}
