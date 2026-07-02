import type { DocumentDetail } from "../../../api/types";
import { ToastViewer } from "./ToastViewer";

type DocumentPreviewProps = {
  document: DocumentDetail;
};

export function DocumentPreview({ document }: DocumentPreviewProps) {
  const markdown = document.contentMarkdown || document.contentText || "";

  if (!markdown.trim()) {
    return (
      <div className="flex min-h-[280px] items-center justify-center rounded-lg border border-dashed border-outline-variant bg-surface px-5 text-sm text-on-surface-variant">
        Empty document
      </div>
    );
  }

  return (
    <article className="document-preview min-h-[calc(100vh-248px)] overflow-y-auto rounded-lg border border-outline-variant bg-surface-container-lowest px-5 py-6 text-on-surface md:px-10 md:py-8">
      <ToastViewer markdown={markdown} />
    </article>
  );
}
