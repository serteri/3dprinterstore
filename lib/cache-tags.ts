export const CACHE_TAGS = {
  products: "products",
  categories: "categories",
  orders: "orders",
  customInquiries: "custom-inquiries",
} as const;

export function productTag(productId: string) {
  return `product:${productId}`;
}
