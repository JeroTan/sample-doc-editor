import { existsSync } from "node:fs";
import { mkdir, rm } from "node:fs/promises";
import { join, resolve } from "node:path";

import { chromium } from "@playwright/test";

const baseUrl = process.env.DOCMEIN_BASE_URL ?? "https://doc-me-in.jerowe-tan99.workers.dev";
const adminEmail = process.env.DOCMEIN_EMAIL ?? "admin@mail.com";
const adminPassword = process.env.DOCMEIN_PASSWORD ?? "admin-ako-123";
const reviewerEmail = process.env.DOCMEIN_REVIEWER_EMAIL ?? "robert@mail.com";
const reviewerPassword = process.env.DOCMEIN_REVIEWER_PASSWORD ?? "12345678";

const outputDir = resolve("output");
const videoPath = join(outputDir, "doc-me-in-user-journey.webm");
const docxFixture = resolve("node_modules", "mammoth", "test", "test-data", "single-paragraph.docx");
const journeyTitle = `Journey ${new Date().toISOString().replace(/[-:.TZ]/g, "").slice(0, 14)}`;

if (!existsSync(docxFixture)) {
  throw new Error(`Missing DOCX fixture: ${docxFixture}`);
}

await mkdir(outputDir, { recursive: true });
await rm(videoPath, { force: true });

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({
  viewport: { width: 1440, height: 980 },
  recordVideo: {
    dir: outputDir,
    size: { width: 1440, height: 980 },
  },
});
const page = await context.newPage();
const finalVideo = page.video();

try {
  page.setDefaultTimeout(30_000);

  await login(page, adminEmail, adminPassword);
  await page.getByLabel("Import file").click();
  await page.locator("#file-import").setInputFiles(docxFixture);
  await page.locator('[role="dialog"]').getByRole("button", { name: "Import" }).click();
  await page.getByText("Imported document.").waitFor({ state: "visible" });
  await page.locator("#document-title").fill(journeyTitle);
  await page.getByRole("button", { name: "Save", exact: true }).click();
  await page.getByText("Saved.").waitFor({ state: "visible" });

  await page.getByRole("button", { name: "Share" }).click();
  await page.locator("#share-email").fill(reviewerEmail);
  await page.locator("#share-role").selectOption("viewer");
  await page.getByRole("button", { name: "Add" }).click();
  await page.getByText("Shared.").waitFor({ state: "visible" });
  await page.locator('[role="dialog"]').getByRole("button", { name: "Close" }).click();

  await page.getByRole("button", { name: "View", exact: true }).click();
  await page.getByRole("button", { name: "Edit", exact: true }).waitFor({ state: "visible" });
  await page.waitForTimeout(900);

  await page.getByRole("button", { name: "Logout" }).click();
  await page.waitForURL(/\/login/u);
  await login(page, reviewerEmail, reviewerPassword);
  await page.getByText(journeyTitle).first().click();
  await page.getByRole("button", { name: "Edit", exact: true }).waitFor({ state: "hidden", timeout: 10_000 }).catch(() => {});
  await page.waitForTimeout(900);

  await page.getByRole("button", { name: "Logout" }).click();
  await page.waitForURL(/\/login/u);
  await login(page, adminEmail, adminPassword);
  await page.getByText(journeyTitle).first().click();
  page.once("dialog", (dialog) => dialog.accept());
  const deleteResponsePromise = page.waitForResponse(
    (response) => response.request().method() === "DELETE" && response.url().includes("/api/documents/"),
  );
  await page.getByLabel("Delete document").click();
  const deleteResponse = await deleteResponsePromise;
  if (!deleteResponse.ok()) {
    throw new Error(`Delete failed with ${deleteResponse.status()}: ${await deleteResponse.text()}`);
  }
  await page.getByRole("heading", { name: "No document selected" }).waitFor({ state: "visible" });
  await page.waitForTimeout(900);
} finally {
  const saveVideo = finalVideo?.saveAs(videoPath);
  await context.close();
  await saveVideo;
  await browser.close();
}

console.log(`Saved user journey video: ${videoPath}`);

async function login(page, email, password) {
  await page.goto(`${baseUrl}/login`, { waitUntil: "load" });
  await page.waitForLoadState("networkidle", { timeout: 10_000 }).catch(() => {});
  await page.locator("#email").waitFor({ state: "visible" });
  await page.waitForTimeout(300);
  await page.locator("#email").fill(email);
  await page.locator("#password").fill(password);
  await page.getByRole("button", { name: "Login" }).click();
  await page.waitForURL(/\/app/u, { timeout: 30_000 });
  await page.getByRole("heading", { name: "Workspace" }).waitFor({ state: "visible" });
}
