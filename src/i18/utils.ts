export function getLangFromUrl(url: URL) {
  const [, lang] = url.pathname.split("/");
  return lang || "en";
}
