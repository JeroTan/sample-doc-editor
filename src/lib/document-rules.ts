const DEFAULT_DOCUMENT_TITLE = "Untitled document";
const MAX_TITLE_LENGTH = 120;
const MAX_IMPORT_FILE_SIZE = 1024 * 1024;
const CONTROL_CHARACTER_PATTERN = /[\u0000-\u001F\u007F]/u;

type RuleResult<T> =
  | { ok: true; value: T }
  | { ok: false; code: string; message: string };

type ImportFileInput = {
  name: string;
  type?: string;
  size: number;
};

type ImportFileMetadata = {
  extension: ".md" | ".txt";
  fileName: string;
  fileSize: number;
  fileType: string;
};

const importMimeTypes: Record<ImportFileMetadata["extension"], Set<string>> = {
  ".md": new Set(["", "application/octet-stream", "text/markdown", "text/plain", "text/x-markdown"]),
  ".txt": new Set(["", "application/octet-stream", "text/plain"]),
};

export function normalizeDocumentTitle(input: string): RuleResult<string> {
  if (CONTROL_CHARACTER_PATTERN.test(input)) {
    return {
      ok: false,
      code: "title_control_character",
      message: "Title cannot contain control characters.",
    };
  }

  const title = input.trim().replace(/\s+/g, " ");

  if (title.length === 0) {
    return { ok: true, value: DEFAULT_DOCUMENT_TITLE };
  }

  if (title.length > MAX_TITLE_LENGTH) {
    return {
      ok: false,
      code: "title_too_long",
      message: "Title must be 120 characters or fewer.",
    };
  }

  return { ok: true, value: title };
}

export function validateImportFile(input: ImportFileInput): RuleResult<ImportFileMetadata> {
  const fileName = input.name.trim();
  const fileType = input.type?.trim().toLowerCase() ?? "";
  const extension = getSupportedExtension(fileName);

  if (!extension) {
    return {
      ok: false,
      code: "file_type_unsupported",
      message: "Only .txt and .md uploads are supported.",
    };
  }

  if (input.size <= 0) {
    return {
      ok: false,
      code: "file_empty",
      message: "Uploaded file is empty.",
    };
  }

  if (input.size > MAX_IMPORT_FILE_SIZE) {
    return {
      ok: false,
      code: "file_too_large",
      message: "Uploaded file must be 1 MB or smaller.",
    };
  }

  if (!importMimeTypes[extension].has(fileType)) {
    return {
      ok: false,
      code: "file_mime_mismatch",
      message: "Uploaded file MIME type does not match its extension.",
    };
  }

  return {
    ok: true,
    value: {
      extension,
      fileName,
      fileSize: input.size,
      fileType,
    },
  };
}

export function decodeImportText(bytes: Uint8Array): RuleResult<string> {
  try {
    return {
      ok: true,
      value: new TextDecoder("utf-8", { fatal: true }).decode(bytes),
    };
  } catch {
    return {
      ok: false,
      code: "file_encoding_invalid",
      message: "Uploaded file must be valid UTF-8 text.",
    };
  }
}

function getSupportedExtension(fileName: string): ImportFileMetadata["extension"] | null {
  const lowerName = fileName.toLowerCase();

  if (lowerName.endsWith(".md")) {
    return ".md";
  }

  if (lowerName.endsWith(".txt")) {
    return ".txt";
  }

  return null;
}
