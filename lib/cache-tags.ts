export const CACHE_TAGS = {
  products: "products",
  categories: "categories",
  orders: "orders",
  customInquiries: "custom-inquiries",
} as const;

export const CACHE_TAG_PROFILE = "max";

export function productTag(productId: string) {
  return `product:${productId}`;
}
