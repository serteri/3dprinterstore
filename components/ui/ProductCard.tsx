import Link from "next/link";
import { Layers } from "lucide-react";

type ProductCardProps = {
  product: {
    id: string;
    title: string;
    description: string;
    price: number;
    images: string[];
    createdAt: Date | string;
  };
};

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value);
}

export default function ProductCard({ product }: ProductCardProps) {
  const createdAtDate = product.createdAt instanceof Date ? product.createdAt : new Date(product.createdAt);
  const thirtyDaysMs = 30 * 24 * 60 * 60 * 1000;
  const isNew = Number.isFinite(createdAtDate.getTime()) && Date.now() - createdAtDate.getTime() <= thirtyDaysMs;

  return (
    <Link
      href={`/products/${product.id}`}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-zinc-900 transition-all hover:border-cyan-400/30 hover:shadow-[0_0_30px_rgba(34,211,238,0.08)]"
    >
      <div className="aspect-square overflow-hidden bg-zinc-800">
        {product.images[0] ? (
          <img
            src={product.images[0]}
            alt={product.title}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <Layers size={48} className="text-zinc-600 transition-colors group-hover:text-cyan-400/40" strokeWidth={1} />
          </div>
        )}
      </div>

      {isNew ? (
        <span className="absolute left-3 top-3 rounded-full bg-cyan-400 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-zinc-950">
          NEW
        </span>
      ) : null}

      <div className="flex flex-1 flex-col justify-between p-4">
        <div>
          <h3 className="font-medium text-white">{product.title}</h3>
          <p className="mt-2 line-clamp-2 text-sm text-zinc-400">{product.description}</p>
        </div>
        <div className="mt-4 flex items-center justify-between">
          <span className="text-lg font-bold text-cyan-400">{formatCurrency(product.price)}</span>
          <span className="rounded-full border border-white/10 px-3 py-1.5 text-xs font-medium text-zinc-300 transition-all group-hover:border-cyan-400/40 group-hover:text-white">
            View Product
          </span>
        </div>
      </div>
    </Link>
  );
}
