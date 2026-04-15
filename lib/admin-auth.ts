export const ADMIN_COOKIE_NAME = "pera_admin_token";

const SESSION_DURATION_MS = 24 * 60 * 60 * 1000;
const ENCRYPTION_ALGO = "AES-GCM";

function utf8ToBytes(value: string) {
  return new TextEncoder().encode(value);
}

function bytesToUtf8(value: Uint8Array) {
  return new TextDecoder().decode(value);
}

function bytesToBase64Url(bytes: Uint8Array) {
  let binary = "";
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }

  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function base64UrlToBytes(value: string) {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=");
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);

  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }

  return bytes;
}

async function getAdminAesKey() {
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!adminPassword) {
    throw new Error("ADMIN_PASSWORD is not set.");
  }

  const digest = await crypto.subtle.digest("SHA-256", utf8ToBytes(adminPassword));
  return crypto.subtle.importKey("raw", digest, { name: ENCRYPTION_ALGO, length: 256 }, false, ["encrypt", "decrypt"]);
}

export async function createAdminToken() {
  const key = await getAdminAesKey();
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const payload = {
    exp: Date.now() + SESSION_DURATION_MS,
  };

  const encrypted = await crypto.subtle.encrypt(
    { name: ENCRYPTION_ALGO, iv },
    key,
    utf8ToBytes(JSON.stringify(payload)),
  );

  const cipherBytes = new Uint8Array(encrypted);
  return `${bytesToBase64Url(iv)}.${bytesToBase64Url(cipherBytes)}`;
}

export async function isAdminTokenValid(token: string) {
  try {
    const [ivPart, cipherPart] = token.split(".");
    if (!ivPart || !cipherPart) {
      return false;
    }

    const key = await getAdminAesKey();
    const iv = base64UrlToBytes(ivPart);
    const cipher = base64UrlToBytes(cipherPart);

    const decrypted = await crypto.subtle.decrypt(
      { name: ENCRYPTION_ALGO, iv },
      key,
      cipher,
    );

    const json = bytesToUtf8(new Uint8Array(decrypted));
    const payload = JSON.parse(json) as { exp?: number };

    return typeof payload.exp === "number" && payload.exp > Date.now();
  } catch {
    return false;
  }
}
