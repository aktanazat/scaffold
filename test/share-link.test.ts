import { afterEach, test } from "node:test";
import assert from "node:assert/strict";
import { POST } from "../app/api/share/route";
import { openReference } from "../lib/seal";

const REFERENCE = `def two_sum(nums, target):
    seen = {}
    for i, n in enumerate(nums):
        if target - n in seen:
            return [seen[target - n], i]
        seen[n] = i`;

const ASSIGNMENT = {
  title: "Two Sum",
  language: "python",
  prompt: "Return the indices of the two numbers that add up to the target.",
  reference: REFERENCE,
  concepts: ["hash maps"],
};

async function shareToken(): Promise<string> {
  const res = await POST(
    new Request("http://localhost/api/share", { method: "POST", body: JSON.stringify(ASSIGNMENT) }),
  );
  const { token } = (await res.json()) as { token: string };
  return token;
}

// Everything a student can read out of the token: the decoded JSON, and every string field in it
// decoded again as base64, in case a field only wraps the reference in a second layer.
function whatAStudentCanRead(token: string): string {
  const json = Buffer.from(token, "base64url").toString("utf8");
  const fields = Object.values(JSON.parse(json) as Record<string, unknown>).filter(
    (v): v is string => typeof v === "string",
  );
  return [json, ...fields.map((f) => Buffer.from(f, "base64url").toString("utf8"))].join("\n");
}

const savedKey = process.env.SCAFFOLD_SEAL_KEY;
afterEach(() => {
  if (savedKey === undefined) delete process.env.SCAFFOLD_SEAL_KEY;
  else process.env.SCAFFOLD_SEAL_KEY = savedKey;
});

test("share link sealed with a server key hides the reference and the server can still open it", async () => {
  process.env.SCAFFOLD_SEAL_KEY = "test-seal-key";
  const token = await shareToken();

  assert.doesNotMatch(whatAStudentCanRead(token), /seen\[n\] = i/);

  const { sealedReference } = JSON.parse(Buffer.from(token, "base64url").toString("utf8")) as {
    sealedReference: string;
  };
  assert.equal(openReference(sealedReference, "test-seal-key"), REFERENCE);
  assert.equal(openReference(sealedReference, "a-student-guess"), null);
});

test("share link built with no server key leaves the reference out", async () => {
  delete process.env.SCAFFOLD_SEAL_KEY;
  const token = await shareToken();

  assert.doesNotMatch(whatAStudentCanRead(token), /seen\[n\] = i/);
});
