export type ApiEnv = Pick<Env, "DB" | "STORAGE">;

export type User = {
  id: string;
  email: string;
  displayName: string;
  avatarInitials: string;
  createdAt: string;
  updatedAt: string;
};

export type DocumentSummary = {
  id: string;
  title: string;
  ownerId: string;
  ownerEmail: string;
  ownerName: string;
  accessRole: "owner" | "viewer" | "editor";
  createdAt: string;
  updatedAt: string;
  lastOpenedAt: string | null;
};

export type DocumentDetail = DocumentSummary & {
  contentHtml: string;
  contentMarkdown: string;
  contentText: string;
};

export type DocumentShare = {
  id: string;
  documentId: string;
  userId: string;
  userEmail: string;
  userName: string;
  role: "viewer" | "editor";
  createdAt: string;
  updatedAt: string;
};

export type DbUserRow = {
  id: string;
  email: string;
  display_name: string;
  avatar_initials: string;
  created_at: string;
  updated_at: string;
};

export type DbDocumentRow = {
  id: string;
  owner_id: string;
  title: string;
  content_html: string;
  content_markdown: string;
  content_text: string;
  created_at: string;
  updated_at: string;
  last_opened_at: string | null;
  owner_email: string;
  owner_name: string;
  access_role?: "owner" | "viewer" | "editor";
};

export type DbShareRow = {
  id: string;
  document_id: string;
  user_id: string;
  user_email: string;
  user_name: string;
  role: "viewer" | "editor";
  created_at: string;
  updated_at: string;
};
