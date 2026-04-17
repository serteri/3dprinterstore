import { redirect } from "next/navigation";

import { getOrders } from "@/app/actions/admin";
import { isAdminAuthenticated } from "@/lib/admin-session";
import OrdersDashboard from "@/components/admin/OrdersDashboard";

export default async function AdminOrdersPage() {
  const authenticated = await isAdminAuthenticated();
  if (!authenticated) {
    redirect("/admin/login");
  }

  const orders = await getOrders();

  return <OrdersDashboard initialOrders={orders} />;
}
