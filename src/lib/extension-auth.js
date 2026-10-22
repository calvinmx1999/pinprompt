// Exact matches only. Add a development callback here when its extension ID is known.
export const EXTENSION_REDIRECT_ALLOWLIST = Object.freeze([
  "https://jchjipehcgipjchkgcdaejhdebeniieg.chromiumapp.org/auth",
]);

export function extensionRedirect(search) {
  const params = new URLSearchParams(search);
  const values = params.getAll("redirect_uri");
  return values.length === 1 && EXTENSION_REDIRECT_ALLOWLIST.includes(values[0]) ? values[0] : null;
}
