import type { DocumentDetail, DocumentShare, DocumentSummary } from "@/api/types";
import { Button } from "@/components/ui/button";
import { validateImportFile } from "@/lib/document-rules";
import {
  AlertCircle,
  ChevronLeft,
  Eye,
  FileText,
  LoaderCircle,
  LogOut,
  Pencil,
  Plus,
  Save,
  Search,
  Share2,
  Trash2,
  Upload,
  UserRound,
  X,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState, type ChangeEvent } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { ApiClientError, documentApi, type DocumentBuckets, type SessionProfile } from "./api-client";
import { DocumentPreview } from "./components/DocumentPreview";
import { ToastEditor } from "./components/ToastEditor";
import {
  canEditDocument,
  canShareDocument,
  displayDocumentTitle,
  formatUpdatedAt,
  getFriendlyError,
  isSessionExpiredError,
  splitDocumentSections,
} from "./ui-state";

const SELECTED_DOCUMENT_KEY = "doc-me-in:selected-document";
const EMPTY_BUCKETS: DocumentBuckets = { owned: [], shared: [] };

type UploadMode = "new" | "replace";
type MobileView = "list" | "editor";
type PageMode = "view" | "edit";

type DocMeInAppProps = {
  initialDocumentId?: string;
  initialMode?: PageMode;
};

type EditorDraft = {
  html: string;
  markdown: string;
  text: string;
};

