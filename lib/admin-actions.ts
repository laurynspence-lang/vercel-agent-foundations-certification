"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ADMIN_COOKIE_NAME, ADMIN_PASSWORD } from "./admin-auth";

const COOKIE_MAX_AGE = 60 * 60 * 24; // 1 day

export async function loginAction(formData: FormData): Promise<void> {
  const password = formData.get("password");
  if (typeof password !== "string" || password !== ADMIN_PASSWORD) {
    redirect("/admin/login?error=1");
  }
  const store = await cookies();
  store.set(ADMIN_COOKIE_NAME, ADMIN_PASSWORD, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: COOKIE_MAX_AGE,
    // Site-wide so the browser also sends it to /api/admin/* (the admin chat),
    // which proxy.ts now protects.
    path: "/",
  });
  redirect("/admin");
}

export async function logoutAction(): Promise<void> {
  const store = await cookies();
  // Clear both the current site-wide cookie and any older /admin-only one.
  store.delete({ name: ADMIN_COOKIE_NAME, path: "/" });
  store.delete({ name: ADMIN_COOKIE_NAME, path: "/admin" });
  redirect("/admin/login");
}
