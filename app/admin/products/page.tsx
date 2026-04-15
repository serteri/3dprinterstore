import { redirect } from "next/navigation";

import { getCategories, getProducts } from "@/app/actions/admin";
import { isAdminAuthenticated } from "@/lib/admin-session";
import ProductsDashboard from "@/components/admin/ProductsDashboard";

export default async function AdminProductsPage() {
  const authenticated = await isAdminAuthenticated();
  if (!authenticated) {
    redirect("/admin/login");
  }

  const [categories, products] = await Promise.all([getCategories(), getProducts()]);

  return <ProductsDashboard initialCategories={categories} initialProducts={products} />;
}
