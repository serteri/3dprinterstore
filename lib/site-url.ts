const DEFAULT_SITE_URL = "https://www.peradynamics.com";

function normalizeUrl(url: string) {
  return url.replace(/\/+$/, "");
}

export function getSiteUrl() {
  const configured = process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL;

  if (configured && configured.trim()) {
    return normalizeUrl(configured.trim());
  }

  return DEFAULT_SITE_URL;
}
