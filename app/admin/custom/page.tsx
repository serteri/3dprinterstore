import { redirect } from "next/navigation";

import { getCustomInquiries } from "@/app/actions/admin";
import { isAdminAuthenticated } from "@/lib/admin-session";
import CustomInquiriesDashboard from "@/components/admin/CustomInquiriesDashboard";

export default async function AdminCustomInquiriesPage() {
  const authenticated = await isAdminAuthenticated();
  if (!authenticated) {
    redirect("/admin/login");
  }

  const inquiries = await getCustomInquiries();

  return <CustomInquiriesDashboard initialInquiries={inquiries} />;
}
