import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) throw new Error("DATABASE_URL missing");
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

const cats = await prisma.category.findMany({
  include: { _count: { select: { products: true } } },
  orderBy: { name: "asc" },
});
console.log("=== CATEGORIES ===");
cats.forEach((c) => console.log(c.id, "|", c.name, "|", c._count.products, "products"));

const prods = await prisma.product.findMany({
  select: { id: true, title: true, category: { select: { name: true } } },
  orderBy: { title: "asc" },
});
console.log("\n=== PRODUCTS ===");
prods.forEach((p) => console.log(p.id, "|", p.title, "|", p.category.name));

await prisma.$disconnect();
