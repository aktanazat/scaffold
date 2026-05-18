import Link from "next/link";

const ITEMS = [
  { href: "/", label: "Compose", key: "compose" },
  { href: "/tutor?demo=1", label: "Demo", key: "demo" },
  { href: "/class", label: "Dashboard", key: "class" },
] as const;

export function Nav({ active }: { active: "compose" | "demo" | "class" }) {
  return (
    <header className="fixed inset-x-0 top-5 z-50 flex justify-center px-6">
      <nav className="pill">
        <Link href="/" className="serif text-[15px] tracking-tight text-[var(--ink)]">
          Scaffold
        </Link>
        <span className="h-3.5 w-px bg-[var(--hairline)]" />
        <div className="flex items-center gap-1">
          {ITEMS.map((it) => (
            <Link
              key={it.key}
              href={it.href}
              className="rounded-full px-3 py-1 text-[13px] transition-colors"
              style={
                active === it.key
                  ? { background: "var(--ink)", color: "var(--paper)" }
                  : { color: "var(--muted)" }
              }
            >
              {it.label}
            </Link>
          ))}
        </div>
      </nav>
    </header>
  );
}
