"use server";

import { redirect } from "next/navigation";

import { createProduct as createAdminProduct, getCategories } from "@/app/actions/admin";

export async function createProduct(formData: FormData) {
  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const priceRaw = String(formData.get("price") ?? "").trim();
  const inventoryRaw = String(formData.get("inventory") ?? "0").trim();
  const categoryIdRaw = String(formData.get("categoryId") ?? "").trim();
  const imagesRaw = String(formData.get("images") ?? "").trim();

  if (!title) {
    throw new Error("Product title is required.");
  }

  if (!description) {
    throw new Error("Product description is required.");
  }

  const price = Number(priceRaw);
  if (Number.isNaN(price) || price <= 0) {
    throw new Error("Price must be a positive number.");
  }

  const inventory = Number.parseInt(inventoryRaw, 10);
  if (!Number.isInteger(inventory) || inventory < 0) {
    throw new Error("Inventory must be a non-negative whole number.");
  }

  const categories = await getCategories();
  const fallbackCategoryId = categories[0]?.id;
  const categoryId = categoryIdRaw || fallbackCategoryId;

  if (!categoryId) {
    throw new Error("Create at least one category before adding products.");
  }

  const images = imagesRaw
    ? imagesRaw
        .split(",")
        .map((image) => image.trim())
        .filter(Boolean)
    : [];

  if (images.length === 0) {
    throw new Error("Please upload at least one product image.");
  }

  await createAdminProduct({
    title,
    description,
    price,
    inventory,
    categoryId,
    images,
  });

  redirect("/");
}
