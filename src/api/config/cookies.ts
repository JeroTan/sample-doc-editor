const sessionCookieName = "doc_me_in_user";

export function readSessionUserId(request: Request) {
  const cookie = request.headers.get("cookie") ?? "";
  const values = new Map(
    cookie
      .split(";")
      .map((part) => part.trim())
      .filter(Boolean)
      .map((part) => {
        const [key, ...valueParts] = part.split("=");
        return [key, decodeURIComponent(valueParts.join("="))] as const;
      }),
  );

  return values.get(sessionCookieName) ?? null;
}

export function createSessionCookie(userId: string) {
  return `${sessionCookieName}=${encodeURIComponent(userId)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=604800`;
}

export function clearSessionCookie() {
  return `${sessionCookieName}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`;
}
