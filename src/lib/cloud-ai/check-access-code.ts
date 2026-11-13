import "server-only";

import { timingSafeEqual } from "node:crypto";

// Internal-alpha protection for the online AI service: requests must carry the secret access code
// set in Vercel as RACIK_ALPHA_ACCESS_CODE. Replaced by real sign-in in the beta.

export const ACCESS_CODE_HEADER = "x-racik-access-code";

export function hasValidAccessCode(request: Request): boolean {
  const expected = process.env.RACIK_ALPHA_ACCESS_CODE;
  const given = request.headers.get(ACCESS_CODE_HEADER);
  if (!expected || !given) return false;
  const expectedBytes = Buffer.from(expected);
  const givenBytes = Buffer.from(given);
  // Constant-time comparison so the code can't be guessed by measuring response times.
  return expectedBytes.length === givenBytes.length && timingSafeEqual(expectedBytes, givenBytes);
}
