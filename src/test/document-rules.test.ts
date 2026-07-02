import { describe, expect, test } from "vitest";

import { decodeImportText, normalizeDocumentTitle, validateImportFile } from "../lib/document-rules";

describe("document persistence rules", () => {
  test("document title uses fallback, trims whitespace, caps length, and rejects control characters", () => {
    expect(normalizeDocumentTitle("   ")).toEqual({ ok: true, value: "Untitled document" });
    expect(normalizeDocumentTitle("  Weekly Plan  ")).toEqual({ ok: true, value: "Weekly Plan" });
    expect(normalizeDocumentTitle("Line\nBreak")).toEqual({
      ok: false,
      code: "title_control_character",
      message: "Title cannot contain control characters.",
    });
    expect(normalizeDocumentTitle("x".repeat(121))).toEqual({
      ok: false,
      code: "title_too_long",
      message: "Title must be 120 characters or fewer.",
    });
  });

  test("upload import validation accepts text and markdown but rejects unsafe file cases", () => {
    expect(validateImportFile({ name: "notes.md", type: "text/markdown", size: 256 })).toEqual({
      ok: true,
      value: {
        extension: ".md",
        fileName: "notes.md",
        fileSize: 256,
        fileType: "text/markdown",
      },
    });

    expect(validateImportFile({ name: "empty.txt", type: "text/plain", size: 0 })).toEqual({
      ok: false,
      code: "file_empty",
      message: "Uploaded file is empty.",
    });
    expect(validateImportFile({ name: "image.png", type: "image/png", size: 128 })).toEqual({
      ok: false,
      code: "file_type_unsupported",
      message: "Only .txt and .md uploads are supported.",
    });
    expect(validateImportFile({ name: "notes.md", type: "image/png", size: 128 })).toEqual({
      ok: false,
      code: "file_mime_mismatch",
      message: "Uploaded file MIME type does not match its extension.",
    });
    expect(validateImportFile({ name: "large.md", type: "text/markdown", size: 1048577 })).toEqual({
      ok: false,
      code: "file_too_large",
      message: "Uploaded file must be 1 MB or smaller.",
    });
  });

  test("upload text decoding preserves line breaks and rejects invalid encoding", () => {
    const validBytes = new TextEncoder().encode("Line one\r\nLine two\nLine three");

    expect(decodeImportText(validBytes)).toEqual({
      ok: true,
      value: "Line one\r\nLine two\nLine three",
    });
    expect(decodeImportText(new Uint8Array([0xc3, 0x28]))).toEqual({
      ok: false,
      code: "file_encoding_invalid",
      message: "Uploaded file must be valid UTF-8 text.",
    });
  });
});
