import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, test } from "vitest";

import type { DocumentDetail } from "../api/types";
import { DocumentPreview } from "../features/documents/components/DocumentPreview";
import { markdownToHtml } from "../lib/markdown-to-html";

describe("markdown rendering", () => {
  test("renders markdown blocks as html instead of escaped pre text", () => {
    expect(markdownToHtml("# Title\n\n**Fast** notes\n\n- One\n- Two")).toContain(
      "<h1>Title</h1><p><strong>Fast</strong> notes</p><ul><li>One</li><li>Two</li></ul>",
    );
  });

  test("escapes unsafe raw html and link schemes", () => {
    expect(markdownToHtml("<script>alert(1)</script>\n\n[bad](javascript:alert(1))")).toContain(
      "&lt;script&gt;alert(1)&lt;/script&gt;",
    );
    expect(markdownToHtml("[bad](javascript:alert(1))")).toContain('href="#"');
  });

  test("document preview renders Toast UI viewer, not the editor shell", () => {
    const document = {
      id: "doc_1",
      title: "Rendered",
      ownerId: "usr_1",
      ownerName: "Owner",
      ownerEmail: "owner@example.com",
      accessRole: "owner",
      contentHtml: "",
      contentMarkdown: "# Customer View\n\n- Clean\n- Readable",
      contentText: "Customer View Clean Readable",
      createdAt: "2026-07-02T00:00:00.000Z",
      updatedAt: "2026-07-02T00:00:00.000Z",
      lastOpenedAt: null,
    } satisfies DocumentDetail;

    const html = renderToStaticMarkup(<DocumentPreview document={document} />);

    expect(html).toContain("<article");
    expect(html).toContain("doc-me-in-viewer");
    expect(html).not.toContain("doc-me-in-editor");
    expect(html).not.toContain("toastui-editor");
  });
});
