# Doc-Me-In Page Routes

## Public

- `/` > landing page with human workspace hero and customer-facing easy/fast/organized product summary.
- `/login` > login form for credential auth.
- `/register` > registration form for new reviewer/test users.

## Authenticated

- `/app` > document workspace list with no document forced open.
- `/app/docs/:id/view` > read-only document page.
- `/app/docs/:id/edit` > editable document page for owners/editors.

## Seed Credential

Seed credential is provided separately by project owner. Login UI intentionally does not prefill or display it.

## Notes

- Login redirects back to `/app` or requested `/app/...` URL.
- Viewer access is coerced to `/view` if `/edit` is requested.
- Passwords use Web Crypto PBKDF2 hashes in D1; no bcrypt.
