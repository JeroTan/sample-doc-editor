import Editor from "@toast-ui/editor";
import "@toast-ui/editor/dist/toastui-editor.css";
import { useEffect, useRef } from "react";

type ToastEditorChange = {
  html: string;
  markdown: string;
};

type ToastEditorProps = {
  initialValue?: string;
  height?: string;
  onChange?: (value: ToastEditorChange) => void;
};

export function ToastEditor({ initialValue = "", height = "640px", onChange }: ToastEditorProps) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const editorRef = useRef<Editor | null>(null);

  useEffect(() => {
    if (!rootRef.current) {
      return;
    }

    const editor = new Editor({
      el: rootRef.current,
      height,
      initialEditType: "wysiwyg",
      initialValue,
      previewStyle: "vertical",
      usageStatistics: false,
    });

    editorRef.current = editor;
    editor.on("change", () => {
      onChange?.({
        html: editor.getHTML(),
        markdown: editor.getMarkdown(),
      });
    });

    return () => {
      editor.destroy();
      editorRef.current = null;
    };
  }, [height, initialValue, onChange]);

  return <div ref={rootRef} className="min-h-[420px] w-full" />;
}