export default function DocMeInApp({ initialDocumentId, initialMode = "edit" }: DocMeInAppProps) {
  const [profile, setProfile] = useState<SessionProfile | null>(null);
  const [documents, setDocuments] = useState<DocumentBuckets>(EMPTY_BUCKETS);
  const [selectedDocument, setSelectedDocument] = useState<DocumentDetail | null>(null);
  const [titleDraft, setTitleDraft] = useState("");
  const [editorDraft, setEditorDraft] = useState<EditorDraft>({ html: "", markdown: "", text: "" });
  const [query, setQuery] = useState("");
  const [bootLoading, setBootLoading] = useState(true);
  const [documentsLoading, setDocumentsLoading] = useState(false);
  const [documentLoading, setDocumentLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [pageMode, setPageMode] = useState<PageMode>(initialMode);
  const [mobileView, setMobileView] = useState<MobileView>("list");
  const [shellError, setShellError] = useState<string | null>(null);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [uploadMode, setUploadMode] = useState<UploadMode>("new");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [shareEmail, setShareEmail] = useState("");
  const [shareRole, setShareRole] = useState<"viewer" | "editor">("editor");
  const [shares, setShares] = useState<DocumentShare[]>([]);
  const [sharesLoading, setSharesLoading] = useState(false);
  const [sharing, setSharing] = useState(false);

  const dirtyRef = useRef(dirty);
  const selectedDocumentRef = useRef(selectedDocument);

  useEffect(() => {
    dirtyRef.current = dirty;
  }, [dirty]);

  useEffect(() => {
    selectedDocumentRef.current = selectedDocument;
  }, [selectedDocument]);

  const handleInteractionError = useCallback((error: unknown) => {
    if (isSessionExpiredError(error)) {
      window.location.assign(`/login?redirect=${encodeURIComponent(getCurrentAppPath())}`);
      return true;
    }

    toast.error(getFriendlyError(error));
    return false;
  }, []);

  const applySelectedDocument = useCallback((document: DocumentDetail, mode: PageMode, navigate = true) => {
    const title = displayDocumentTitle(document.title);
    const resolvedMode = mode === "edit" && !canEditDocument(document) ? "view" : mode;
    setSelectedDocument(document);
    setTitleDraft(title);
    setEditorDraft({
      html: document.contentHtml ?? "",
      markdown: document.contentMarkdown ?? "",
      text: document.contentText ?? "",
    });
    setPageMode(resolvedMode);
    setDirty(false);
    setMobileView("editor");
    localStorage.setItem(SELECTED_DOCUMENT_KEY, document.id);
    if (navigate) {
      navigateToDocument(document.id, resolvedMode);
    } else if (window.location.pathname.startsWith("/app/docs/")) {
      replaceDocumentUrl(document.id, resolvedMode);
    }
  }, []);

  const refreshDocuments = useCallback(async () => {
    setDocumentsLoading(true);
    try {
      const nextDocuments = await documentApi.listDocuments();
      setDocuments(nextDocuments);
      return nextDocuments;
    } finally {
      setDocumentsLoading(false);
    }
  }, []);

  const openDocument = useCallback(
    async (documentId: string, options: { force?: boolean; mode?: PageMode; navigate?: boolean } = {}) => {
      if (dirtyRef.current && !options.force && !window.confirm("Discard unsaved changes?")) {
        return;
      }

      setDocumentLoading(true);
      try {
        const { document } = await documentApi.getDocument(documentId);
        const nextMode = options.mode ?? (canEditDocument(document) ? "edit" : "view");
        applySelectedDocument(document, nextMode, options.navigate ?? true);
      } catch (error) {
        handleInteractionError(error);
      } finally {
        setDocumentLoading(false);
      }
    },
    [applySelectedDocument, handleInteractionError],
  );

  useEffect(() => {
    let active = true;

    async function boot() {
      try {
        const currentProfile = await documentApi.getMe();
        if (!active) {
          return;
        }

        setProfile(currentProfile);
        await refreshDocuments();

        if (initialDocumentId) {
          await openDocument(initialDocumentId, { force: true, mode: initialMode, navigate: false });
        }
      } catch (error) {
        if (error instanceof ApiClientError && error.status === 401) {
          window.location.assign(`/login?redirect=${encodeURIComponent(getCurrentAppPath())}`);
          return;
        }

        setShellError(getFriendlyError(error));
      } finally {
        if (active) {
          setBootLoading(false);
        }
      }
    }

    boot();

    return () => {
      active = false;
    };
  }, [initialDocumentId, initialMode, openDocument, refreshDocuments]);

  useEffect(() => {
    function handlePopState() {
      const route = readCurrentDocumentRoute();
      if (!route) {
        setSelectedDocument(null);
        setMobileView("list");
        setDirty(false);
        return;
      }

      void openDocument(route.documentId, { force: true, mode: route.mode, navigate: false });
    }

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [openDocument]);

  const filteredDocuments = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    const allDocuments = [...documents.owned, ...documents.shared];
    const visibleDocuments = normalizedQuery
      ? allDocuments.filter((document) =>
          [document.title, document.ownerName, document.ownerEmail].some((value) =>
            value.toLowerCase().includes(normalizedQuery),
          ),
        )
      : allDocuments;

    return splitDocumentSections(visibleDocuments);
  }, [documents, query]);

  const editable = canEditDocument(selectedDocument);
  const editorActive = editable && pageMode === "edit";
  const shareable = canShareDocument(selectedDocument);

  async function logout() {
    if (dirtyRef.current && !window.confirm("Discard unsaved changes?")) {
      return;
    }

    try {
      await documentApi.logout();
      setProfile(null);
      setDocuments(EMPTY_BUCKETS);
      setSelectedDocument(null);
      setDirty(false);
      setMobileView("list");
      localStorage.removeItem(SELECTED_DOCUMENT_KEY);
      window.location.assign("/login");
    } catch (error) {
      handleInteractionError(error);
    }
  }

  async function createDocument() {
    setDocumentLoading(true);
    try {
      const { document } = await documentApi.createDocument();
      await refreshDocuments();
      applySelectedDocument(document, "edit");
      toast.success("Document created.");
    } catch (error) {
      handleInteractionError(error);
    } finally {
      setDocumentLoading(false);
    }
  }

  async function saveDocument() {
    if (!selectedDocument || !editorActive) {
      return;
    }

    const titleChanged = titleDraft.trim() !== displayDocumentTitle(selectedDocument.title);
    const contentChanged =
      editorDraft.markdown !== (selectedDocument.contentMarkdown ?? "") ||
      editorDraft.html !== (selectedDocument.contentHtml ?? "");

    if (!titleChanged && !contentChanged) {
      setDirty(false);
      return;
    }

    setSaving(true);
    try {
      let nextDocument = selectedDocument;

      if (contentChanged) {
        nextDocument = (
          await documentApi.saveDocumentContent(selectedDocument.id, {
            contentHtml: editorDraft.html,
            contentMarkdown: editorDraft.markdown,
            contentText: editorDraft.text,
            updatedAt: selectedDocument.updatedAt,
          })
        ).document;
      }

      if (titleChanged) {
        nextDocument = (await documentApi.renameDocument(selectedDocument.id, titleDraft)).document;
      }

      applySelectedDocument(nextDocument, pageMode);
      await refreshDocuments();
      toast.success("Saved.");
    } catch (error) {
      handleInteractionError(error);
    } finally {
      setSaving(false);
    }
  }

  function updateTitle(value: string) {
    setTitleDraft(value);
    if (editorActive) {
      setDirty(true);
    }
  }

  function changeMode(nextMode: PageMode) {
    if (!selectedDocument) {
      return;
    }

    if (nextMode === "view" && dirtyRef.current && !window.confirm("Discard unsaved changes?")) {
      return;
    }

    const resolvedMode = nextMode === "edit" && !canEditDocument(selectedDocument) ? "view" : nextMode;
    if (resolvedMode === "view") {
      setTitleDraft(displayDocumentTitle(selectedDocument.title));
      setEditorDraft({
        html: selectedDocument.contentHtml ?? "",
        markdown: selectedDocument.contentMarkdown ?? "",
        text: selectedDocument.contentText ?? "",
      });
    }
    setPageMode(resolvedMode);
    setDirty(false);
    navigateToDocument(selectedDocument.id, resolvedMode);
  }

  const handleEditorChange = useCallback((value: { html: string; markdown: string }) => {
    const activeDocument = selectedDocumentRef.current;
    if (!canEditDocument(activeDocument) || pageMode !== "edit") {
      return;
    }

    setEditorDraft({
      html: value.html,
      markdown: value.markdown,
      text: getContentText(value.html, value.markdown),
    });
    setDirty(true);
  }, [pageMode]);

  function openUploadDialog(mode: UploadMode) {
    setUploadMode(mode);
    setSelectedFile(null);
    setUploadError(null);
    setUploadOpen(true);
  }

  function selectUploadFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] ?? null;
    setSelectedFile(file);

    if (!file) {
      setUploadError(null);
      return;
    }

    const validation = validateImportFile(file);
    setUploadError(validation.ok ? null : validation.message);
  }

  async function submitUpload() {
    if (!selectedFile) {
      setUploadError("Choose a .txt or .md file.");
      return;
    }

    const validation = validateImportFile(selectedFile);
    if (!validation.ok) {
      setUploadError(validation.message);
      return;
    }

    setUploading(true);
    try {
      const { document } =
        uploadMode === "replace" && selectedDocument && editorActive
          ? await documentApi.importIntoDocument(selectedDocument.id, selectedFile)
          : await documentApi.uploadDocument(selectedFile);

      setUploadOpen(false);
      await refreshDocuments();
      applySelectedDocument(document, "edit");
      toast.success(uploadMode === "replace" ? "Imported into document." : "Imported document.");
    } catch (error) {
      if (!handleInteractionError(error)) {
        setUploadError(getFriendlyError(error));
      }
    } finally {
      setUploading(false);
    }
  }

  async function openShareDialog() {
    if (!selectedDocument || !shareable) {
      return;
    }

    setShareOpen(true);
    setShareEmail("");
    setShareRole("editor");
    await loadShares(selectedDocument.id);
  }

  async function loadShares(documentId: string) {
    setSharesLoading(true);
    try {
      const result = await documentApi.listShares(documentId);
      setShares(result.shares);
    } catch (error) {
      handleInteractionError(error);
    } finally {
      setSharesLoading(false);
    }
  }

  async function submitShare() {
    if (!selectedDocument) {
      return;
    }

    setSharing(true);
    try {
      await documentApi.grantShare(selectedDocument.id, { email: shareEmail, role: shareRole });
      setShareEmail("");
      await loadShares(selectedDocument.id);
      await refreshDocuments();
      toast.success("Shared.");
    } catch (error) {
      handleInteractionError(error);
    } finally {
      setSharing(false);
    }
  }

  async function updateShareRole(share: DocumentShare, role: "viewer" | "editor") {
    if (!selectedDocument) {
      return;
    }

    try {
      await documentApi.updateShare(selectedDocument.id, share.id, role);
      await loadShares(selectedDocument.id);
      toast.success("Share updated.");
    } catch (error) {
      handleInteractionError(error);
    }
  }

  async function revokeShare(share: DocumentShare) {
    if (!selectedDocument || !window.confirm(`Remove ${share.userEmail}?`)) {
      return;
    }

    try {
      await documentApi.revokeShare(selectedDocument.id, share.id);
      await loadShares(selectedDocument.id);
      await refreshDocuments();
      toast.success("Share removed.");
    } catch (error) {
      handleInteractionError(error);
    }
  }

  if (bootLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background px-5 text-on-surface">
        <LoaderCircle className="h-6 w-6 animate-spin text-primary-strong" aria-hidden="true" />
        <span className="ml-3 text-sm font-semibold">Loading Doc-Me-In</span>
      </main>
    );
  }

  if (!profile) {
    return (
      <main className="min-h-screen bg-background px-5 py-6 text-on-surface">
        <ToastContainer position="bottom-right" hideProgressBar newestOnTop />
        <section className="mx-auto flex min-h-[calc(100vh-48px)] w-full max-w-xl flex-col justify-center gap-5">
          <div>
            <p className="text-xs font-semibold uppercase text-on-surface-variant">Authentication required</p>
            <h1 className="mt-2 text-3xl font-bold leading-10 text-on-surface md:text-[32px]">Doc-Me-In</h1>
            <p className="mt-2 text-sm text-on-surface-variant">Sign in to open your document workspace.</p>
          </div>
          {shellError ? (
            <div className="flex items-start gap-2 rounded-lg border border-error bg-red-50 px-4 py-3 text-sm text-error">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
              <span>{shellError}</span>
            </div>
          ) : null}
          <div className="flex flex-wrap gap-2">
            <Button type="button" asChild>
              <a href={`/login?redirect=${encodeURIComponent(getCurrentAppPath())}`}>Login</a>
            </Button>
            <Button type="button" variant="secondary" asChild>
              <a href="/register">Register</a>
            </Button>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background text-on-surface">
      <ToastContainer position="bottom-right" hideProgressBar newestOnTop />
      <div className="flex min-h-screen flex-col">
        <header className="flex min-h-16 items-center justify-between gap-3 border-b border-outline-variant bg-surface-container-lowest px-4 py-3 md:px-6">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase text-on-surface-variant">Doc-Me-In</p>
            <h1 className="truncate text-xl font-bold leading-7 text-on-surface">Workspace</h1>
          </div>
          <div className="flex min-w-0 items-center gap-2">
            <div className="hidden min-w-0 items-center gap-2 rounded-lg border border-outline-variant bg-surface px-3 py-2 text-sm text-on-surface-variant sm:flex">
              <UserRound className="h-4 w-4" aria-hidden="true" />
              <span className="max-w-44 truncate font-semibold text-on-surface">{profile.user.email}</span>
            </div>
            <Button type="button" variant="ghost" size="icon" title="Logout" aria-label="Logout" onClick={logout}>
              <LogOut className="h-4 w-4" aria-hidden="true" />
            </Button>
          </div>
        </header>

        {shellError ? (
          <div className="border-b border-error bg-red-50 px-4 py-2 text-sm font-medium text-error">{shellError}</div>
        ) : null}

        <div className="grid flex-1 overflow-hidden md:grid-cols-[340px_minmax(0,1fr)]">
          <aside
            className={`${mobileView === "editor" ? "hidden" : "flex"} min-h-0 flex-col border-r border-outline-variant bg-surface-container-low px-3 py-4 md:flex`}
          >
            <div className="flex items-center gap-2">
              <Button type="button" onClick={createDocument} className="flex-1" disabled={documentLoading}>
                <Plus className="h-4 w-4" aria-hidden="true" />
                New
              </Button>
              <Button
                type="button"
                variant="secondary"
                size="icon"
                title="Import file"
                aria-label="Import file"
                onClick={() => openUploadDialog("new")}
              >
                <Upload className="h-4 w-4" aria-hidden="true" />
              </Button>
            </div>

            <div className="relative mt-3">
              <label className="sr-only" htmlFor="document-search">
                Search documents
              </label>
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-on-surface-variant" />
              <input
                id="document-search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search documents"
                className="h-10 w-full rounded-lg border border-outline-variant bg-surface-container-lowest pl-9 pr-3 text-sm text-on-surface outline-none focus:border-primary-strong focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <div className="mt-4 min-h-0 flex-1 overflow-y-auto pr-1">
              {documentsLoading ? (
                <LoadingRows />
              ) : (
                <>
                  <DocumentSection
                    title="Owned by me"
                    documents={filteredDocuments.owned}
                    emptyText={query ? "No owned matches" : "No owned documents"}
                    selectedDocumentId={selectedDocument?.id}
                    onOpen={openDocument}
                  />
                  <DocumentSection
                    title="Shared with me"
                    documents={filteredDocuments.shared}
                    emptyText={query ? "No shared matches" : "No shared documents"}
                    selectedDocumentId={selectedDocument?.id}
                    onOpen={openDocument}
                  />
                </>
              )}
            </div>
          </aside>

          <section
            className={`${mobileView === "list" ? "hidden" : "flex"} min-h-0 flex-col bg-surface-container-lowest md:flex`}
          >
            {documentLoading ? (
              <div className="flex flex-1 items-center justify-center">
                <LoaderCircle className="h-6 w-6 animate-spin text-primary-strong" aria-hidden="true" />
              </div>
            ) : selectedDocument ? (
              <div className="flex min-h-0 flex-1 flex-col">
                <div className="border-b border-outline-variant px-4 py-3 md:px-6">
                  <div className="mb-3 flex items-center justify-between gap-2 md:hidden">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setMobileView("list");
                        window.history.pushState({}, "", "/app");
                      }}
                    >
                      <ChevronLeft className="h-4 w-4" aria-hidden="true" />
                      Docs
                    </Button>
                    <div className="flex items-center gap-2">
                      <ModeBadge mode={pageMode} />
                      <RoleBadge role={selectedDocument.accessRole} />
                    </div>
                  </div>

                  <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                    <div className="min-w-0 flex-1">
                      <label className="sr-only" htmlFor="document-title">
                        Document title
                      </label>
                      {editorActive ? (
                        <input
                          id="document-title"
                          value={titleDraft}
                          onChange={(event) => updateTitle(event.target.value)}
                          className="w-full min-w-0 rounded-lg border border-transparent bg-transparent px-0 py-1 text-2xl font-bold leading-8 text-on-surface outline-none focus:border-primary-strong focus:bg-surface focus:px-3 focus:ring-2 focus:ring-primary/20"
                        />
                      ) : (
                        <h2 id="document-title" className="truncate py-1 text-2xl font-bold leading-8 text-on-surface">
                          {titleDraft}
                        </h2>
                      )}
                      <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-on-surface-variant">
                        <span>{selectedDocument.ownerName}</span>
                        <span aria-hidden="true">/</span>
                        <span>{formatUpdatedAt(selectedDocument.updatedAt)}</span>
                        <span aria-hidden="true">/</span>
                        <span className={dirty ? "font-semibold text-primary" : ""}>{dirty ? "Unsaved" : "Saved"}</span>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <div className="hidden md:block">
                        <RoleBadge role={selectedDocument.accessRole} />
                      </div>
                      <div className="hidden md:block">
                        <ModeBadge mode={pageMode} />
                      </div>
                      {editable ? (
                        <Button type="button" variant="secondary" onClick={() => changeMode(pageMode === "edit" ? "view" : "edit")}>
                          {pageMode === "edit" ? (
                            <Eye className="h-4 w-4" aria-hidden="true" />
                          ) : (
                            <Pencil className="h-4 w-4" aria-hidden="true" />
                          )}
                          {pageMode === "edit" ? "View" : "Edit"}
                        </Button>
                      ) : null}
                      {editorActive ? (
                        <Button
                          type="button"
                          variant="secondary"
                          size="icon"
                          title="Import into document"
                          aria-label="Import into document"
                          onClick={() => openUploadDialog("replace")}
                        >
                          <Upload className="h-4 w-4" aria-hidden="true" />
                        </Button>
                      ) : null}
                      {shareable ? (
                        <Button type="button" variant="secondary" onClick={openShareDialog}>
                          <Share2 className="h-4 w-4" aria-hidden="true" />
                          Share
                        </Button>
                      ) : null}
                      {editorActive ? (
                        <Button type="button" onClick={saveDocument} disabled={!dirty || saving}>
                          {saving ? (
                            <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" />
                          ) : (
                            <Save className="h-4 w-4" aria-hidden="true" />
                          )}
                          Save
                        </Button>
                      ) : null}
                    </div>
                  </div>
                </div>

                <div className="min-h-0 flex-1 overflow-hidden px-4 py-4 md:px-6">
                  {editorActive ? (
                    <ToastEditor
                      key={selectedDocument.id}
                      initialValue={selectedDocument.contentMarkdown ?? ""}
                      height="calc(100vh - 248px)"
                      onChange={handleEditorChange}
                    />
                  ) : (
                    <DocumentPreview document={selectedDocument} />
                  )}
                </div>
              </div>
            ) : (
              <div className="flex flex-1 items-center justify-center px-5">
                <div className="max-w-sm text-center">
                  <FileText className="mx-auto h-10 w-10 text-primary-strong" aria-hidden="true" />
                  <h2 className="mt-3 text-lg font-semibold text-on-surface">No document selected</h2>
                  <div className="mt-4 flex justify-center gap-2">
                    <Button type="button" onClick={createDocument}>
                      <Plus className="h-4 w-4" aria-hidden="true" />
                      New
                    </Button>
                    <Button type="button" variant="secondary" onClick={() => openUploadDialog("new")}>
                      <Upload className="h-4 w-4" aria-hidden="true" />
                      Import
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </section>
        </div>
      </div>

      {mobileView === "list" ? (
        <Button
          type="button"
          title="New document"
          aria-label="New document"
          onClick={createDocument}
          className="fixed bottom-5 right-5 h-14 w-14 rounded-full shadow-[0_4px_16px_rgba(0,0,0,0.16)] md:hidden"
        >
          <Plus className="h-6 w-6" aria-hidden="true" />
        </Button>
      ) : null}

      {uploadOpen ? (
        <UploadDialog
          mode={uploadMode}
          canReplace={Boolean(selectedDocument && editorActive)}
          file={selectedFile}
          error={uploadError}
          uploading={uploading}
          onClose={() => setUploadOpen(false)}
          onModeChange={setUploadMode}
          onFileChange={selectUploadFile}
          onSubmit={submitUpload}
        />
      ) : null}

      {shareOpen && selectedDocument ? (
        <ShareDialog
          documentTitle={displayDocumentTitle(selectedDocument.title)}
          shares={shares}
          email={shareEmail}
          role={shareRole}
          loading={sharesLoading}
          submitting={sharing}
          onClose={() => setShareOpen(false)}
          onEmailChange={setShareEmail}
          onRoleChange={setShareRole}
          onSubmit={submitShare}
          onUpdateRole={updateShareRole}
          onRevoke={revokeShare}
        />
      ) : null}
    </main>
  );
}

