import { dataResponse, readJsonBody } from "../config/http";
import { getCurrentUser } from "../services/auth";
import { changeDocumentShareRole, grantDocumentShare, listDocumentShares, revokeDocumentShare } from "../services/shares";
import type { ApiEnv } from "../types";

export async function listSharesController(request: Request, env: ApiEnv, documentId: string) {
  const user = await getCurrentUser(env, request);
  return dataResponse({ shares: await listDocumentShares(env, user, documentId) });
}

export async function grantShareController(request: Request, env: ApiEnv, documentId: string) {
  const user = await getCurrentUser(env, request);
  return dataResponse({ share: await grantDocumentShare(env, user, documentId, await readJsonBody(request)) }, 201);
}

export async function updateShareController(request: Request, env: ApiEnv, documentId: string, shareId: string) {
  const user = await getCurrentUser(env, request);
  return dataResponse({ share: await changeDocumentShareRole(env, user, documentId, shareId, await readJsonBody(request)) });
}

export async function revokeShareController(request: Request, env: ApiEnv, documentId: string, shareId: string) {
  const user = await getCurrentUser(env, request);
  return dataResponse(await revokeDocumentShare(env, user, documentId, shareId));
}
