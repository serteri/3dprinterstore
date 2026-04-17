"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { Plus, Trash2, Pencil, X, Loader2, Boxes, LogOut } from "lucide-react";

import {
  createCategory,
  createProduct,
  deleteProduct,
  getProducts,
  updateProductInventory,
  updateProduct,
} from "@/app/actions/admin";
import { logoutAdmin } from "@/app/actions/auth";
import ImageUpload from "@/components/ui/ImageUpload";

type Category = {
  id: string;
  name: string;
};

type Product = {
  id: string;
  title: string;
  description: string;
  price: number;
  inventory: number;
  categoryId: string;
  category: {
    id: string;
    name: string;
  };
  images: string[];
  createdAt: string;
};

type ProductFormState = {
  title: string;
  description: string;
  price: string;
  inventory: string;
  categoryId: string;
  images: string[];
};

type ProductsDashboardProps = {
  initialCategories: Category[];
  initialProducts: Product[];
};

type ToastState = {
  kind: "success" | "error";
  message: string;
} | null;

const emptyForm: ProductFormState = {
  title: "",
  description: "",
  price: "",
  inventory: "0",
  categoryId: "",
  images: [],
};

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value);
}

export default function ProductsDashboard({
  initialCategories,
  initialProducts,
}: ProductsDashboardProps) {
  const [categories, setCategories] = useState(initialCategories);
  const [products, setProducts] = useState(initialProducts);
  const [selectedCategoryId, setSelectedCategoryId] = useState("all");
  const [formOpen, setFormOpen] = useState(false);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [formState, setFormState] = useState<ProductFormState>(() => ({
    ...emptyForm,
    categoryId: initialCategories[0]?.id ?? "",
  }));
  const [newCategoryName, setNewCategoryName] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [toast, setToast] = useState<ToastState>(null);
  const [pendingAction, setPendingAction] = useState<"save" | "delete" | "refresh" | "category" | null>(null);
  const [inlineInventory, setInlineInventory] = useState<Record<string, string>>({});
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    setInlineInventory(
      Object.fromEntries(initialProducts.map((product) => [product.id, String(product.inventory)])),
    );
  }, [initialProducts]);

  useEffect(() => {
    setInlineInventory((prev) => {
      const next = { ...prev };
      for (const product of products) {
        if (typeof next[product.id] !== "string") {
          next[product.id] = String(product.inventory);
        }
      }

      for (const key of Object.keys(next)) {
        if (!products.some((product) => product.id === key)) {
          delete next[key];
        }
      }

      return next;
    });
  }, [products]);

  useEffect(() => {
    if (!toast) return;

    const timeout = setTimeout(() => {
      setToast(null);
    }, 3000);

    return () => clearTimeout(timeout);
  }, [toast]);

  function showToast(kind: "success" | "error", message: string) {
    setToast({ kind, message });
  }

  function normalizeCategoryFilter(value?: string | null) {
    if (!value || value === "all") {
      return undefined;
    }

    return value;
  }

  function resetForm() {
    setEditingProductId(null);
    setFormState({
      ...emptyForm,
      categoryId: categories[0]?.id ?? "",
    });
    setErrorMessage(null);
  }

  function openCreateForm() {
    resetForm();
    setFormOpen(true);
  }

  function openEditForm(product: Product) {
    setEditingProductId(product.id);
    setFormState({
      title: product.title,
      description: product.description,
      price: String(product.price),
      inventory: String(product.inventory),
      categoryId: product.categoryId,
      images: product.images,
    });
    setErrorMessage(null);
    setFormOpen(true);
  }

  function closeForm() {
    setFormOpen(false);
    setEditingProductId(null);
    setErrorMessage(null);
  }

  function addUploadedImages(urls: string[]) {
    setFormState((prev) => {
      const merged = Array.from(new Set([...prev.images, ...urls]));
      return {
        ...prev,
        images: merged,
      };
    });
  }

  function removeImage(url: string) {
    setFormState((prev) => ({
      ...prev,
      images: prev.images.filter((image) => image !== url),
    }));
  }

  function refreshProducts(categoryId?: string | null) {
    startTransition(async () => {
      setPendingAction("refresh");
      try {
        const nextProducts = await getProducts(normalizeCategoryFilter(categoryId));
        setProducts(nextProducts as Product[]);
      } catch (error) {
        const message = error instanceof Error ? error.message : "Failed to refresh products.";
        setErrorMessage(message);
        showToast("error", message);
      } finally {
        setPendingAction(null);
      }
    });
  }

  function handleCategoryFilterChange(value: string) {
    setSelectedCategoryId(value);
    refreshProducts(value);
  }

  function handleCreateCategory() {
    if (!newCategoryName.trim()) return;

    startTransition(async () => {
      setPendingAction("category");
      try {
        const category = await createCategory(newCategoryName);
        const nextCategories = [...categories, category].sort((a, b) => a.name.localeCompare(b.name));
        setCategories(nextCategories);
        setFormState((prev) => ({
          ...prev,
          categoryId: category.id,
        }));
        setNewCategoryName("");
        showToast("success", `Category \"${category.name}\" created.`);
      } catch (error) {
        const message = error instanceof Error ? error.message : "Failed to create category.";
        setErrorMessage(message);
        showToast("error", message);
      } finally {
        setPendingAction(null);
      }
    });
  }

  function handleSubmitProduct() {
    if (!formState.title.trim()) {
      setErrorMessage("Product title is required.");
      return;
    }

    if (!formState.description.trim()) {
      setErrorMessage("Product description is required.");
      return;
    }

    const price = Number(formState.price);
    if (Number.isNaN(price) || price <= 0) {
      setErrorMessage("Price must be a positive number.");
      return;
    }

    const inventory = Number.parseInt(formState.inventory, 10);
    if (!Number.isInteger(inventory) || inventory < 0) {
      setErrorMessage("Inventory must be a non-negative whole number.");
      return;
    }

    if (!formState.categoryId) {
      setErrorMessage("Please choose a category.");
      return;
    }

    if (formState.images.length === 0) {
      setErrorMessage("Upload at least one image.");
      return;
    }

    const payload = {
      title: formState.title,
      description: formState.description,
      price,
      inventory,
      categoryId: formState.categoryId,
      images: formState.images,
    };

    startTransition(async () => {
      setPendingAction("save");
      try {
        if (editingProductId) {
          await updateProduct(editingProductId, payload);
          showToast("success", "Product updated successfully.");
        } else {
          await createProduct(payload);
          showToast("success", "Product created successfully.");
        }

        setSelectedCategoryId("all");
        const nextProducts = await getProducts();
        setProducts(nextProducts as Product[]);
        closeForm();
      } catch (error) {
        const message = error instanceof Error ? error.message : "Failed to save product.";
        setErrorMessage(message);
        showToast("error", message);
      } finally {
        setPendingAction(null);
      }
    });
  }

  function handleDeleteProduct(productId: string) {
    const shouldDelete = window.confirm("Delete this product? Its images will also be removed from UploadThing.");
    if (!shouldDelete) return;

    startTransition(async () => {
      setPendingAction("delete");
      try {
        await deleteProduct(productId);
        const nextProducts = await getProducts(normalizeCategoryFilter(selectedCategoryId));
        setProducts(nextProducts as Product[]);
        showToast("success", "Product deleted.");
      } catch (error) {
        const message = error instanceof Error ? error.message : "Failed to delete product.";
        setErrorMessage(message);
        showToast("error", message);
      } finally {
        setPendingAction(null);
      }
    });
  }

  function handleInlineInventorySave(product: Product) {
    const value = inlineInventory[product.id] ?? String(product.inventory);
    const nextInventory = Number.parseInt(value, 10);

    if (!Number.isInteger(nextInventory) || nextInventory < 0) {
      showToast("error", "Inventory must be a non-negative whole number.");
      return;
    }

    startTransition(async () => {
      setPendingAction("save");
      try {
        await updateProductInventory(product.id, nextInventory);
        setProducts((prev) =>
          prev.map((item) =>
            item.id === product.id
              ? {
                  ...item,
                  inventory: nextInventory,
                }
              : item,
          ),
        );
        showToast("success", `Inventory updated for ${product.title}.`);
      } catch (error) {
        const message = error instanceof Error ? error.message : "Failed to update inventory.";
        showToast("error", message);
      } finally {
        setPendingAction(null);
      }
    });
  }

  return (
    <section className="relative min-h-screen overflow-hidden bg-[#0B0E13] px-4 py-10 sm:px-6 lg:px-10">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_15%,rgba(10,130,140,0.20),transparent_35%),radial-gradient(circle_at_85%_10%,rgba(194,125,45,0.14),transparent_38%),linear-gradient(180deg,rgba(255,255,255,0.03)_1px,transparent_1px)] [background-size:100%_100%,100%_100%,40px_40px]" />

      <div className="relative mx-auto max-w-7xl space-y-6">
        <header className="rounded-2xl border border-zinc-800 bg-zinc-950/80 p-5 shadow-[0_30px_60px_rgba(0,0,0,0.45)] backdrop-blur">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-zinc-500">Pera Dynamics</p>
              <h1 className="mt-2 text-2xl font-semibold text-zinc-100 sm:text-3xl">Product Control Center</h1>
              <p className="mt-2 text-sm text-zinc-400">Manage categories, pricing, and inventory visuals from one dashboard.</p>
            </div>

            <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
              <select
                value={selectedCategoryId}
                onChange={(event) => handleCategoryFilterChange(event.target.value)}
                className="h-11 min-w-56 rounded-xl border border-zinc-700 bg-zinc-900 px-3 text-sm text-zinc-200 outline-none transition-colors focus:border-[#0EA5B7]"
              >
                <option value="all">All categories</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>

              <button
                type="button"
                onClick={openCreateForm}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#0EA5B7] px-5 text-sm font-semibold text-zinc-950 transition-colors hover:bg-[#20BFD2]"
              >
                <Plus size={16} />
                Add New Product
              </button>

              <Link
                href="/admin/orders"
                className="inline-flex h-11 items-center justify-center rounded-xl border border-zinc-700 bg-zinc-900 px-5 text-sm font-semibold text-zinc-200 transition-colors hover:border-zinc-500 hover:bg-zinc-800"
              >
                Orders
              </Link>

              <form action={logoutAdmin}>
                <button
                  type="submit"
                  className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-zinc-700 bg-zinc-900 px-5 text-sm font-semibold text-zinc-200 transition-colors hover:border-zinc-500 hover:bg-zinc-800 sm:w-auto"
                >
                  <LogOut size={16} />
                  Logout
                </button>
              </form>
            </div>
          </div>
        </header>

        {errorMessage ? (
          <div className="rounded-xl border border-red-700/50 bg-red-950/40 px-4 py-3 text-sm text-red-200">{errorMessage}</div>
        ) : null}

        {isPending ? (
          <div className="inline-flex items-center gap-2 rounded-xl border border-zinc-800 bg-zinc-950/80 px-3 py-2 text-xs text-zinc-300">
            <Loader2 size={14} className="animate-spin" />
            {pendingAction === "save"
              ? "Saving product..."
              : pendingAction === "delete"
                ? "Deleting product..."
                : pendingAction === "category"
                  ? "Creating category..."
                  : "Refreshing products..."}
          </div>
        ) : null}

        <div className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950/80 shadow-[0_20px_48px_rgba(0,0,0,0.35)]">
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-zinc-900/90 text-zinc-300">
                <tr>
                  <th className="px-4 py-3 font-medium">Product</th>
                  <th className="px-4 py-3 font-medium">Price</th>
                  <th className="px-4 py-3 font-medium">Category</th>
                  <th className="px-4 py-3 font-medium">Inventory</th>
                  <th className="px-4 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-12 text-center text-zinc-500">
                      <div className="mx-auto flex w-fit items-center gap-2">
                        <Boxes size={16} />
                        No products found for this filter.
                      </div>
                    </td>
                  </tr>
                ) : (
                  products.map((product) => (
                    <tr key={product.id} className="border-t border-zinc-800 text-zinc-200">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="h-12 w-12 overflow-hidden rounded-lg border border-zinc-700 bg-zinc-900">
                            <img src={product.images[0]} alt={product.title} className="h-full w-full object-cover" />
                          </div>
                          <div>
                            <p className="font-medium text-zinc-100">{product.title}</p>
                            <p className="line-clamp-1 text-xs text-zinc-400">{product.description}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-[#30C7D8]">{formatCurrency(product.price)}</td>
                      <td className="px-4 py-3">
                        <span className="rounded-full border border-zinc-700 bg-zinc-900 px-3 py-1 text-xs text-zinc-300">
                          {product.category.name}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            min="0"
                            value={inlineInventory[product.id] ?? String(product.inventory)}
                            onChange={(event) =>
                              setInlineInventory((prev) => ({
                                ...prev,
                                [product.id]: event.target.value,
                              }))
                            }
                            className="h-9 w-20 rounded-lg border border-zinc-700 bg-zinc-900 px-2 text-sm text-zinc-100 outline-none focus:border-[#0EA5B7]"
                          />
                          <button
                            type="button"
                            onClick={() => handleInlineInventorySave(product)}
                            className="rounded-lg border border-zinc-700 bg-zinc-900 px-2.5 py-1.5 text-xs text-zinc-200 transition-colors hover:border-[#0EA5B7] hover:text-[#2DD4E4]"
                          >
                            Save
                          </button>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => openEditForm(product)}
                            className="inline-flex items-center gap-1 rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-1.5 text-xs font-medium text-zinc-200 transition-colors hover:border-[#0EA5B7] hover:text-[#2DD4E4]"
                          >
                            <Pencil size={14} />
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteProduct(product.id)}
                            className="inline-flex items-center gap-1 rounded-lg border border-red-900 bg-red-950/30 px-3 py-1.5 text-xs font-medium text-red-200 transition-colors hover:bg-red-950/60"
                          >
                            <Trash2 size={14} />
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {formOpen ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/75 p-2 sm:items-center sm:p-6">
          <div className="flex max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950 shadow-[0_40px_80px_rgba(0,0,0,0.55)]">
            <div className="flex items-start justify-between gap-3 border-b border-zinc-800 px-5 py-4 sm:px-6">
              <div>
                <h2 className="text-xl font-semibold text-zinc-100">
                  {editingProductId ? "Edit Product" : "Add New Product"}
                </h2>
                <p className="mt-1 text-sm text-zinc-400">Upload multiple visuals and map each product to a catalog category.</p>
              </div>
              <button
                type="button"
                onClick={closeForm}
                className="rounded-lg border border-zinc-700 p-2 text-zinc-300 transition-colors hover:border-zinc-500 hover:text-zinc-100"
                aria-label="Close"
              >
                <X size={16} />
              </button>
            </div>

            <div className="overflow-y-auto px-5 py-4 sm:px-6">
              <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2 sm:col-span-2">
                <label htmlFor="title" className="text-sm font-medium text-zinc-200">Title</label>
                <input
                  id="title"
                  value={formState.title}
                  onChange={(event) => setFormState((prev) => ({ ...prev, title: event.target.value }))}
                  className="h-11 w-full rounded-xl border border-zinc-700 bg-zinc-900 px-3 text-sm text-zinc-100 outline-none transition-colors focus:border-[#0EA5B7]"
                  placeholder="Industrial Turbo Fan Assembly"
                />
              </div>

              <div className="space-y-2 sm:col-span-2">
                <label htmlFor="description" className="text-sm font-medium text-zinc-200">Description</label>
                <textarea
                  id="description"
                  value={formState.description}
                  onChange={(event) => setFormState((prev) => ({ ...prev, description: event.target.value }))}
                  rows={4}
                  className="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 outline-none transition-colors focus:border-[#0EA5B7]"
                  placeholder="Matte black enclosure with high-precision lattice channels."
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="price" className="text-sm font-medium text-zinc-200">Price</label>
                <input
                  id="price"
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={formState.price}
                  onChange={(event) => setFormState((prev) => ({ ...prev, price: event.target.value }))}
                  className="h-11 w-full rounded-xl border border-zinc-700 bg-zinc-900 px-3 text-sm text-zinc-100 outline-none transition-colors focus:border-[#0EA5B7]"
                  placeholder="159.00"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="inventory" className="text-sm font-medium text-zinc-200">Inventory</label>
                <input
                  id="inventory"
                  type="number"
                  min="0"
                  step="1"
                  value={formState.inventory}
                  onChange={(event) => setFormState((prev) => ({ ...prev, inventory: event.target.value }))}
                  className="h-11 w-full rounded-xl border border-zinc-700 bg-zinc-900 px-3 text-sm text-zinc-100 outline-none transition-colors focus:border-[#0EA5B7]"
                  placeholder="25"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="category" className="text-sm font-medium text-zinc-200">Category</label>
                <select
                  id="category"
                  value={formState.categoryId}
                  onChange={(event) => setFormState((prev) => ({ ...prev, categoryId: event.target.value }))}
                  className="h-11 w-full rounded-xl border border-zinc-700 bg-zinc-900 px-3 text-sm text-zinc-100 outline-none transition-colors focus:border-[#0EA5B7]"
                >
                  <option value="">Select category</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
              </div>

              <div className="mt-4 rounded-xl border border-zinc-800 bg-zinc-900/60 p-4">
                <p className="mb-2 text-sm font-medium text-zinc-200">Add New Category</p>
                <div className="flex flex-col gap-2 sm:flex-row">
                  <input
                    value={newCategoryName}
                    onChange={(event) => setNewCategoryName(event.target.value)}
                    className="h-10 flex-1 rounded-lg border border-zinc-700 bg-zinc-900 px-3 text-sm text-zinc-100 outline-none transition-colors focus:border-[#0EA5B7]"
                    placeholder="Limited Editions"
                  />
                  <button
                    type="button"
                    onClick={handleCreateCategory}
                    disabled={isPending}
                    className="h-10 rounded-lg border border-zinc-600 bg-zinc-800 px-4 text-sm font-medium text-zinc-100 transition-colors hover:border-[#2D8B95] hover:bg-zinc-700 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    Add Category
                  </button>
                </div>
              </div>

              <div className="mt-4 space-y-3">
                <p className="text-sm font-medium text-zinc-200">Product Images</p>
                <ImageUpload multiple onUploadsComplete={addUploadedImages} />

                {formState.images.length > 0 ? (
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                    {formState.images.map((url) => (
                      <div key={url} className="group relative overflow-hidden rounded-xl border border-zinc-700">
                        <img src={url} alt="Product upload" className="h-24 w-full object-cover" />
                        <button
                          type="button"
                          onClick={() => removeImage(url)}
                          className="absolute right-1.5 top-1.5 rounded-full bg-black/70 p-1 text-zinc-200 opacity-0 transition-opacity group-hover:opacity-100"
                          aria-label="Remove image"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-zinc-500">Upload at least one image. The first image will be used as the primary preview.</p>
                )}
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 border-t border-zinc-800 bg-zinc-950/95 px-5 py-4 sm:px-6">
              <button
                type="button"
                onClick={closeForm}
                disabled={isPending}
                className="h-11 rounded-xl border border-zinc-700 px-5 text-sm font-medium text-zinc-200 transition-colors hover:border-zinc-500"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSubmitProduct}
                disabled={isPending}
                className="inline-flex h-11 items-center gap-2 rounded-xl bg-[#0EA5B7] px-5 text-sm font-semibold text-zinc-950 transition-colors hover:bg-[#20BFD2] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isPending ? <Loader2 size={14} className="animate-spin" /> : null}
                {editingProductId ? "Save Product" : "Save Product"}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {toast ? (
        <div className="pointer-events-none fixed right-4 top-4 z-[60]">
          <div
            className={`rounded-xl border px-4 py-3 text-sm shadow-[0_16px_32px_rgba(0,0,0,0.35)] ${
              toast.kind === "success"
                ? "border-emerald-700/70 bg-emerald-950/90 text-emerald-200"
                : "border-red-700/70 bg-red-950/90 text-red-200"
            }`}
          >
            {toast.message}
          </div>
        </div>
      ) : null}
    </section>
  );
}
