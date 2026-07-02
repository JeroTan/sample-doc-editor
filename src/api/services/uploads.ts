import { decodeImportText, normalizeDocumentTitle, validateImportFile } from "../../lib/document-rules";
import { createId } from "../../lib/ids";
import { markdownToHtml } from "../../lib/markdown-to-html";
import { ApiError } from "../config/http";
import { createAttachmentRecord, createImportRecord } from "../models/imports";
import type { ApiEnv, User } from "../types";
import { createUserDocument, requireWritableDocument, updateDocumentContent } from "./documents";

export async function importUploadAsDocument(env: ApiEnv, user: User, request: Request) {
  const parsed = await parseImportFile(env, user, request);
  const title = normalizeDocumentTitle(stripExtension(parsed.file.name));
  if (!title.ok) {
    throw new ApiError(400, title.code, title.message);
  }

  const document = await createUserDocument(env, user, {
    title: title.value,
    contentMarkdown: parsed.text,
    contentHtml: markdownToHtml(parsed.text),
    contentText: parsed.text,
  });

  await storeOriginalUpload(env, user, document.id, parsed.file, parsed.fileType, parsed.fileSize, parsed.text);

  return document;
}

export async function importUploadIntoDocument(env: ApiEnv, user: User, documentId: string, request: Request) {
  const document = await requireWritableDocument(env, user, documentId);
  const parsed = await parseImportFile(env, user, request);
  const updated = await updateDocumentContent(env, user, document.id, {
    contentMarkdown: parsed.text,
    contentHtml: markdownToHtml(parsed.text),
    contentText: parsed.text,
  });

  await storeOriginalUpload(env, user, document.id, parsed.file, parsed.fileType, parsed.fileSize, parsed.text);

  return updated;
}

async function parseImportFile(env: ApiEnv, user: User, request: Request) {
  const formData = await request.formData();
  const file = formData.get("file");
  if (!(file instanceof File)) {
    throw new ApiError(400, "file_missing", "Upload requires one file.");
  }

  const fileValidation = validateImportFile({ name: file.name, type: file.type, size: file.size });
  if (!fileValidation.ok) {
    await recordFailedImport(env, user, file, fileValidation.message);
    throw new ApiError(400, fileValidation.code, fileValidation.message);
  }

  const bytes = new Uint8Array(await file.arrayBuffer());
  const text = decodeImportText(bytes);
  if (!text.ok) {
    await recordFailedImport(env, user, file, text.message);
    throw new ApiError(400, text.code, text.message);
  }

  return {
    file,
    fileType: fileValidation.value.fileType,
    fileSize: fileValidation.value.fileSize,
    text: text.value,
  };
}

async function storeOriginalUpload(env: ApiEnv, user: User, documentId: string, file: File, fileType: string, fileSize: number, contentText: string) {
  if (!env.STORAGE) {
    throw new ApiError(503, "storage_unavailable", "File storage is unavailable.");
  }
  const r2Key = `documents/${documentId}/uploads/${createId("object")}-${safeFileName(file.name)}`;
  await env.STORAGE.put(r2Key, file);

  try {
    await createAttachmentRecord(env, {
      id: createId("att"),
      documentId,
      userId: user.id,
      fileName: file.name,
      fileType,
      fileSize,
      r2Key,
      contentText,
    });
    await createImportRecord(env, {
      id: createId("import"),
      documentId,
      userId: user.id,
      fileName: file.name,
      fileType,
      fileSize,
      status: "success",
    });
  } catch (error) {
    await env.STORAGE.delete(r2Key);
    throw error;
  }
}

async function recordFailedImport(env: ApiEnv, user: User, file: File, message: string) {
  await createImportRecord(env, {
    id: createId("import"),
    documentId: null,
    userId: user.id,
    fileName: file.name || "upload",
    fileType: file.type || "application/octet-stream",
    fileSize: Math.max(file.size, 0),
    status: "failed",
    errorMessage: message,
  }).catch(() => undefined);
}

function stripExtension(fileName: string) {
  return fileName.replace(/\.[^.]+$/u, "");
}

function safeFileName(fileName: string) {
  return fileName.trim().replace(/[^a-zA-Z0-9._-]+/g, "-").replace(/^-+|-+$/g, "") || "upload";
}
