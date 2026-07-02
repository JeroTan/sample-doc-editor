import "@toast-ui/editor/dist/toastui-editor.css";
import { useEffect, useRef } from "react";

type EditorInstance = import("@toast-ui/editor").default;

type ToastEditorChange = {
  html: string;
  markdown: string;
};

type ToastEditorProps = {
  initialValue?: string;
  height?: string;
  readOnly?: boolean;
  onChange?: (value: ToastEditorChange) => void;
};

export function ToastEditor({ initialValue = "", height = "640px", readOnly = false, onChange }: ToastEditorProps) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const editorRef = useRef<EditorInstance | null>(null);
  const onChangeRef = useRef(onChange);

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  useEffect(() => {
    if (!rootRef.current) {
      return;
    }

    let destroyed = false;
    let editor: EditorInstance | null = null;

    void import("@toast-ui/editor").then(({ default: Editor }) => {
      if (destroyed || !rootRef.current) {
        return;
      }

      editor = new Editor({
        el: rootRef.current,
        height,
        initialEditType: "wysiwyg",
        initialValue,
        previewStyle: "vertical",
        toolbarItems: [
          ["heading", "bold", "italic", "strike"],
          ["hr", "quote"],
          ["ul", "ol"],
          ["table", "link"],
        ],
        usageStatistics: false,
      });

      editorRef.current = editor;
      if (readOnly) {
        editor.disable();
      }

      editor.on("change", () => {
        if (!editor) {
          return;
        }

        onChangeRef.current?.({
          html: editor.getHTML(),
          markdown: editor.getMarkdown(),
        });
      });
    });

    return () => {
      destroyed = true;
      editor?.destroy();
      editorRef.current = null;
    };
  }, [height, initialValue]);

  useEffect(() => {
    if (!editorRef.current) {
      return;
    }

    if (readOnly) {
      editorRef.current.disable();
      return;
    }

    editorRef.current.enable();
  }, [readOnly]);

  return <div ref={rootRef} className="doc-me-in-editor min-h-[420px] w-full" />;
}
