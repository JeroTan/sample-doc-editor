export const SEEDED_USERS = [
  {
    displayName: "Alice Rivera",
    email: "alice@example.com",
    initials: "AR",
  },
  {
    displayName: "Bob Chen",
    email: "bob@example.com",
    initials: "BC",
  },
  {
    displayName: "Reviewer",
    email: "reviewer@example.com",
    initials: "RV",
  },
] as const;

type DocumentRole = "owner" | "editor" | "viewer";

type SectionDocument = {
  accessRole: DocumentRole;
  title?: string | null;
};

export function displayDocumentTitle(title: string | null | undefined) {
  const normalized = title?.trim();
  return normalized ? normalized : "Untitled document";
}

export function splitDocumentSections<TDocument extends SectionDocument>(documents: readonly TDocument[]) {
  const normalizedDocuments = documents.map((document) => ({
    ...document,
    title: displayDocumentTitle(document.title),
  }));

  return {
    owned: normalizedDocuments.filter((document) => document.accessRole === "owner"),
    shared: normalizedDocuments.filter((document) => document.accessRole !== "owner"),
  };
}

export function canEditDocument(document: { accessRole: DocumentRole } | null | undefined) {
  return document?.accessRole === "owner" || document?.accessRole === "editor";
}

export function canShareDocument(document: { accessRole: DocumentRole } | null | undefined) {
  return document?.accessRole === "owner";
}

export function formatUpdatedAt(value: string | null | undefined) {
  if (!value) {
    return "No updates";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "No updates";
  }

  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

export function getFriendlyError(error: unknown) {
  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }

  return "Something went wrong.";
}
