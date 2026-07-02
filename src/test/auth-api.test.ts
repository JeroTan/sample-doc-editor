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

function createEnv() {
  return {
    DB: new SqliteD1Database(),
    STORAGE: {},
  } as unknown as Env;
}

async function requestJson<T>(env: Env, path: string, init: RequestInit = {}) {
  const response = await handleApiRequest(new Request(`https://doc-me-in.test${path}`, init), env);
  const body = (await response.json()) as T;
  return { response, body };
}

describe("credential auth API", () => {
  test("seeded admin can login and receive current profile", async () => {
    const env = createEnv();
    const login = await requestJson<{ data: { user: { email: string } } }>(env, "/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email: "admin@mail.com", password: "admin-ako-123" }),
    });

    const cookie = login.response.headers.get("set-cookie") ?? "";
    const me = await requestJson<{ data: { user: { email: string } } }>(env, "/api/me", {
      headers: { cookie },
    });

    expect({
      loginStatus: login.response.status,
      loginEmail: login.body.data.user.email,
      cookie: cookie.includes("doc_me_in_user=usr_admin"),
      meStatus: me.response.status,
      meEmail: me.body.data.user.email,
    }).toEqual({
      loginStatus: 200,
      loginEmail: "admin@mail.com",
      cookie: true,
      meStatus: 200,
      meEmail: "admin@mail.com",
    });
  });

  test("wrong password is rejected", async () => {
    const env = createEnv();
    const login = await requestJson<{ error: { code: string } }>(env, "/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email: "admin@mail.com", password: "wrong-password" }),
    });

    expect({ status: login.response.status, code: login.body.error.code }).toEqual({
      status: 401,
      code: "invalid_credentials",
    });
  });

  test("secondary reviewer credential can login", async () => {
    const env = createEnv();
    const login = await requestJson<{ data: { user: { email: string; displayName: string } } }>(env, "/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email: "robert@mail.com", password: "12345678" }),
    });

    const cookie = login.response.headers.get("set-cookie") ?? "";

    expect({
      loginStatus: login.response.status,
      loginEmail: login.body.data.user.email,
      displayName: login.body.data.user.displayName,
      cookie: cookie.includes("doc_me_in_user=usr_robert"),
    }).toEqual({
      loginStatus: 200,
      loginEmail: "robert@mail.com",
      displayName: "Robert Reviewer",
      cookie: true,
    });
  });

  test("new user can register and duplicate email conflicts", async () => {
    const env = createEnv();
    const register = await requestJson<{ data: { user: { email: string; displayName: string } } }>(env, "/api/auth/register", {
      method: "POST",
      body: JSON.stringify({
        displayName: "Mina Santos",
        email: "mina@example.com",
        password: "mina-password-123",
      }),
    });
    const duplicate = await requestJson<{ error: { code: string } }>(env, "/api/auth/register", {
      method: "POST",
      body: JSON.stringify({
        displayName: "Mina Again",
        email: "MINA@example.com",
        password: "mina-password-123",
      }),
    });

    expect({
      status: register.response.status,
      email: register.body.data.user.email,
      displayName: register.body.data.user.displayName,
      duplicateStatus: duplicate.response.status,
      duplicateCode: duplicate.body.error.code,
    }).toEqual({
      status: 201,
      email: "mina@example.com",
      displayName: "Mina Santos",
      duplicateStatus: 409,
      duplicateCode: "email_already_registered",
    });
  });
});