function DocumentSection({
  title,
  documents,
  emptyText,
  selectedDocumentId,
  onOpen,
}: {
  title: string;
  documents: DocumentSummary[];
  emptyText: string;
  selectedDocumentId?: string;
  onOpen: (documentId: string) => void;
}) {
  return (
    <section className="mb-5">
      <h2 className="mb-2 px-1 text-xs font-semibold uppercase text-on-surface-variant">{title}</h2>
      {documents.length === 0 ? (
        <p className="rounded-lg border border-dashed border-outline-variant px-3 py-4 text-sm text-on-surface-variant">
          {emptyText}
        </p>
      ) : (
        <div className="overflow-hidden rounded-lg border border-outline-variant bg-surface-container-lowest">
          {documents.map((document) => (
            <button
              key={document.id}
              type="button"
              onClick={() => onOpen(document.id)}
              aria-pressed={selectedDocumentId === document.id}
              className={`flex w-full min-w-0 items-start gap-3 border-b border-outline-variant px-3 py-3 text-left last:border-b-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                selectedDocumentId === document.id ? "bg-soft-amber" : "bg-surface-container-lowest hover:bg-surface"
              }`}
            >
              <FileText className="mt-0.5 h-4 w-4 shrink-0 text-primary-strong" aria-hidden="true" />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-semibold text-on-surface">{displayDocumentTitle(document.title)}</span>
                <span className="mt-1 flex min-w-0 flex-wrap items-center gap-1 text-xs text-on-surface-variant">
                  <span className="truncate">{document.ownerName}</span>
                  <span aria-hidden="true">/</span>
                  <span>{formatUpdatedAt(document.updatedAt)}</span>
                </span>
              </span>
              <RoleBadge role={document.accessRole} compact />
            </button>
          ))}
        </div>
      )}
    </section>
  );
}

