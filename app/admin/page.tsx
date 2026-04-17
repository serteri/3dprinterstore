import { redirect } from "next/navigation";

import { isAdminAuthenticated } from "@/lib/admin-session";

export default async function AdminIndexPage() {
  const authenticated = await isAdminAuthenticated();

  if (!authenticated) {
    redirect("/admin/login");
  }

  redirect("/admin/products");
}
