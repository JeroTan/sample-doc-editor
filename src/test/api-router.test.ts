import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { DatabaseSync, type StatementSync } from "node:sqlite";
import { describe, expect, test } from "vitest";

import { handleApiRequest } from "../api/routes/router";

class SqliteD1Database {
  private readonly db: DatabaseSync;

  constructor() {
    this.db = new DatabaseSync(":memory:");
    this.db.exec("PRAGMA foreign_keys = ON;");
    const migrationsPath = join(process.cwd(), "db", "migrations");
    for (const fileName of readdirSync(migrationsPath).filter((fileName) => fileName.endsWith(".sql")).sort()) {
      this.db.exec(readFileSync(join(migrationsPath, fileName), "utf8"));
    }
  }

  prepare(query: string) {
    return new SqliteD1Statement(this.db.prepare(query));
  }
}

class SqliteD1Statement {
  private params: any[] = [];

  constructor(private readonly statement: StatementSync) {}

  bind(...params: unknown[]) {
    this.params = params;
    return this;
  }

  async first<T = Record<string, unknown>>() {
    return (this.statement.get(...this.params) as T | undefined) ?? null;
  }

  async all<T = Record<string, unknown>>() {
    return {
      success: true,
      results: this.statement.all(...this.params) as T[],
    };
  }

  async run() {
    this.statement.run(...this.params);
    return { success: true };
  }
}

class MemoryR2Bucket {
  readonly objects = new Map<string, Blob | string | ArrayBuffer | ArrayBufferView>();

  async put(key: string, value: Blob | string | ArrayBuffer | ArrayBufferView) {
    this.objects.set(key, value);
    return { key };
  }

  async delete(key: string) {
    this.objects.delete(key);
  }
}

function createEnv() {
  return {
    DB: new SqliteD1Database(),
    STORAGE: new MemoryR2Bucket(),
  } as unknown as Env & { STORAGE: MemoryR2Bucket };
}

async function requestJson<T>(env: Env, path: string, init: RequestInit = {}) {
  const response = await handleApiRequest(new Request(`https://doc-me-in.test${path}`, init), env);
  const body = (await response.json()) as T;
  return { response, body };
}