function LoadingRows() {
  return (
    <div className="space-y-2">
      {Array.from({ length: 6 }).map((_, index) => (
        <div key={index} className="h-16 animate-pulse rounded-lg bg-surface-container-high" />
      ))}
    </div>
  );
}

function RoleBadge({ role, compact = false }: { role: DocumentSummary["accessRole"]; compact?: boolean }) {
  const label = role === "owner" ? "Owner" : role === "editor" ? "Editor" : "Viewer";

  return (
    <span
      className={`inline-flex shrink-0 items-center rounded-full border border-outline-variant bg-surface px-2 font-semibold text-primary ${
        compact ? "h-6 text-[11px]" : "h-7 text-xs"
      }`}
    >
      {label}
    </span>
  );
}

function ModeBadge({ mode }: { mode: PageMode }) {
  return (
    <span className="inline-flex h-7 shrink-0 items-center rounded-full border border-outline-variant bg-soft-amber px-2 text-xs font-semibold text-on-surface">
      {mode === "edit" ? "Edit" : "View"}
    </span>
  );
}

function UploadDialog({
  mode,
  canReplace,
  file,
  error,
  uploading,
  onClose,
  onModeChange,
  onFileChange,
  onSubmit,
}: {
  mode: UploadMode;
  canReplace: boolean;
  file: File | null;
  error: string | null;
  uploading: boolean;
  onClose: () => void;
  onModeChange: (mode: UploadMode) => void;
  onFileChange: (event: ChangeEvent<HTMLInputElement>) => void;
  onSubmit: () => void;
}) {
  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/35 px-4" role="presentation">
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="upload-title"
        className="w-full max-w-md rounded-lg border border-outline-variant bg-surface-container-lowest p-4 shadow-[0_4px_16px_rgba(0,0,0,0.16)]"
      >
        <div className="flex items-center justify-between gap-3">
          <h2 id="upload-title" className="text-lg font-semibold text-on-surface">
            Import
          </h2>
          <Button type="button" variant="ghost" size="icon" title="Close" aria-label="Close" onClick={onClose}>
            <X className="h-4 w-4" aria-hidden="true" />
          </Button>
        </div>

        {canReplace ? (
          <div className="mt-4 grid grid-cols-2 rounded-lg border border-outline-variant bg-surface p-1">
            {(["new", "replace"] as const).map((nextMode) => (
              <button
                key={nextMode}
                type="button"
                onClick={() => onModeChange(nextMode)}
                className={`h-9 rounded-md text-sm font-semibold ${
                  mode === nextMode ? "bg-primary-strong text-on-primary" : "text-on-surface-variant hover:bg-surface-container"
                }`}
              >
                {nextMode === "new" ? "New document" : "Replace current"}
              </button>
            ))}
          </div>
        ) : null}

        <div className="mt-4">
          <label className="mb-2 block text-xs font-semibold uppercase text-on-surface-variant" htmlFor="file-import">
            File
          </label>
          <input
            id="file-import"
            type="file"
            accept=".txt,.md,text/plain,text/markdown"
            onChange={onFileChange}
            className="w-full rounded-lg border border-outline-variant bg-surface px-3 py-2 text-sm text-on-surface file:mr-3 file:rounded-full file:border-0 file:bg-primary-strong file:px-3 file:py-1.5 file:text-sm file:font-semibold file:text-on-primary"
          />
          <p className="mt-2 text-xs text-on-surface-variant">.txt or .md, 1 MB max</p>
        </div>

        {file ? (
          <div className="mt-4 rounded-lg border border-outline-variant bg-surface px-3 py-2 text-sm text-on-surface">
            <span className="block truncate font-semibold">{file.name}</span>
            <span className="text-xs text-on-surface-variant">{formatBytes(file.size)}</span>
          </div>
        ) : null}

        {error ? <p className="mt-3 text-sm font-medium text-error">{error}</p> : null}

        <div className="mt-5 flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="button" onClick={onSubmit} disabled={uploading}>
            {uploading ? <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Upload className="h-4 w-4" aria-hidden="true" />}
            Import
          </Button>
        </div>
      </section>
    </div>
  );
}

