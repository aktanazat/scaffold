import type { Metadata } from "next";
import { Geist, Geist_Mono, Newsreader } from "next/font/google";
import "./globals.css";

const sans = Geist({ variable: "--font-sans", subsets: ["latin"] });
const mono = Geist_Mono({ variable: "--font-mono", subsets: ["latin"] });
const display = Newsreader({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  style: ["normal"],
});

const url = "https://scaffold-mocha.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(url),
  title: "Scaffold — the AI tutor that won't do the homework",
  description:
    "A CS teacher deploys an AI coding tutor for any assignment in 60 seconds. It gives Socratic hints, refuses to write the solution, and shows where students got stuck.",
  alternates: { canonical: "/" },
  openGraph: {
    title: "Scaffold — the AI tutor that won't do the homework",
    description:
      "Paste an assignment and its solution; get a link. Students get hints that never spell out the code. Teachers see where each one got stuck.",
    url,
    type: "website",
  },
  twitter: { card: "summary_large_image" },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${sans.variable} ${mono.variable} ${display.variable} h-full`}
    >
      <body className="min-h-full">{children}</body>
    </html>
  );
}
