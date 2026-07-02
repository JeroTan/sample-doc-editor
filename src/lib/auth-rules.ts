const PASSWORD_HASH_ITERATIONS = 120_000;
const PASSWORD_HASH_BITS = 256;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/u;

type RuleResult<T> =
  | { ok: true; value: T }
  | { ok: false; code: string; message: string };

export function normalizeAuthEmail(input: unknown): RuleResult<string> {
  if (typeof input !== "string") {
    return { ok: false, code: "email_required", message: "Email is required." };
  }

  const email = input.trim().toLowerCase();
  if (!EMAIL_PATTERN.test(email) || email.length > 254) {
    return { ok: false, code: "email_invalid", message: "Enter a valid email address." };
  }

  return { ok: true, value: email };
}

export function normalizeDisplayName(input: unknown): RuleResult<string> {
  if (typeof input !== "string") {
    return { ok: false, code: "display_name_required", message: "Display name is required." };
  }

  const displayName = input.trim().replace(/\s+/g, " ");
  if (displayName.length < 2) {
    return { ok: false, code: "display_name_too_short", message: "Display name must be at least 2 characters." };
  }

  if (displayName.length > 80) {
    return { ok: false, code: "display_name_too_long", message: "Display name must be 80 characters or fewer." };
  }

  return { ok: true, value: displayName };
}

export function validatePassword(input: unknown): RuleResult<string> {
  if (typeof input !== "string") {
    return { ok: false, code: "password_required", message: "Password is required." };
  }

  if (input.length < 8) {
    return { ok: false, code: "password_too_short", message: "Password must be at least 8 characters." };
  }

  if (input.length > 128) {
    return { ok: false, code: "password_too_long", message: "Password must be 128 characters or fewer." };
  }

  return { ok: true, value: input };
}

export function initialsFromDisplayName(displayName: string) {
  const parts = displayName
    .split(/\s+/u)
    .map((part) => part.trim())
    .filter(Boolean);

  if (parts.length === 0) {
    return "U";
  }

  return parts
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

export function createPasswordSalt() {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return base64FromBytes(bytes);
}

export async function hashPassword(password: string, salt: string) {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey("raw", encoder.encode(password), "PBKDF2", false, ["deriveBits"]);
  const bits = await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      hash: "SHA-256",
      salt: encoder.encode(salt),
      iterations: PASSWORD_HASH_ITERATIONS,
    },
    key,
    PASSWORD_HASH_BITS,
  );

  return base64FromBytes(new Uint8Array(bits));
}

export function timingSafeEqual(left: string, right: string) {
  if (left.length !== right.length) {
    return false;
  }

  let diff = 0;
  for (let index = 0; index < left.length; index += 1) {
    diff |= left.charCodeAt(index) ^ right.charCodeAt(index);
  }

  return diff === 0;
}

function base64FromBytes(bytes: Uint8Array) {
  let binary = "";
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }

  return btoa(binary);
}
