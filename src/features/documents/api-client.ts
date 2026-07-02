import type { DocumentDetail, DocumentShare, DocumentSummary, User } from "@/api/types";

type ApiErrorPayload = {
  error?: {
    code?: string;
    message?: string;
    details?: unknown;
  };
};

type ApiDataPayload<TData> = {
  data: TData;
};

export type DocumentBuckets = {
  owned: DocumentSummary[];
  shared: DocumentSummary[];
};

export type SessionProfile = {
  user: User;
  counts: {
    owned: number;
    shared: number;
  };
};

export class ApiClientError extends Error {
  constructor(
    readonly status: number,
    readonly code: string,
    message: string,
    readonly details?: unknown,
  ) {
    super(message);
    this.name = "ApiClientError";
  }
}

export async function readApiPayload<TData>(response: Response): Promise<TData> {
  const body = (await readBody(response)) as ApiDataPayload<TData> & ApiErrorPayload;

  if (!response.ok) {
    throw new ApiClientError(
      response.status,
      body.error?.code ?? "request_failed",
      body.error?.message ?? "Request failed.",
      body.error?.details,
    );
  }

  if (!("data" in body)) {
    throw new ApiClientError(response.status, "invalid_response", "API response did not include data.");
  }

  return body.data;
}

export const documentApi = {
  getMe() {
    return apiRequest<SessionProfile>("/api/me");
  },

  startSession(email: string) {
    return apiRequest<SessionProfile>("/api/session", {
      method: "POST",
      body: JSON.stringify({ email }),
    });
  },

  login(input: { email: string; password: string }) {
    return apiRequest<SessionProfile>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify(input),
    });
  },

  register(input: { displayName: string; email: string; password: string }) {
    return apiRequest<SessionProfile>("/api/auth/register", {
      method: "POST",
      body: JSON.stringify(input),
    });
  },

  logout() {
    return apiRequest<{ deleted: true }>("/api/session", {
      method: "DELETE",
    });
  },

  listDocuments() {
    return apiRequest<DocumentBuckets>("/api/documents");
  },

  createDocument(title?: string) {
    return apiRequest<{ document: DocumentDetail }>("/api/documents", {
      method: "POST",
      body: JSON.stringify({ title }),
    });
  },

  getDocument(documentId: string) {
    return apiRequest<{ document: DocumentDetail }>(`/api/documents/${documentId}`);
  },

  renameDocument(documentId: string, title: string) {
    return apiRequest<{ document: DocumentDetail }>(`/api/documents/${documentId}/title`, {
      method: "PATCH",
      body: JSON.stringify({ title }),
    });
  },

  saveDocumentContent(
    documentId: string,
    content: {
      contentHtml: string;
      contentMarkdown: string;
      contentText: string;
      updatedAt?: string;
    },
  ) {
    return apiRequest<{ document: DocumentDetail }>(`/api/documents/${documentId}/content`, {
      method: "PUT",
      body: JSON.stringify(content),
    });
  },

  uploadDocument(file: File) {
    const formData = new FormData();
    formData.set("file", file);

    return apiRequest<{ document: DocumentDetail }>("/api/uploads/import", {
      method: "POST",
      body: formData,
    });
  },

  importIntoDocument(documentId: string, file: File) {
    const formData = new FormData();
    formData.set("file", file);

    return apiRequest<{ document: DocumentDetail }>(`/api/documents/${documentId}/import`, {
      method: "POST",
      body: formData,
    });
  },

  listShares(documentId: string) {
    return apiRequest<{ shares: DocumentShare[] }>(`/api/documents/${documentId}/shares`);
  },

  grantShare(documentId: string, input: { email: string; role: "viewer" | "editor" }) {
    return apiRequest<{ share: DocumentShare }>(`/api/documents/${documentId}/shares`, {
      method: "POST",
      body: JSON.stringify(input),
    });
  },

  updateShare(documentId: string, shareId: string, role: "viewer" | "editor") {
    return apiRequest<{ share: DocumentShare }>(`/api/documents/${documentId}/shares/${shareId}`, {
      method: "PATCH",
      body: JSON.stringify({ role }),
    });
  },

  revokeShare(documentId: string, shareId: string) {
    return apiRequest<{ deleted: true }>(`/api/documents/${documentId}/shares/${shareId}`, {
      method: "DELETE",
    });
  },
};

async function apiRequest<TData>(path: string, init: RequestInit = {}) {
  const headers = new Headers(init.headers);
  if (typeof init.body === "string" && !headers.has("content-type")) {
    headers.set("content-type", "application/json");
  }

  const response = await fetch(path, {
    ...init,
    credentials: "same-origin",
    headers,
  });

  return readApiPayload<TData>(response);
}

async function readBody(response: Response) {
  const text = await response.text();
  if (!text) {
    return {};
  }

  try {
    return JSON.parse(text) as unknown;
  } catch {
    throw new ApiClientError(response.status, "invalid_json", "API response was not valid JSON.");
  }
}
