import {
  createPasswordSalt,
  hashPassword,
  initialsFromDisplayName,
  normalizeAuthEmail,
  normalizeDisplayName,
  timingSafeEqual,
  validatePassword,
} from "../../lib/auth-rules";
import { createId } from "../../lib/ids";
import { readSessionUserId } from "../config/cookies";
import { ApiError } from "../config/http";
import type { ApiEnv } from "../types";
import { countUserDocuments, createCredential, createUser, findCredentialByEmail, findUserByEmail, findUserById } from "../models/users";

export async function getCurrentUser(env: ApiEnv, request: Request) {
  const idFromHeader = request.headers.get("x-user-id");
  const emailFromHeader = request.headers.get("x-user-email");
  const idFromCookie = readSessionUserId(request);

  const user = idFromHeader
    ? await findUserById(env, idFromHeader)
    : emailFromHeader
      ? await findUserByEmail(env, emailFromHeader)
      : idFromCookie
        ? await findUserById(env, idFromCookie)
        : null;

  if (!user) {
    throw new ApiError(401, "unauthorized", "Sign in first.");
  }

  return user;
}

export async function startSession(env: ApiEnv, input: { email?: unknown; userId?: unknown }) {
  const user =
    typeof input.userId === "string"
      ? await findUserById(env, input.userId)
      : typeof input.email === "string"
        ? await findUserByEmail(env, input.email)
        : null;

  if (!user) {
    throw new ApiError(404, "user_not_found", "Seeded user was not found.");
  }

  const counts = await countUserDocuments(env, user.id);
  return { user, counts };
}

export async function getProfile(env: ApiEnv, request: Request) {
  const user = await getCurrentUser(env, request);
  const counts = await countUserDocuments(env, user.id);
  return { user, counts };
}

export async function loginWithPassword(env: ApiEnv, input: { email?: unknown; password?: unknown }) {
  const email = requireValid(normalizeAuthEmail(input.email));
  const password = requireValid(validatePassword(input.password));
  const credential = await findCredentialByEmail(env, email);

  if (!credential) {
    throw new ApiError(401, "invalid_credentials", "Email or password is incorrect.");
  }

  const passwordHash = await hashPassword(password, credential.password_salt);
  if (!timingSafeEqual(passwordHash, credential.password_hash)) {
    throw new ApiError(401, "invalid_credentials", "Email or password is incorrect.");
  }

  const user = await findUserById(env, credential.user_id);
  if (!user) {
    throw new ApiError(401, "invalid_credentials", "Email or password is incorrect.");
  }

  const counts = await countUserDocuments(env, user.id);
  return { user, counts };
}

export async function registerWithPassword(env: ApiEnv, input: { displayName?: unknown; email?: unknown; password?: unknown }) {
  const displayName = requireValid(normalizeDisplayName(input.displayName));
  const email = requireValid(normalizeAuthEmail(input.email));
  const password = requireValid(validatePassword(input.password));

  const existing = await findUserByEmail(env, email);
  if (existing) {
    throw new ApiError(409, "email_already_registered", "Email is already registered.");
  }

  const passwordSalt = createPasswordSalt();
  const passwordHash = await hashPassword(password, passwordSalt);
  const user = await createUser(env, {
    id: createId("usr"),
    email,
    displayName,
    avatarInitials: initialsFromDisplayName(displayName),
  });

  if (!user) {
    throw new ApiError(500, "registration_failed", "User could not be created.");
  }

  await createCredential(env, {
    userId: user.id,
    email,
    passwordSalt,
    passwordHash,
  });

  const counts = await countUserDocuments(env, user.id);
  return { user, counts };
}

function requireValid<T>(result: { ok: true; value: T } | { ok: false; code: string; message: string }) {
  if (!result.ok) {
    throw new ApiError(400, result.code, result.message);
  }

  return result.value;
}
