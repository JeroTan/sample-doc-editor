import type { DbDocumentRow, DbShareRow, DbUserRow, DocumentDetail, DocumentShare, DocumentSummary, User } from "../types";

export function mapUser(row: DbUserRow): User {
  return {
    id: row.id,
    email: row.email,
    displayName: row.display_name,
    avatarInitials: row.avatar_initials,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function mapDocumentSummary(row: DbDocumentRow): DocumentSummary {
  return {
    id: row.id,
    title: row.title,
    ownerId: row.owner_id,
    ownerEmail: row.owner_email,
    ownerName: row.owner_name,
    accessRole: row.access_role ?? "owner",
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    lastOpenedAt: row.last_opened_at,
  };
}

export function mapDocumentDetail(row: DbDocumentRow): DocumentDetail {
  return {
    ...mapDocumentSummary(row),
    contentHtml: row.content_html,
    contentMarkdown: row.content_markdown,
    contentText: row.content_text,
  };
}

export function mapShare(row: DbShareRow): DocumentShare {
  return {
    id: row.id,
    documentId: row.document_id,
    userId: row.user_id,
    userEmail: row.user_email,
    userName: row.user_name,
    role: row.role,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}
