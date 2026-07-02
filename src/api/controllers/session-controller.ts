import { clearSessionCookie, createSessionCookie } from "../config/cookies";
import { dataResponse, readJsonBody } from "../config/http";
import { getProfile, startSession } from "../services/auth";
import type { ApiEnv } from "../types";

export async function getMeController(request: Request, env: ApiEnv) {
  return dataResponse(await getProfile(env, request));
}

export async function startSessionController(request: Request, env: ApiEnv) {
  const session = await startSession(env, await readJsonBody(request));
  return dataResponse(session, 200, { "set-cookie": createSessionCookie(session.user.id) });
}

export async function logoutController() {
  return dataResponse({ deleted: true }, 200, { "set-cookie": clearSessionCookie() });
}
