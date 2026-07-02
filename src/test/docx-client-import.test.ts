import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, test } from "vitest";

import { convertDocxToMarkdownFile, isDocxUpload } from "../features/documents/docx-client-import";

describe("client DOCX import", () => {
  test("converts a Word document into a markdown file before upload", async () => {
    const fixturePath = join(process.cwd(), "node_modules", "mammoth", "test", "test-data", "single-paragraph.docx");
    const fixture = readFileSync(fixturePath);
    const file = new File([fixture], "customer-brief.docx", {
      type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    });

    const markdownFile = await convertDocxToMarkdownFile(file);

    expect(isDocxUpload(file)).toBe(true);
    expect({
      name: markdownFile.name,
      type: markdownFile.type,
      text: (await markdownFile.text()).trim(),
    }).toEqual({
      name: "customer-brief.md",
      type: "text/markdown",
      text: "Walking on imported air",
    });
  });
});
