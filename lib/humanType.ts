// Deterministic human-like typing timings for walkthrough playback.
export interface Keystroke {
  ms: number;
}

type PauseKind = "before-code" | "before-message" | "review";

function hashSeed(text: string): number {
  let hash = 2166136261;

  for (let index = 0; index < text.length; index += 1) {
    hash ^= text.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }

  return hash >>> 0;
}

function mulberry32(seed: number): () => number {
  let value = seed;

  return () => {
    value += 0x6d2b79f5;
    let result = value;
    result = Math.imul(result ^ (result >>> 15), result | 1);
    result ^= result + Math.imul(result ^ (result >>> 7), result | 61);
    return ((result ^ (result >>> 14)) >>> 0) / 4294967296;
  };
}

function between(rand: () => number, min: number, max: number): number {
  return Math.round(min + rand() * (max - min));
}

function jitter(rand: () => number, base: number, spread: number): number {
  return Math.round(base + (rand() * 2 - 1) * spread);
}

function isCodeOperator(char: string): boolean {
  return char === "=" || char === "%" || char === "+" || char === "<" || char === ">";
}

function isDigit(char: string): boolean {
  return char >= "0" && char <= "9";
}

function nextHesitationAt(rand: () => number, index: number): number {
  return index + between(rand, 14, 26);
}

export function codeKeystrokes(text: string): number[] {
  const rand = mulberry32(hashSeed(`code:${text}`));
  const delays: number[] = [];
  let leading = true;
  let hesitateAt = nextHesitationAt(rand, 0);

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    const previous = index > 0 ? text[index - 1] : "";
    let delay = jitter(rand, 38, 18);

    if (leading && char === " " && previous !== "\n") {
      delay = between(rand, 12, 20);
    } else if (previous === "\n") {
      delay = between(rand, 180, 320);
    } else if (previous === ":") {
      delay = between(rand, 140, 240);
    } else if (previous === ")" || previous === "]") {
      delay = between(rand, 90, 160);
    } else if (previous === "(" || previous === "[") {
      delay = Math.max(12, jitter(rand, 30, 10));
    }

    if (isDigit(char) || isCodeOperator(char)) {
      delay += 25;
    }

    if (index >= hesitateAt) {
      if (rand() < 0.25) {
        delay += between(rand, 350, 650);
      }
      hesitateAt = nextHesitationAt(rand, index);
    }

    delays.push(delay);

    if (char === "\n") {
      leading = true;
    } else if (char !== " ") {
      leading = false;
    }
  }

  return delays;
}

export function messageKeystrokes(text: string): number[] {
  const rand = mulberry32(hashSeed(`message:${text}`));
  const delays: number[] = [];
  let atWordStart = true;

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    const previous = index > 0 ? text[index - 1] : "";
    let delay = jitter(rand, 55, 25);

    if (previous === " " && rand() < 0.2) {
      delay += 120;
    }

    if (previous === "," || previous === "." || previous === "?") {
      delay += between(rand, 200, 380);
    }

    if (atWordStart && char !== " " && rand() < 1 / 6) {
      delay += between(rand, 300, 500);
    }

    delays.push(delay);
    atWordStart = char === " ";
  }

  return delays;
}

export function thinkPause(kind: PauseKind): number {
  const rand = mulberry32(hashSeed(`pause:${kind}`));

  if (kind === "before-code") {
    return between(rand, 600, 1100);
  }

  if (kind === "before-message") {
    return between(rand, 500, 900);
  }

  return between(rand, 900, 1600);
}
