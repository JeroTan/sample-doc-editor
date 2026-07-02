import { normalizeDocumentTitle } from "../../lib/document-rules";
import { createId } from "../../lib/ids";
import { ApiError } from "../config/http";
import { createDocument as insertDocument, deleteDocument as deleteDocumentRow, getDocumentForUser, getDocumentOwner, listOwnedDocuments, listSharedDocuments, markDocumentOpened, renameDocument, saveDocumentContent } from "../models/documents";
import type { ApiEnv, User } from "../types";

const MAX_CONTENT_LENGTH = 1_000_000;

export async function listDocuments(env: ApiEnv, user: User) {
  return {
    owned: await listOwnedDocuments(env, user.id),
    shared: await listSharedDocuments(env, user.id),
  };
}

export async function createUserDocument(env: ApiEnv, user: User, input: { title?: unknown; contentMarkdown?: unknown; contentHtml?: unknown; contentText?: unknown }) {
  const titleResult = normalizeDocumentTitle(typeof input.title === "string" ? input.title : "");
  if (!titleResult.ok) {
    throw new ApiError(400, titleResult.code, titleResult.message);
  }

  const document = await insertDocument(env, {
    id: createId("doc"),
    ownerId: user.id,
    title: titleResult.value,
    contentMarkdown: asOptionalString(input.contentMarkdown),
    contentHtml: asOptionalString(input.contentHtml),
    contentText: asOptionalString(input.contentText),
  });

  if (!document) {
    throw new ApiError(500, "document_create_failed", "Document could not be created.");
  }

  return document;
}

export async function getAccessibleDocument(env: ApiEnv, user: User, documentId: string) {
  const owner = await getDocumentOwner(env, documentId);
  if (!owner) {
    throw new ApiError(404, "document_not_found", "Document was not found.");
  }

  const document = await getDocumentForUser(env, documentId, user.id);
  if (!document) {
    throw new ApiError(403, "forbidden", "You do not have access to this document.");
  }

  await markDocumentOpened(env, documentId);
  return document;
}

export async function updateDocumentTitle(env: ApiEnv, user: User, documentId: string, input: { title?: unknown }) {
  const document = await requireWritableDocument(env, user, documentId);
  assertFreshUpdate(document.updatedAt, input);
  const titleResult = normalizeDocumentTitle(typeof input.title === "string" ? input.title : "");
  if (!titleResult.ok) {
    throw new ApiError(400, titleResult.code, titleResult.message);
  }

  await renameDocument(env, document.id, titleResult.value);
  return getAccessibleDocument(env, user, document.id);
}

export async function updateDocumentContent(env: ApiEnv, user: User, documentId: string, input: {
  contentHtml?: unknown;
  contentMarkdown?: unknown;
  contentText?: unknown;
}) {
  const document = await requireWritableDocument(env, user, documentId);
  assertFreshUpdate(document.updatedAt, input);
  const content = {
    contentHtml: asOptionalString(input.contentHtml),
    contentMarkdown: asOptionalString(input.contentMarkdown),
    contentText: asOptionalString(input.contentText),
  };

  if (
    content.contentHtml.length > MAX_CONTENT_LENGTH ||
    content.contentMarkdown.length > MAX_CONTENT_LENGTH ||
    content.contentText.length > MAX_CONTENT_LENGTH
  ) {
    throw new ApiError(413, "content_too_large", "Document content must be 1 MB or smaller.");
  }

  await saveDocumentContent(env, document.id, content);
  return getAccessibleDocument(env, user, document.id);
}

export async function deleteUserDocument(env: ApiEnv, user: User, documentId: string) {
  const document = await requireOwner(env, user, documentId);
  await deleteDocumentRow(env, document.id);
  return { deleted: true };
}

export async function requireOwner(env: ApiEnv, user: User, documentId: string) {
  const owner = await getDocumentOwner(env, documentId);
  if (!owner) {
    throw new ApiError(404, "document_not_found", "Document was not found.");
  }

  if (owner.owner_id !== user.id) {
    throw new ApiError(403, "forbidden", "Only the document owner can perform this action.");
  }

  const document = await getDocumentForUser(env, documentId, user.id);
  if (!document) {
    throw new ApiError(404, "document_not_found", "Document was not found.");
  }

  return document;
}

export async function requireWritableDocument(env: ApiEnv, user: User, documentId: string) {
  const document = await getAccessibleDocument(env, user, documentId);
  if (document.accessRole !== "owner" && document.accessRole !== "editor") {
    throw new ApiError(403, "forbidden", "You do not have edit access to this document.");
  }

  return document;
}

function asOptionalString(value: unknown) {
  return typeof value === "string" ? value : "";
}

function assertFreshUpdate(currentUpdatedAt: string, input: Record<string, unknown>) {
  if (typeof input.updatedAt === "string" && input.updatedAt !== currentUpdatedAt) {
    throw new ApiError(409, "document_stale", "Document changed since it was loaded.");
  }
}
