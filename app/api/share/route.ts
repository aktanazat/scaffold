import type { Assignment, ShareResponse } from "@/lib/types";
import { encodeShareToken, toStudentAssignment } from "@/lib/share";
import { sealReference } from "@/lib/seal";

// Builds the student link token. The link carries what the student sees plus the reference sealed
// with SCAFFOLD_SEAL_KEY. With no key set, the reference is left out of the link entirely.
export async function POST(req: Request): Promise<Response> {
  let a: Assignment;
  try {
    a = (await req.json()) as Assignment;
  } catch {
    return Response.json({ error: "expected a JSON assignment" }, { status: 400 });
  }
  if (!a.title || !a.prompt || !a.language) {
    return Response.json({ error: "title, prompt and language are required" }, { status: 400 });
  }

  const secret = process.env.SCAFFOLD_SEAL_KEY;
  const sealedReference = secret && a.reference ? sealReference(a.reference, secret) : undefined;
  const token = encodeShareToken({ ...toStudentAssignment(a), sealedReference });
  return Response.json({ token, referenceSealed: Boolean(sealedReference) } satisfies ShareResponse);
}
