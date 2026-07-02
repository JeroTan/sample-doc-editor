DROP TRIGGER IF EXISTS set_documents_updated_at;

CREATE TRIGGER IF NOT EXISTS set_documents_updated_at
AFTER UPDATE OF title, content_html, content_markdown, content_text ON documents
FOR EACH ROW
WHEN NEW.updated_at = OLD.updated_at
BEGIN
  UPDATE documents SET updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now') WHERE id = NEW.id;
END;
