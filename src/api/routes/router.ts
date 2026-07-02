import { createDocumentController, deleteDocumentController, getDocumentController, listDocumentsController, renameDocumentController, saveDocumentContentController } from "../controllers/documents-controller";
import { getMeController, loginController, logoutController, registerController, startSessionController } from "../controllers/session-controller";
import { grantShareController, listSharesController, revokeShareController, updateShareController } from "../controllers/shares-controller";
import { importIntoDocumentController, importUploadController } from "../controllers/uploads-controller";
import { errorResponse, methodNotAllowed, notFound } from "../config/http";
import type { ApiEnv } from "../types";

type RouteParams = {
  documentId?: string;
  shareId?: string;
};

export async function handleApiRequest(request: Request, env: ApiEnv): Promise<Response> {
  try {
    return await dispatchApiRequest(request, env);
  } catch (error) {
    return errorResponse(error);
  }
}

async function dispatchApiRequest(request: Request, env: ApiEnv): Promise<Response> {
  const { pathname } = new URL(request.url);
  const segments = pathname.split("/").filter(Boolean);
  const apiSegments = segments[0] === "api" ? segments.slice(1) : segments;
  const method = request.method.toUpperCase();
  const params = readParams(apiSegments);

  if (apiSegments.length === 1 && apiSegments[0] === "me") {
    if (method === "GET") return getMeController(request, env);
    return methodNotAllowed();
  }

  if (apiSegments.length === 1 && apiSegments[0] === "session") {
    if (method === "POST") return startSessionController(request, env);
    if (method === "DELETE") return logoutController();
    return methodNotAllowed();
  }

  if (apiSegments.length === 2 && apiSegments[0] === "auth" && apiSegments[1] === "login") {
    if (method === "POST") return loginController(request, env);
    return methodNotAllowed();
  }

  if (apiSegments.length === 2 && apiSegments[0] === "auth" && apiSegments[1] === "register") {
    if (method === "POST") return registerController(request, env);
    return methodNotAllowed();
  }

  if (apiSegments.length === 1 && apiSegments[0] === "documents") {
    if (method === "GET") return listDocumentsController(request, env);
    if (method === "POST") return createDocumentController(request, env);
    return methodNotAllowed();
  }

  if (apiSegments.length === 2 && apiSegments[0] === "documents" && params.documentId) {
    if (method === "GET") return getDocumentController(request, env, params.documentId);
    if (method === "DELETE") return deleteDocumentController(request, env, params.documentId);
    return methodNotAllowed();
  }

  if (apiSegments.length === 3 && apiSegments[0] === "documents" && apiSegments[2] === "title" && params.documentId) {
    if (method === "PATCH") return renameDocumentController(request, env, params.documentId);
    return methodNotAllowed();
  }

  if (apiSegments.length === 3 && apiSegments[0] === "documents" && apiSegments[2] === "content" && params.documentId) {
    if (method === "PUT") return saveDocumentContentController(request, env, params.documentId);
    return methodNotAllowed();
  }

  if (apiSegments.length === 3 && apiSegments[0] === "documents" && apiSegments[2] === "import" && params.documentId) {
    if (method === "POST") return importIntoDocumentController(request, env, params.documentId);
    return methodNotAllowed();
  }

  if (apiSegments.length === 3 && apiSegments[0] === "documents" && apiSegments[2] === "shares" && params.documentId) {
    if (method === "GET") return listSharesController(request, env, params.documentId);
    if (method === "POST") return grantShareController(request, env, params.documentId);
    return methodNotAllowed();
  }

  if (apiSegments.length === 4 && apiSegments[0] === "documents" && apiSegments[2] === "shares" && params.documentId && params.shareId) {
    if (method === "PATCH") return updateShareController(request, env, params.documentId, params.shareId);
    if (method === "DELETE") return revokeShareController(request, env, params.documentId, params.shareId);
    return methodNotAllowed();
  }

  if (apiSegments.length === 2 && apiSegments[0] === "uploads" && apiSegments[1] === "import") {
    if (method === "POST") return importUploadController(request, env);
    return methodNotAllowed();
  }

  return notFound();
}

function readParams(segments: string[]): RouteParams {
  if (segments[0] !== "documents") {
    return {};
  }

  return {
    documentId: segments[1] ? decodeURIComponent(segments[1]) : undefined,
    shareId: segments[3] ? decodeURIComponent(segments[3]) : undefined,
  };
}
