import type { ApiEnv, DbUserRow } from "../types";
import { mapUser } from "./mappers";

export async function findUserById(env: ApiEnv, id: string) {
  const row = await env.DB.prepare(
    `
      SELECT id, email, display_name, avatar_initials, created_at, updated_at
      FROM users
      WHERE id = ?
    `,
  )
    .bind(id)
    .first<DbUserRow>();

  return row ? mapUser(row) : null;
}

export async function findUserByEmail(env: ApiEnv, email: string) {
  const row = await env.DB.prepare(
    `
      SELECT id, email, display_name, avatar_initials, created_at, updated_at
      FROM users
      WHERE email = lower(trim(?))
    `,
  )
    .bind(email)
    .first<DbUserRow>();

  return row ? mapUser(row) : null;
}

export async function countUserDocuments(env: ApiEnv, userId: string) {
  const owned = await env.DB.prepare("SELECT COUNT(*) AS count FROM documents WHERE owner_id = ?").bind(userId).first<{ count: number }>();
  const shared = await env.DB.prepare("SELECT COUNT(*) AS count FROM document_shares WHERE user_id = ?").bind(userId).first<{ count: number }>();

  return {
    owned: owned?.count ?? 0,
    shared: shared?.count ?? 0,
  };
}
