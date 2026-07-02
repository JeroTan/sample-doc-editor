import { dataResponse } from "../config/http";
import { getCurrentUser } from "../services/auth";
import { importUploadAsDocument, importUploadIntoDocument } from "../services/uploads";
import type { ApiEnv } from "../types";

export async function importUploadController(request: Request, env: ApiEnv) {
  const user = await getCurrentUser(env, request);
  const document = await importUploadAsDocument(env, user, request);
  return dataResponse({ document }, 201);
}

export async function importIntoDocumentController(request: Request, env: ApiEnv, documentId: string) {
  const user = await getCurrentUser(env, request);
  const document = await importUploadIntoDocument(env, user, documentId, request);
  return dataResponse({ document });
}
