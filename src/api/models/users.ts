import type { ApiEnv, DbAuthCredentialRow, DbUserRow } from "../types";
import { mapUser } from "./mappers";

export type NewUserInput = {
  id: string;
  email: string;
  displayName: string;
  avatarInitials: string;
};

export type NewCredentialInput = {
  userId: string;
  email: string;
  passwordSalt: string;
  passwordHash: string;
};

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

export async function createUser(env: ApiEnv, input: NewUserInput) {
  await env.DB.prepare(
    `
      INSERT INTO users (id, email, display_name, avatar_initials)
      VALUES (?, ?, ?, ?)
    `,
  )
    .bind(input.id, input.email, input.displayName, input.avatarInitials)
    .run();

  return findUserById(env, input.id);
}

export async function findCredentialByEmail(env: ApiEnv, email: string) {
  return env.DB.prepare(
    `
      SELECT user_id, email, password_salt, password_hash, created_at, updated_at
      FROM auth_credentials
      WHERE email = lower(trim(?))
    `,
  )
    .bind(email)
    .first<DbAuthCredentialRow>();
}

export async function createCredential(env: ApiEnv, input: NewCredentialInput) {
  await env.DB.prepare(
    `
      INSERT INTO auth_credentials (user_id, email, password_salt, password_hash)
      VALUES (?, ?, ?, ?)
    `,
  )
    .bind(input.userId, input.email, input.passwordSalt, input.passwordHash)
    .run();
}
