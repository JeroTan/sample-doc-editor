import { describe, expect, test } from "vitest";

import { hashPassword, PASSWORD_HASH_ITERATIONS } from "../lib/auth-rules";

describe("auth password hashing", () => {
  test("uses a Cloudflare Worker supported PBKDF2 iteration count", async () => {
    await expect(hashPassword("admin-ako-123", "doc-me-in-admin-seed-v1")).resolves.toBe(
      "jjRNJba7u1HTC5hWc0UFVCeCFzMIfv+Wy7ENKjWi04Q=",
    );
    expect(PASSWORD_HASH_ITERATIONS).toBeLessThanOrEqual(100_000);
  });
});
