import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) throw new Error("DATABASE_URL missing");
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

const newCategories = [
  "Architectural & Design",
  "Tech & Workspace",
  "Outdoor & Adventure",
  "Toys & Pop Culture",
  "Functional Engineering",
  "Art & Sculptures",
  "Home Hardware",
  "Education & Science",
  "Prototyping Services",
  "Bespoke / Custom",
];

console.log("Creating/updating categories...");
for (const name of newCategories) {
  const cat = await prisma.category.upsert({
    where: { name },
    create: { name },
    update: {},
  });
  console.log("  ✓", cat.name);
}

// Move any product under old "Toys" category to the right new category
const toysAndPopCulture = await prisma.category.findUnique({ where: { name: "Toys & Pop Culture" } });
if (!toysAndPopCulture) throw new Error("Toys & Pop Culture category not found");

// Find the old "Toys" category if it still exists
const oldToys = await prisma.category.findUnique({ where: { name: "Toys" } });
if (oldToys) {
  const moved = await prisma.product.updateMany({
    where: { categoryId: oldToys.id },
    data: { categoryId: toysAndPopCulture.id },
  });
  console.log(`\nMoved ${moved.count} product(s) from 'Toys' to 'Toys & Pop Culture'`);
  
  // Delete old category if empty
  const remaining = await prisma.product.count({ where: { categoryId: oldToys.id } });
  if (remaining === 0) {
    await prisma.category.delete({ where: { id: oldToys.id } });
    console.log("Deleted old 'Toys' category");
  }
}

// Print final state
const cats = await prisma.category.findMany({
  include: { _count: { select: { products: true } } },
  orderBy: { name: "asc" },
});
console.log("\n=== FINAL CATEGORIES ===");
cats.forEach((c) => console.log(` ${c._count.products > 0 ? "●" : "○"} ${c.name.padEnd(30)} (${c._count.products})`));

const prods = await prisma.product.findMany({
  select: { id: true, title: true, category: { select: { name: true } } },
});
console.log("\n=== PRODUCTS ===");
prods.forEach((p) => console.log(` • ${p.title.padEnd(30)} → ${p.category.name}`));

await prisma.$disconnect();
