import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { DatabaseSync } from "node:sqlite";
import { describe, expect, test } from "vitest";

const migrationsPath = join(process.cwd(), "db", "migrations");

function createDatabase() {
  const db = new DatabaseSync(":memory:");
  db.exec("PRAGMA foreign_keys = ON;");
  for (const fileName of readdirSync(migrationsPath).filter((fileName) => fileName.endsWith(".sql")).sort()) {
    db.exec(readFileSync(join(migrationsPath, fileName), "utf8"));
  }
  return db;
}

describe("D1 schema contract", () => {
  test("schema creates reviewer-ready owned and shared documents", () => {
    const db = createDatabase();

    const sharedDocument = db
      .prepare(`
        SELECT documents.title, owners.email AS owner_email, shared_users.email AS shared_user_email, document_shares.role
        FROM document_shares
        JOIN documents ON documents.id = document_shares.document_id
        JOIN users AS owners ON owners.id = documents.owner_id
        JOIN users AS shared_users ON shared_users.id = document_shares.user_id
        WHERE owners.email = 'alice@example.com' AND shared_users.email = 'bob@example.com'
      `)
      .get() as { title: string; owner_email: string; shared_user_email: string; role: string } | undefined;

    expect(sharedDocument).toEqual({
      title: "Project Brief",
      owner_email: "alice@example.com",
      shared_user_email: "bob@example.com",
      role: "editor",
    });
  });

  test("schema rejects duplicate users, duplicate shares, invalid roles, and owner self-shares", () => {
    const db = createDatabase();

    expect(() => {
      db.exec(`
        INSERT INTO users (id, email, display_name, avatar_initials)
        VALUES ('usr_duplicate_alice', 'alice@example.com', 'Alice Duplicate', 'AD');
      `);
    }).toThrow();

    expect(() => {
      db.exec(`
        INSERT INTO document_shares (id, document_id, user_id, role)
        VALUES ('share_duplicate', 'doc_alice_project_brief', 'usr_bob', 'viewer');
      `);
    }).toThrow();

    expect(() => {
      db.exec(`
        INSERT INTO document_shares (id, document_id, user_id, role)
        VALUES ('share_invalid_role', 'doc_alice_project_brief', 'usr_reviewer', 'admin');
      `);
    }).toThrow();

    expect(() => {
      db.exec(`
        INSERT INTO document_shares (id, document_id, user_id, role)
        VALUES ('share_owner_self', 'doc_alice_project_brief', 'usr_alice', 'viewer');
      `);
    }).toThrow();
  });

  test("schema stores markdown as document source and R2 attachment metadata separately", () => {
    const db = createDatabase();

    const document = db
      .prepare("SELECT content_markdown FROM documents WHERE id = 'doc_alice_project_brief'")
      .get() as { content_markdown: string };

    db.exec(`
      INSERT INTO document_attachments (id, document_id, user_id, file_name, file_type, file_size, r2_key, content_text)
      VALUES (
        'att_project_brief_source',
        'doc_alice_project_brief',
        'usr_alice',
        'project-brief.md',
        'text/markdown',
        128,
        'documents/doc_alice_project_brief/project-brief.md',
        'Project Brief source file'
      );
    `);

    const attachment = db
      .prepare("SELECT file_name, r2_key FROM document_attachments WHERE id = 'att_project_brief_source'")
      .get() as { file_name: string; r2_key: string };

    expect({
      markdownStartsCorrectly: document.content_markdown.startsWith("# Project Brief"),
      attachment,
    }).toEqual({
      markdownStartsCorrectly: true,
      attachment: {
        file_name: "project-brief.md",
        r2_key: "documents/doc_alice_project_brief/project-brief.md",
      },
    });
  });

  test("seed documents use customer-facing copy", () => {
    const db = createDatabase();
    const rows = db
      .prepare("SELECT content_markdown, content_text FROM documents WHERE id IN ('doc_alice_project_brief', 'doc_admin_welcome')")
      .all() as Array<{ content_markdown: string; content_text: string }>;

    const visibleCopy = rows.map((row) => `${row.content_markdown} ${row.content_text}`).join(" ");

    expect({
      hasSeedDocuments: rows.length,
      hasTechnicalJargon: /verify|route|url|seeded|assessment|implementation|mvp/i.test(visibleCopy),
    }).toEqual({
      hasSeedDocuments: 2,
      hasTechnicalJargon: false,
    });
  });
});
