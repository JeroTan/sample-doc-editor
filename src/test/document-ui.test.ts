import { describe, expect, test } from "vitest";

import { ApiClientError, readApiPayload } from "../features/documents/api-client";
import { canEditDocument, canShareDocument, SEEDED_USERS, splitDocumentSections } from "../features/documents/ui-state";

describe("document UI state", () => {
  test("seeded user selector exposes reviewer-ready accounts in stable order", () => {
    expect(SEEDED_USERS.map((user) => [user.displayName, user.email, user.initials])).toEqual([
      ["Alice Rivera", "alice@example.com", "AR"],
      ["Bob Chen", "bob@example.com", "BC"],
      ["Reviewer", "reviewer@example.com", "RV"],
    ]);
  });

  test("document list groups owned and shared documents without losing order", () => {
    const sections = splitDocumentSections([
      { id: "owned-1", title: "Alpha", accessRole: "owner", ownerName: "Alice", updatedAt: "2026-01-03T00:00:00.000Z" },
      { id: "shared-1", title: "Shared", accessRole: "editor", ownerName: "Bob", updatedAt: "2026-01-02T00:00:00.000Z" },
      { id: "owned-2", title: "", accessRole: "owner", ownerName: "Alice", updatedAt: "2026-01-01T00:00:00.000Z" },
    ]);

    expect({
      owned: sections.owned.map((document) => document.title),
      shared: sections.shared.map((document) => document.title),
    }).toEqual({
      owned: ["Alpha", "Untitled document"],
      shared: ["Shared"],
    });
  });

  test("role affordances match editor permissions", () => {
    expect(canEditDocument({ accessRole: "owner" })).toBe(true);
    expect(canEditDocument({ accessRole: "editor" })).toBe(true);
    expect(canEditDocument({ accessRole: "viewer" })).toBe(false);
    expect(canShareDocument({ accessRole: "owner" })).toBe(true);
    expect(canShareDocument({ accessRole: "editor" })).toBe(false);
  });
});

describe("document API client", () => {
  test("reads data envelopes and exposes API errors", async () => {
    await expect(readApiPayload(new Response(JSON.stringify({ data: { id: "doc_1" } })))).resolves.toEqual({
      id: "doc_1",
    });

    await expect(
      readApiPayload(
        new Response(JSON.stringify({ error: { code: "title_too_long", message: "Title must be 120 characters or fewer." } }), {
          status: 400,
        }),
      ),
    ).rejects.toEqual(new ApiClientError(400, "title_too_long", "Title must be 120 characters or fewer."));
  });
});
