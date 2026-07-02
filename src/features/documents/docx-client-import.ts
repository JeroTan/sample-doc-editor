type MammothResult = {
  value: string;
};

type MammothBrowserModule = {
  convertToMarkdown(input: { arrayBuffer: ArrayBuffer }): Promise<MammothResult>;
  extractRawText(input: { arrayBuffer: ArrayBuffer }): Promise<MammothResult>;
};

export function isDocxUpload(file: File) {
  return file.name.trim().toLowerCase().endsWith(".docx");
}

export async function convertDocxToMarkdownFile(file: File) {
  const mammoth = await loadMammoth();
  const arrayBuffer = await file.arrayBuffer();
  const markdown = await mammoth.convertToMarkdown({ arrayBuffer });
  const fallbackText = markdown.value.trim() ? null : await mammoth.extractRawText({ arrayBuffer });
  const content = markdown.value.trim() ? markdown.value : fallbackText?.value.trim() ? fallbackText.value : "";

  if (!content.trim()) {
    throw new Error("Word document has no readable text to import.");
  }

  return new File([content], `${stripDocxExtension(file.name)}.md`, { type: "text/markdown" });
}

async function loadMammoth() {
  try {
    const module = (await import("mammoth/mammoth.browser.js")) as unknown as MammothBrowserModule & {
      default?: MammothBrowserModule;
    };

    return module.default ?? module;
  } catch (error) {
    throw new Error("Word converter failed to load. Restart the dev server and try the import again.", { cause: error });
  }
}

function stripDocxExtension(fileName: string) {
  return fileName.trim().replace(/\.docx$/iu, "") || "word-document";
}
