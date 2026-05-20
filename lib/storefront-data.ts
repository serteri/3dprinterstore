import { unstable_cache } from "next/cache";

import { CACHE_TAGS, productTag } from "@/lib/cache-tags";
import { prisma } from "@/lib/prisma";

const getFeaturedProductsCached = unstable_cache(
  async () => {
    const products = await prisma.product.findMany({
      orderBy: { createdAt: "desc" },
      take: 4,
      select: {
        id: true,
        title: true,
        description: true,
        price: true,
        images: true,
        createdAt: true,
      },
    });

    return products.map((product) => ({
      id: product.id,
      title: product.title,
      description: product.description,
      price: Number(product.price),
      images: product.images,
      createdAt: product.createdAt.toISOString(),
    }));
  },
  ["storefront-featured-products"],
  { tags: [CACHE_TAGS.products] },
);

const getProductsCatalogDataCached = unstable_cache(
  async () => {
    const [products, categories] = await Promise.all([
      prisma.product.findMany({
        include: { category: { select: { name: true } } },
        orderBy: { createdAt: "desc" },
      }),
      prisma.category.findMany({
        include: { _count: { select: { products: true } } },
        orderBy: { name: "asc" },
      }),
    ]);

    const categoryCounts: Record<string, number> = {};
    for (const category of categories) {
      categoryCounts[category.name] = category._count.products;
    }

    return {
      products: products.map((product) => ({
        id: product.id,
        title: product.title,
        description: product.description,
        price: Number(product.price),
        images: product.images,
        createdAt: product.createdAt.toISOString(),
        categoryName: product.category.name,
      })),
      categoryCounts,
    };
  },
  ["storefront-products-catalog"],
  { tags: [CACHE_TAGS.products, CACHE_TAGS.categories] },
);

export async function getFeaturedProducts() {
  return getFeaturedProductsCached();
}

export async function getProductsCatalogData() {
  return getProductsCatalogDataCached();
}

export async function getProductDetailById(productId: string) {
  const getCachedProduct = unstable_cache(
    async () => {
      const product = await prisma.product.findUnique({
        where: { id: productId },
        include: {
          category: {
            select: {
              name: true,
            },
          },
        },
      });

      if (!product) {
        return null;
      }

      return {
        id: product.id,
        title: product.title,
        description: product.description,
        price: Number(product.price),
        images: product.images,
        inventory: product.inventory,
        categoryName: product.category.name,
      };
    },
    [`storefront-product-${productId}`],
    { tags: [CACHE_TAGS.products, productTag(productId)] },
  );

  return getCachedProduct();
}
