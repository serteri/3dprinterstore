"use server";

import { timingSafeEqual } from "node:crypto";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { ADMIN_COOKIE_NAME, createAdminToken } from "@/lib/admin-auth";

export type AdminLoginState = {
  error: string | null;
};

function passwordsMatch(inputPassword: string, expectedPassword: string) {
  const inputBuffer = Buffer.from(inputPassword);
  const expectedBuffer = Buffer.from(expectedPassword);

  if (inputBuffer.length !== expectedBuffer.length) {
    return false;
  }

  return timingSafeEqual(inputBuffer, expectedBuffer);
}

export async function loginAdmin(
  _prevState: AdminLoginState,
  formData: FormData,
): Promise<AdminLoginState> {
  const inputPassword = String(formData.get("password") ?? "").trim();
  const expectedPassword = process.env.ADMIN_PASSWORD;

  if (!expectedPassword) {
    return { error: "Admin authentication is not configured." };
  }

  if (!inputPassword || !passwordsMatch(inputPassword, expectedPassword)) {
    return { error: "Invalid password. Please try again." };
  }

  const token = await createAdminToken();
  const cookieStore = await cookies();

  cookieStore.set({
    name: ADMIN_COOKIE_NAME,
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 24 * 60 * 60,
    path: "/",
  });

  redirect("/admin/products");
}

export async function logoutAdmin() {
  const cookieStore = await cookies();

  cookieStore.delete(ADMIN_COOKIE_NAME);
  redirect("/admin/login");
}