function ShareDialog({
  documentTitle,
  shares,
  email,
  role,
  loading,
  submitting,
  onClose,
  onEmailChange,
  onRoleChange,
  onSubmit,
  onUpdateRole,
  onRevoke,
}: {
  documentTitle: string;
  shares: DocumentShare[];
  email: string;
  role: "viewer" | "editor";
  loading: boolean;
  submitting: boolean;
  onClose: () => void;
  onEmailChange: (email: string) => void;
  onRoleChange: (role: "viewer" | "editor") => void;
  onSubmit: () => void;
  onUpdateRole: (share: DocumentShare, role: "viewer" | "editor") => void;
  onRevoke: (share: DocumentShare) => void;
}) {
  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/35 px-4" role="presentation">
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="share-title"
        className="w-full max-w-lg rounded-lg border border-outline-variant bg-surface-container-lowest p-4 shadow-[0_4px_16px_rgba(0,0,0,0.16)]"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 id="share-title" className="text-lg font-semibold text-on-surface">
              Share
            </h2>
            <p className="truncate text-sm text-on-surface-variant">{documentTitle}</p>
          </div>
          <Button type="button" variant="ghost" size="icon" title="Close" aria-label="Close" onClick={onClose}>
            <X className="h-4 w-4" aria-hidden="true" />
          </Button>
        </div>

        <div className="mt-4 grid gap-2 sm:grid-cols-[1fr_130px_auto]">
          <div>
            <label className="sr-only" htmlFor="share-email">
              Email
            </label>
            <input
              id="share-email"
              value={email}
              onChange={(event) => onEmailChange(event.target.value)}
              placeholder="name@example.com"
              className="h-10 w-full rounded-lg border border-outline-variant bg-surface px-3 text-sm outline-none focus:border-primary-strong focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <label className="sr-only" htmlFor="share-role">
            Role
          </label>
          <select
            id="share-role"
            value={role}
            onChange={(event) => onRoleChange(event.target.value as "viewer" | "editor")}
            className="h-10 rounded-lg border border-outline-variant bg-surface px-3 text-sm font-semibold outline-none focus:border-primary-strong focus:ring-2 focus:ring-primary/20"
          >
            <option value="editor">Editor</option>
            <option value="viewer">Viewer</option>
          </select>
          <Button type="button" onClick={onSubmit} disabled={submitting}>
            {submitting ? <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Share2 className="h-4 w-4" aria-hidden="true" />}
            Add
          </Button>
        </div>

        <div className="mt-5 max-h-72 overflow-y-auto rounded-lg border border-outline-variant">
          {loading ? (
            <div className="flex h-20 items-center justify-center">
              <LoaderCircle className="h-5 w-5 animate-spin text-primary-strong" aria-hidden="true" />
            </div>
          ) : shares.length === 0 ? (
            <p className="px-3 py-4 text-sm text-on-surface-variant">No shared users</p>
          ) : (
            shares.map((share) => (
              <div
                key={share.id}
                className="grid grid-cols-[1fr_112px_40px] items-center gap-2 border-b border-outline-variant px-3 py-3 last:border-b-0"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-on-surface">{share.userName}</p>
                  <p className="truncate text-xs text-on-surface-variant">{share.userEmail}</p>
                </div>
                <select
                  value={share.role}
                  onChange={(event) => onUpdateRole(share, event.target.value as "viewer" | "editor")}
                  className="h-9 rounded-lg border border-outline-variant bg-surface px-2 text-sm font-semibold outline-none focus:border-primary-strong focus:ring-2 focus:ring-primary/20"
                >
                  <option value="editor">Editor</option>
                  <option value="viewer">Viewer</option>
                </select>
                <Button type="button" variant="ghost" size="icon" title="Remove share" aria-label="Remove share" onClick={() => onRevoke(share)}>
                  <Trash2 className="h-4 w-4 text-error" aria-hidden="true" />
                </Button>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}

function getContentText(html: string, markdown: string) {
  const element = window.document.createElement("div");
  element.innerHTML = html;
  return element.textContent?.trim() || markdown.replace(/\s+/g, " ").trim();
}

function formatBytes(value: number) {
  if (value < 1024) {
    return `${value} B`;
  }

  if (value < 1024 * 1024) {
    return `${(value / 1024).toFixed(1)} KB`;
  }

  return `${(value / 1024 / 1024).toFixed(1)} MB`;
}

function navigateToDocument(documentId: string, mode: PageMode) {
  const nextPath = `/app/docs/${encodeURIComponent(documentId)}/${mode}`;
  if (window.location.pathname !== nextPath) {
    window.history.pushState({}, "", nextPath);
  }
}

function replaceDocumentUrl(documentId: string, mode: PageMode) {
  const nextPath = `/app/docs/${encodeURIComponent(documentId)}/${mode}`;
  if (window.location.pathname !== nextPath) {
    window.history.replaceState({}, "", nextPath);
  }
}

function getCurrentAppPath() {
  return `${window.location.pathname}${window.location.search}`;
}

function readCurrentDocumentRoute() {
  const match = window.location.pathname.match(/^\/app\/docs\/([^/]+)\/(view|edit)$/u);
  if (!match) {
    return null;
  }

  return {
    documentId: decodeURIComponent(match[1]),
    mode: match[2] as PageMode,
  };
}
