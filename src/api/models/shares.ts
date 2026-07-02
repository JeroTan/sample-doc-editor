import type { ApiEnv, DbShareRow } from "../types";
import { mapShare } from "./mappers";

export async function listShares(env: ApiEnv, documentId: string) {
  const rows = await env.DB.prepare(
    `
      SELECT document_shares.id, document_shares.document_id, document_shares.user_id, users.email AS user_email,
        users.display_name AS user_name, document_shares.role, document_shares.created_at, document_shares.updated_at
      FROM document_shares
      JOIN users ON users.id = document_shares.user_id
      WHERE document_shares.document_id = ?
      ORDER BY users.email ASC
    `,
  )
    .bind(documentId)
    .all<DbShareRow>();

  return rows.results.map(mapShare);
}

export async function getShareById(env: ApiEnv, shareId: string) {
  const row = await env.DB.prepare(
    `
      SELECT document_shares.id, document_shares.document_id, document_shares.user_id, users.email AS user_email,
        users.display_name AS user_name, document_shares.role, document_shares.created_at, document_shares.updated_at
      FROM document_shares
      JOIN users ON users.id = document_shares.user_id
      WHERE document_shares.id = ?
    `,
  )
    .bind(shareId)
    .first<DbShareRow>();

  return row ? mapShare(row) : null;
}

export async function createShare(env: ApiEnv, input: { id: string; documentId: string; userId: string; role: "viewer" | "editor" }) {
  await env.DB.prepare(
    `
      INSERT INTO document_shares (id, document_id, user_id, role)
      VALUES (?, ?, ?, ?)
    `,
  )
    .bind(input.id, input.documentId, input.userId, input.role)
    .run();

  return getShareById(env, input.id);
}

export async function updateShareRole(env: ApiEnv, shareId: string, role: "viewer" | "editor") {
  await env.DB.prepare("UPDATE document_shares SET role = ? WHERE id = ?").bind(role, shareId).run();
  return getShareById(env, shareId);
}

export async function deleteShare(env: ApiEnv, shareId: string) {
  await env.DB.prepare("DELETE FROM document_shares WHERE id = ?").bind(shareId).run();
}
