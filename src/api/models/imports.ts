import type { ApiEnv } from "../types";

export async function createImportRecord(env: ApiEnv, input: {
  id: string;
  documentId: string | null;
  userId: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  status: "success" | "failed";
  errorMessage?: string | null;
}) {
  await env.DB.prepare(
    `
      INSERT INTO document_imports (id, document_id, user_id, file_name, file_type, file_size, status, error_message)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `,
  )
    .bind(
      input.id,
      input.documentId,
      input.userId,
      input.fileName,
      input.fileType,
      input.fileSize,
      input.status,
      input.errorMessage ?? null,
    )
    .run();
}

export async function createAttachmentRecord(env: ApiEnv, input: {
  id: string;
  documentId: string;
  userId: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  r2Key: string;
  contentText?: string | null;
}) {
  await env.DB.prepare(
    `
      INSERT INTO document_attachments (id, document_id, user_id, file_name, file_type, file_size, r2_key, content_text)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `,
  )
    .bind(input.id, input.documentId, input.userId, input.fileName, input.fileType, input.fileSize, input.r2Key, input.contentText ?? null)
    .run();
}
