import Anthropic from "@anthropic-ai/sdk";
import type { Assignment, TutorRequest, TutorResponse } from "@/lib/types";
import { DEMO_ASSIGNMENT } from "@/lib/demoAssignment";
import { demoTutorTurn } from "@/lib/demoEngine";
import { buildSystemPrompt, buildUserPrompt, parseTutorTurn } from "@/lib/socratic";

function resolveAssignment(req: TutorRequest): Assignment {
  if (req.assignment.title === DEMO_ASSIGNMENT.title) return DEMO_ASSIGNMENT;
  return { ...req.assignment, reference: "" };
}

export async function POST(req: Request): Promise<Response> {
  const hasKey = Boolean(process.env.ANTHROPIC_API_KEY);
  const mode: "live" | "demo" = hasKey ? "live" : "demo";

  try {
    const body = (await req.json()) as TutorRequest;

    if (!hasKey) {
      const turn = demoTutorTurn(body);
      return Response.json({ ...turn, mode } satisfies TutorResponse);
    }

    const client = new Anthropic();
    const assignment = resolveAssignment(body);
    const completion = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 600,
      temperature: 0.4,
      system: buildSystemPrompt(assignment),
      messages: [{ role: "user", content: buildUserPrompt(body.code, body.messages) }],
    });

    const raw = completion.content
      .filter((block): block is Anthropic.TextBlock => block.type === "text")
      .map((block) => block.text)
      .join("");
    const turn = parseTutorTurn(raw);
    return Response.json({ ...turn, mode } satisfies TutorResponse);
  } catch {
    return Response.json({
      reply:
        "I lost the thread there for a second. Can you rephrase what you're stuck on, and share what you've tried so far?",
      struggle: "progressing",
      concept: null,
      withheldSolution: false,
      mode,
    } satisfies TutorResponse);
  }
}
