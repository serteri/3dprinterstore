import "server-only";

import { cookies } from "next/headers";

import { ADMIN_COOKIE_NAME, isAdminTokenValid } from "@/lib/admin-auth";

export async function isAdminAuthenticated() {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_COOKIE_NAME)?.value;

  if (!token) {
    return false;
  }

  return isAdminTokenValid(token);
}

export async function requireAdminSession() {
  const authenticated = await isAdminAuthenticated();

  if (!authenticated) {
    throw new Error("Unauthorized");
  }
}
