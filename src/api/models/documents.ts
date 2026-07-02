import type { ApiEnv, DbDocumentRow } from "../types";
import { mapDocumentDetail, mapDocumentSummary } from "./mappers";

export async function listOwnedDocuments(env: ApiEnv, userId: string) {
  const rows = await env.DB.prepare(
    `
      SELECT documents.*, users.email AS owner_email, users.display_name AS owner_name, 'owner' AS access_role
      FROM documents
      JOIN users ON users.id = documents.owner_id
      WHERE documents.owner_id = ?
      ORDER BY documents.updated_at DESC
    `,
  )
    .bind(userId)
    .all<DbDocumentRow>();

  return rows.results.map(mapDocumentSummary);
}

export async function listSharedDocuments(env: ApiEnv, userId: string) {
  const rows = await env.DB.prepare(
    `
      SELECT documents.*, owners.email AS owner_email, owners.display_name AS owner_name, document_shares.role AS access_role
      FROM document_shares
      JOIN documents ON documents.id = document_shares.document_id
      JOIN users AS owners ON owners.id = documents.owner_id
      WHERE document_shares.user_id = ?
      ORDER BY documents.updated_at DESC
    `,
  )
    .bind(userId)
    .all<DbDocumentRow>();

  return rows.results.map(mapDocumentSummary);
}

export async function getDocumentForUser(env: ApiEnv, documentId: string, userId: string) {
  const row = await env.DB.prepare(
    `
      SELECT documents.*, owners.email AS owner_email, owners.display_name AS owner_name,
        CASE
          WHEN documents.owner_id = ? THEN 'owner'
          ELSE document_shares.role
        END AS access_role
      FROM documents
      JOIN users AS owners ON owners.id = documents.owner_id
      LEFT JOIN document_shares ON document_shares.document_id = documents.id AND document_shares.user_id = ?
      WHERE documents.id = ?
    `,
  )
    .bind(userId, userId, documentId)
    .first<DbDocumentRow>();

  if (!row || (!row.access_role && row.owner_id !== userId)) {
    return null;
  }

  return mapDocumentDetail(row);
}

export async function getDocumentOwner(env: ApiEnv, documentId: string) {
  return env.DB.prepare("SELECT owner_id FROM documents WHERE id = ?").bind(documentId).first<{ owner_id: string }>();
}

export async function createDocument(env: ApiEnv, input: {
  id: string;
  ownerId: string;
  title: string;
  contentHtml?: string;
  contentMarkdown?: string;
  contentText?: string;
}) {
  await env.DB.prepare(
    `
      INSERT INTO documents (id, owner_id, title, content_html, content_markdown, content_text)
      VALUES (?, ?, ?, ?, ?, ?)
    `,
  )
    .bind(input.id, input.ownerId, input.title, input.contentHtml ?? "", input.contentMarkdown ?? "", input.contentText ?? "")
    .run();

  return getDocumentForUser(env, input.id, input.ownerId);
}

export async function renameDocument(env: ApiEnv, documentId: string, title: string) {
  await env.DB.prepare("UPDATE documents SET title = ? WHERE id = ?").bind(title, documentId).run();
}

export async function saveDocumentContent(env: ApiEnv, documentId: string, content: {
  contentHtml: string;
  contentMarkdown: string;
  contentText: string;
}) {
  await env.DB.prepare(
    `
      UPDATE documents
      SET content_html = ?, content_markdown = ?, content_text = ?
      WHERE id = ?
    `,
  )
    .bind(content.contentHtml, content.contentMarkdown, content.contentText, documentId)
    .run();
}

export async function markDocumentOpened(env: ApiEnv, documentId: string) {
  await env.DB.prepare("UPDATE documents SET last_opened_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now') WHERE id = ?").bind(documentId).run();
}

export async function deleteDocument(env: ApiEnv, documentId: string) {
  await env.DB.prepare("DELETE FROM document_shares WHERE document_id = ?").bind(documentId).run();
  await env.DB.prepare("DELETE FROM document_attachments WHERE document_id = ?").bind(documentId).run();
  await env.DB.prepare("DELETE FROM document_imports WHERE document_id = ?").bind(documentId).run();
  await env.DB.prepare("DELETE FROM documents WHERE id = ?").bind(documentId).run();
}

export async function listDocumentAttachmentKeys(env: ApiEnv, documentId: string) {
  const result = await env.DB.prepare("SELECT r2_key FROM document_attachments WHERE document_id = ?").bind(documentId).all();
  return result.results
    .map((row) => (row as { r2_key?: unknown }).r2_key)
    .filter((key): key is string => typeof key === "string" && key.length > 0);
}
