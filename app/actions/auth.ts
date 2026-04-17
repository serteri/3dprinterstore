"use server";

import { timingSafeEqual } from "node:crypto";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { ADMIN_COOKIE_NAME, ADMIN_SESSION_MAX_AGE_SECONDS, createAdminToken } from "@/lib/admin-auth";

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
  const inputEmail = String(formData.get("email") ?? "").trim().toLowerCase();
  const inputPassword = String(formData.get("password") ?? "").trim();
  const expectedEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const expectedPassword = process.env.ADMIN_PASSWORD;

  if (!expectedEmail || !expectedPassword) {
    return { error: "Admin authentication is not configured." };
  }

  if (!inputEmail || !inputPassword) {
    return { error: "Email and password are required." };
  }

  const emailMatches = passwordsMatch(inputEmail, expectedEmail);
  const passwordMatches = passwordsMatch(inputPassword, expectedPassword);

  if (!emailMatches || !passwordMatches) {
    return { error: "Invalid credentials. Please try again." };
  }

  const token = await createAdminToken();
  const cookieStore = await cookies();

  cookieStore.set({
    name: ADMIN_COOKIE_NAME,
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: ADMIN_SESSION_MAX_AGE_SECONDS,
    path: "/",
  });

  redirect("/admin/products");
}

export async function logoutAdmin() {
  const cookieStore = await cookies();

  cookieStore.delete(ADMIN_COOKIE_NAME);
  redirect("/admin/login");
}
