/**
 * The site lives under /roadshow (set in next.config.mjs). Next.js adds that
 * prefix to its own files, but not to plain "/media/..." paths, fetch() calls
 * or next/image sources, so wrap those in withBase().
 */
export const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH || "";

export function withBase(path: string): string {
  if (!BASE_PATH || !path.startsWith("/") || path.startsWith("//")) return path;
  if (path === BASE_PATH || path.startsWith(`${BASE_PATH}/`)) return path;
  return `${BASE_PATH}${path}`;
}
