declare module "@toast-ui/editor" {
  type EditorOptions = {
    el: HTMLElement;
    height?: string;
    initialEditType?: "markdown" | "wysiwyg";
    initialValue?: string;
    previewStyle?: "tab" | "vertical";
    toolbarItems?: Array<string | string[]>;
    usageStatistics?: boolean;
  };

  export default class Editor {
    constructor(options: EditorOptions);
    on(eventName: "change", handler: () => void): void;
    enable(): void;
    disable(): void;
    getHTML(): string;
    getMarkdown(): string;
    destroy(): void;
  }
}