describe("API router", () => {
  test("seeded user can start session and read current profile", async () => {
    const env = createEnv();
    const login = await requestJson<{ data: { user: { email: string } } }>(env, "/api/session", {
      method: "POST",
      body: JSON.stringify({ email: "alice@example.com" }),
    });

    const cookie = login.response.headers.get("set-cookie") ?? "";
    const me = await requestJson<{ data: { user: { email: string }; counts: { owned: number; shared: number } } }>(
      env,
      "/api/me",
      { headers: { cookie } },
    );

    expect({
      loginStatus: login.response.status,
      loggedInEmail: login.body.data.user.email,
      meStatus: me.response.status,
      meEmail: me.body.data.user.email,
      counts: me.body.data.counts,
    }).toEqual({
      loginStatus: 200,
      loggedInEmail: "alice@example.com",
      meStatus: 200,
      meEmail: "alice@example.com",
      counts: { owned: 1, shared: 0 },
    });
  });

  test("document list separates owned and shared documents", async () => {
    const env = createEnv();
    const result = await requestJson<{
      data: {
        owned: Array<{ title: string; accessRole: string }>;
        shared: Array<{ title: string; ownerEmail: string; accessRole: string }>;
      };
    }>(env, "/api/documents", { headers: { "x-user-email": "bob@example.com" } });

    expect({
      status: result.response.status,
      owned: result.body.data.owned.map((doc) => [doc.title, doc.accessRole]),
      shared: result.body.data.shared.map((doc) => [doc.title, doc.ownerEmail, doc.accessRole]),
    }).toEqual({
      status: 200,
      owned: [["Bob Notes", "owner"]],
      shared: [["Project Brief", "alice@example.com", "editor"]],
    });
  });

  test("owner can create, rename, save, reopen, and delete document", async () => {
    const env = createEnv();
    const create = await requestJson<{ data: { document: { id: string; title: string } } }>(env, "/api/documents", {
      method: "POST",
      headers: { "x-user-email": "alice@example.com" },
      body: JSON.stringify({ title: "   " }),
    });

    const id = create.body.data.document.id;
    const rename = await requestJson<{ data: { document: { title: string } } }>(env, `/api/documents/${id}/title`, {
      method: "PATCH",
      headers: { "x-user-email": "alice@example.com" },
      body: JSON.stringify({ title: "  Sprint Notes  " }),
    });
    const save = await requestJson<{ data: { document: { contentMarkdown: string } } }>(
      env,
      `/api/documents/${id}/content`,
      {
        method: "PUT",
        headers: { "x-user-email": "alice@example.com" },
        body: JSON.stringify({ contentMarkdown: "## Plan", contentHtml: "<h2>Plan</h2>", contentText: "Plan" }),
      },
    );
    const detail = await requestJson<{ data: { document: { title: string; contentMarkdown: string } } }>(
      env,
      `/api/documents/${id}`,
      { headers: { "x-user-email": "alice@example.com" } },
    );
    const deleted = await requestJson<{ data: { deleted: true } }>(env, `/api/documents/${id}`, {
      method: "DELETE",
      headers: { "x-user-email": "alice@example.com" },
    });

    expect({
      createdTitle: create.body.data.document.title,
      renamedTitle: rename.body.data.document.title,
      savedMarkdown: save.body.data.document.contentMarkdown,
      reopened: {
        title: detail.body.data.document.title,
        contentMarkdown: detail.body.data.document.contentMarkdown,
      },
      deleteStatus: deleted.response.status,
      deleted: deleted.body.data.deleted,
    }).toEqual({
      createdTitle: "Untitled document",
      renamedTitle: "Sprint Notes",
      savedMarkdown: "## Plan",
      reopened: { title: "Sprint Notes", contentMarkdown: "## Plan" },
      deleteStatus: 200,
      deleted: true,
    });
  });

  test("private documents reject unauthorized readers and invalid update payloads", async () => {
    const env = createEnv();
    const privateRead = await requestJson<{ error: { code: string } }>(env, "/api/documents/doc_alice_project_brief", {
      headers: { "x-user-email": "reviewer@example.com" },
    });
    const invalidTitle = await requestJson<{ error: { code: string } }>(
      env,
      "/api/documents/doc_alice_project_brief/title",
      {
        method: "PATCH",
        headers: { "x-user-email": "alice@example.com" },
        body: JSON.stringify({ title: "Bad\nTitle" }),
      },
    );
    const staleSave = await requestJson<{ error: { code: string } }>(
      env,
      "/api/documents/doc_alice_project_brief/content",
      {
        method: "PUT",
        headers: { "x-user-email": "alice@example.com" },
        body: JSON.stringify({ updatedAt: "1999-01-01T00:00:00.000Z", contentMarkdown: "stale" }),
      },
    );

    expect({
      privateRead: { status: privateRead.response.status, code: privateRead.body.error.code },
      invalidTitle: { status: invalidTitle.response.status, code: invalidTitle.body.error.code },
      staleSave: { status: staleSave.response.status, code: staleSave.body.error.code },
    }).toEqual({
      privateRead: { status: 403, code: "forbidden" },
      invalidTitle: { status: 400, code: "title_control_character" },
      staleSave: { status: 409, code: "document_stale" },
    });
  });

  test("owner can grant, update, list, and revoke shares", async () => {
    const env = createEnv();
    const grant = await requestJson<{ data: { share: { id: string; role: string; userEmail: string } } }>(
      env,
      "/api/documents/doc_alice_project_brief/shares",
      {
        method: "POST",
        headers: { "x-user-email": "alice@example.com" },
        body: JSON.stringify({ email: "reviewer@example.com", role: "viewer" }),
      },
    );

    const shareId = grant.body.data.share.id;
    const update = await requestJson<{ data: { share: { role: string } } }>(
      env,
      `/api/documents/doc_alice_project_brief/shares/${shareId}`,
      {
        method: "PATCH",
        headers: { "x-user-email": "alice@example.com" },
        body: JSON.stringify({ role: "editor" }),
      },
    );
    const list = await requestJson<{ data: { shares: Array<{ userEmail: string; role: string }> } }>(
      env,
      "/api/documents/doc_alice_project_brief/shares",
      { headers: { "x-user-email": "alice@example.com" } },
    );
    const revoke = await requestJson<{ data: { deleted: true } }>(
      env,
      `/api/documents/doc_alice_project_brief/shares/${shareId}`,
      { method: "DELETE", headers: { "x-user-email": "alice@example.com" } },
    );
    const duplicate = await requestJson<{ error: { code: string } }>(
      env,
      "/api/documents/doc_alice_project_brief/shares",
      {
        method: "POST",
        headers: { "x-user-email": "alice@example.com" },
        body: JSON.stringify({ email: "bob@example.com", role: "viewer" }),
      },
    );

    expect({
      grant: {
        id: grant.body.data.share.id,
        role: grant.body.data.share.role,
        userEmail: grant.body.data.share.userEmail,
      },
      updatedRole: update.body.data.share.role,
      listedReviewer: list.body.data.shares
        .map((share) => ({ userEmail: share.userEmail, role: share.role }))
        .find((share) => share.userEmail === "reviewer@example.com"),
      revoked: revoke.body.data.deleted,
      duplicate: { status: duplicate.response.status, code: duplicate.body.error.code },
    }).toEqual({
      grant: { id: shareId, role: "viewer", userEmail: "reviewer@example.com" },
      updatedRole: "editor",
      listedReviewer: { userEmail: "reviewer@example.com", role: "editor" },
      revoked: true,
      duplicate: { status: 409, code: "share_already_exists" },
    });
  });

  test("upload import creates editable markdown document, metadata, and R2 attachment", async () => {
    const env = createEnv();
    const formData = new FormData();
    formData.set("file", new File(["# Imported\n\n- one"], "imported.md", { type: "text/markdown" }));

    const upload = await requestJson<{ data: { document: { id: string; title: string; contentMarkdown: string } } }>(
      env,
      "/api/uploads/import",
      {
        method: "POST",
        headers: { "x-user-email": "alice@example.com" },
        body: formData,
      },
    );

    const id = upload.body.data.document.id;
    const detail = await requestJson<{ data: { document: { title: string; contentMarkdown: string } } }>(
      env,
      `/api/documents/${id}`,
      { headers: { "x-user-email": "alice@example.com" } },
    );

    expect({
      status: upload.response.status,
      title: detail.body.data.document.title,
      markdown: detail.body.data.document.contentMarkdown,
      r2ObjectCount: env.STORAGE.objects.size,
    }).toEqual({
      status: 201,
      title: "imported",
      markdown: "# Imported\n\n- one",
      r2ObjectCount: 1,
    });
  });

  test("upload import can replace content in existing editable draft", async () => {
    const env = createEnv();
    const formData = new FormData();
    formData.set("file", new File(["Draft replacement"], "draft.txt", { type: "text/plain" }));

    const upload = await requestJson<{ data: { document: { title: string; contentMarkdown: string } } }>(
      env,
      "/api/documents/doc_bob_notes/import",
      {
        method: "POST",
        headers: { "x-user-email": "bob@example.com" },
        body: formData,
      },
    );

    expect({
      status: upload.response.status,
      title: upload.body.data.document.title,
      markdown: upload.body.data.document.contentMarkdown,
      r2ObjectCount: env.STORAGE.objects.size,
    }).toEqual({
      status: 200,
      title: "Bob Notes",
      markdown: "Draft replacement",
      r2ObjectCount: 1,
    });
  });

  test("reviewer journey can login, create, save, upload, share, and reopen shared work", async () => {
    const env = createEnv();
    const adminLogin = await requestJson<{ data: { user: { email: string } } }>(env, "/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email: "admin@mail.com", password: "admin-ako-123" }),
    });
    const adminCookie = adminLogin.response.headers.get("set-cookie") ?? "";

    const created = await requestJson<{ data: { document: { id: string; title: string } } }>(env, "/api/documents", {
      method: "POST",
      headers: { cookie: adminCookie },
      body: JSON.stringify({ title: "Customer Plan" }),
    });
    const documentId = created.body.data.document.id;

    const saved = await requestJson<{ data: { document: { contentMarkdown: string } } }>(
      env,
      `/api/documents/${documentId}/content`,
      {
        method: "PUT",
        headers: { cookie: adminCookie },
        body: JSON.stringify({
          contentMarkdown: "## Launch Plan\n\n- Invite team",
          contentHtml: "<h2>Launch Plan</h2><ul><li>Invite team</li></ul>",
          contentText: "Launch Plan Invite team",
        }),
      },
    );

    const uploadForm = new FormData();
    uploadForm.set("file", new File(["# Imported checklist"], "checklist.md", { type: "text/markdown" }));
    const uploaded = await requestJson<{ data: { document: { title: string; contentMarkdown: string } } }>(
      env,
      "/api/uploads/import",
      { method: "POST", headers: { cookie: adminCookie }, body: uploadForm },
    );

    const share = await requestJson<{ data: { share: { role: string; userEmail: string } } }>(
      env,
      `/api/documents/${documentId}/shares`,
      {
        method: "POST",
        headers: { cookie: adminCookie },
        body: JSON.stringify({ email: "bob@example.com", role: "viewer" }),
      },
    );

    const bobSession = await requestJson<{ data: { user: { email: string } } }>(env, "/api/session", {
      method: "POST",
      body: JSON.stringify({ email: "bob@example.com" }),
    });
    const bobCookie = bobSession.response.headers.get("set-cookie") ?? "";
    const bobList = await requestJson<{ data: { shared: Array<{ id: string; title: string; accessRole: string }> } }>(
      env,
      "/api/documents",
      { headers: { cookie: bobCookie } },
    );
    const bobDetail = await requestJson<{ data: { document: { title: string; accessRole: string; contentMarkdown: string } } }>(
      env,
      `/api/documents/${documentId}`,
      { headers: { cookie: bobCookie } },
    );
    const bobSave = await requestJson<{ error: { code: string } }>(env, `/api/documents/${documentId}/content`, {
      method: "PUT",
      headers: { cookie: bobCookie },
      body: JSON.stringify({ contentMarkdown: "viewer edit attempt" }),
    });

    expect({
      adminLogin: { status: adminLogin.response.status, email: adminLogin.body.data.user.email },
      created: { status: created.response.status, title: created.body.data.document.title },
      savedMarkdown: saved.body.data.document.contentMarkdown,
      uploaded: {
        status: uploaded.response.status,
        title: uploaded.body.data.document.title,
        markdown: uploaded.body.data.document.contentMarkdown,
      },
      share: { status: share.response.status, userEmail: share.body.data.share.userEmail, role: share.body.data.share.role },
      bobSession: { status: bobSession.response.status, email: bobSession.body.data.user.email },
      bobSharedDocument: bobList.body.data.shared
        .map((document) => [document.id, document.title, document.accessRole])
        .find((document) => document[0] === documentId),
      bobDetail: {
        title: bobDetail.body.data.document.title,
        accessRole: bobDetail.body.data.document.accessRole,
        contentMarkdown: bobDetail.body.data.document.contentMarkdown,
      },
      bobSave: { status: bobSave.response.status, code: bobSave.body.error.code },
      r2ObjectCount: env.STORAGE.objects.size,
    }).toEqual({
      adminLogin: { status: 200, email: "admin@mail.com" },
      created: { status: 201, title: "Customer Plan" },
      savedMarkdown: "## Launch Plan\n\n- Invite team",
      uploaded: { status: 201, title: "checklist", markdown: "# Imported checklist" },
      share: { status: 201, userEmail: "bob@example.com", role: "viewer" },
      bobSession: { status: 200, email: "bob@example.com" },
      bobSharedDocument: [documentId, "Customer Plan", "viewer"],
      bobDetail: {
        title: "Customer Plan",
        accessRole: "viewer",
        contentMarkdown: "## Launch Plan\n\n- Invite team",
      },
      bobSave: { status: 403, code: "forbidden" },
      r2ObjectCount: 1,
    });
  });
});
