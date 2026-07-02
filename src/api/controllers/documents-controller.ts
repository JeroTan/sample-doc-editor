import { dataResponse, readJsonBody } from "../config/http";
import { getCurrentUser } from "../services/auth";
import { createUserDocument, deleteUserDocument, getAccessibleDocument, listDocuments, updateDocumentContent, updateDocumentTitle } from "../services/documents";
import type { ApiEnv } from "../types";

export async function listDocumentsController(request: Request, env: ApiEnv) {
  const user = await getCurrentUser(env, request);
  return dataResponse(await listDocuments(env, user));
}

export async function createDocumentController(request: Request, env: ApiEnv) {
  const user = await getCurrentUser(env, request);
  const document = await createUserDocument(env, user, await readJsonBody(request));
  return dataResponse({ document }, 201);
}

export async function getDocumentController(request: Request, env: ApiEnv, documentId: string) {
  const user = await getCurrentUser(env, request);
  const document = await getAccessibleDocument(env, user, documentId);
  return dataResponse({ document });
}

export async function renameDocumentController(request: Request, env: ApiEnv, documentId: string) {
  const user = await getCurrentUser(env, request);
  const document = await updateDocumentTitle(env, user, documentId, await readJsonBody(request));
  return dataResponse({ document });
}

export async function saveDocumentContentController(request: Request, env: ApiEnv, documentId: string) {
  const user = await getCurrentUser(env, request);
  const document = await updateDocumentContent(env, user, documentId, await readJsonBody(request));
  return dataResponse({ document });
}

export async function deleteDocumentController(request: Request, env: ApiEnv, documentId: string) {
  const user = await getCurrentUser(env, request);
  return dataResponse(await deleteUserDocument(env, user, documentId));
}
