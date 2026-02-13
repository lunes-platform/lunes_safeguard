export function getSiteUrl() {
  const url = import.meta?.env?.VITE_SITE_URL as string | undefined;
  return (url && url.replace(/\/$/, '')) || 'http://localhost:3000';
}

export function absUrl(path: string) {
  const base = getSiteUrl();
  if (!path) return base;
  const p = path.startsWith('/') ? path : `/${path}`;
  return `${base}${p}`;
}
