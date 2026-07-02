import { ApiError } from "../config/http";
import { createShare, deleteShare, getShareById, listShares, updateShareRole } from "../models/shares";
import { findUserByEmail } from "../models/users";
import type { ApiEnv, User } from "../types";
import { createId, requireOwner } from "./documents";

export async function listDocumentShares(env: ApiEnv, user: User, documentId: string) {
  await requireOwner(env, user, documentId);
  return listShares(env, documentId);
}

export async function grantDocumentShare(env: ApiEnv, user: User, documentId: string, input: { email?: unknown; role?: unknown }) {
  const document = await requireOwner(env, user, documentId);
  const email = typeof input.email === "string" ? input.email : "";
  const target = await findUserByEmail(env, email);
  if (!target) {
    throw new ApiError(404, "user_not_found", "Target user was not found.");
  }

  if (target.id === user.id || target.id === document.ownerId) {
    throw new ApiError(400, "share_with_owner", "Document owner already has access.");
  }

  const role = parseRole(input.role);
  try {
    const share = await createShare(env, { id: createId("share"), documentId, userId: target.id, role });
    if (!share) {
      throw new ApiError(500, "share_create_failed", "Share could not be created.");
    }
    return share;
  } catch (error) {
    const errorText = String(error).toLowerCase();
    if (errorText.includes("unique") || errorText.includes("constraint")) {
      throw new ApiError(409, "share_already_exists", "User already has access to this document.");
    }
    throw error;
  }
}

export async function changeDocumentShareRole(env: ApiEnv, user: User, documentId: string, shareId: string, input: { role?: unknown }) {
  await requireOwner(env, user, documentId);
  const existing = await getShareById(env, shareId);
  if (!existing || existing.documentId !== documentId) {
    throw new ApiError(404, "share_not_found", "Share was not found.");
  }

  const share = await updateShareRole(env, shareId, parseRole(input.role));
  if (!share) {
    throw new ApiError(404, "share_not_found", "Share was not found.");
  }

  return share;
}

export async function revokeDocumentShare(env: ApiEnv, user: User, documentId: string, shareId: string) {
  await requireOwner(env, user, documentId);
  const existing = await getShareById(env, shareId);
  if (!existing || existing.documentId !== documentId) {
    throw new ApiError(404, "share_not_found", "Share was not found.");
  }

  await deleteShare(env, shareId);
  return { deleted: true };
}

function parseRole(value: unknown): "viewer" | "editor" {
  if (value === undefined || value === null || value === "") {
    return "viewer";
  }

  if (value === "viewer" || value === "editor") {
    return value;
  }

  throw new ApiError(400, "invalid_role", "Share role must be viewer or editor.");
}
