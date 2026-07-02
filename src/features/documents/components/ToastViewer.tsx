import "@toast-ui/editor/dist/toastui-editor-viewer.css";
import { useEffect, useRef } from "react";

type ViewerInstance = import("@toast-ui/editor/viewer").default;

type ToastViewerProps = {
  markdown: string;
};

export function ToastViewer({ markdown }: ToastViewerProps) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const viewerRef = useRef<ViewerInstance | null>(null);

  useEffect(() => {
    if (!rootRef.current) {
      return;
    }

    let destroyed = false;
    let viewer: ViewerInstance | null = null;

    void import("@toast-ui/editor/viewer").then(({ default: Viewer }) => {
      if (destroyed || !rootRef.current) {
        return;
      }

      viewer = new Viewer({
        el: rootRef.current,
        initialValue: markdown,
        usageStatistics: false,
        linkAttributes: {
          target: "_blank",
          rel: "noreferrer",
        },
      });
      viewerRef.current = viewer;
    });

    return () => {
      destroyed = true;
      viewer?.destroy();
      viewerRef.current = null;
    };
  }, []);

  useEffect(() => {
    viewerRef.current?.setMarkdown(markdown);
  }, [markdown]);

  return <div ref={rootRef} className="doc-me-in-viewer min-h-[280px] w-full" />;
}
