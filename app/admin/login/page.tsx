import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import AdminLoginForm from "@/components/admin/AdminLoginForm";
import { ADMIN_COOKIE_NAME, isAdminTokenValid } from "@/lib/admin-auth";

export default async function AdminLoginPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_COOKIE_NAME)?.value;

  if (token && (await isAdminTokenValid(token))) {
    redirect("/admin/products");
  }

  return (
    <section className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#090B10] px-4 py-16 sm:px-6">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(14,165,183,0.20),transparent_40%),radial-gradient(circle_at_80%_10%,rgba(197,141,52,0.16),transparent_40%),linear-gradient(180deg,rgba(255,255,255,0.04)_1px,transparent_1px)] [background-size:100%_100%,100%_100%,36px_36px]" />
      <div className="relative w-full max-w-md">
        <AdminLoginForm />
      </div>
    </section>
  );
}
