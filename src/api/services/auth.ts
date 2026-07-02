import { readSessionUserId } from "../config/cookies";
import { ApiError } from "../config/http";
import type { ApiEnv } from "../types";
import { countUserDocuments, findUserByEmail, findUserById } from "../models/users";

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
    throw new ApiError(401, "unauthorized", "Select a valid seeded user first.");
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
