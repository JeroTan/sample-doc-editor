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

declare module "@toast-ui/editor/viewer" {
  type ViewerOptions = {
    el: HTMLElement;
    initialValue?: string;
    usageStatistics?: boolean;
    linkAttributes?: Record<string, string>;
  };

  export default class Viewer {
    constructor(options: ViewerOptions);
    setMarkdown(markdown: string): void;
    destroy(): void;
  }
}

declare module "mammoth/mammoth.browser.js" {
  type MammothResult = {
    value: string;
    messages: Array<{ type: string; message: string }>;
  };

  export function convertToMarkdown(input: { arrayBuffer: ArrayBuffer }): Promise<MammothResult>;
  export function extractRawText(input: { arrayBuffer: ArrayBuffer }): Promise<MammothResult>;
}
