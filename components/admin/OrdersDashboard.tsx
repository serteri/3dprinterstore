"use client";

import Link from "next/link";
import { useMemo, useState, useTransition } from "react";
import { CheckCircle2, Loader2, PackageCheck, X } from "lucide-react";

import { fulfillOrder } from "@/app/actions/admin";

type AdminOrder = {
  id: string;
  customerName: string;
  customerEmail: string;
  shippingAddress: string;
  status: "PENDING" | "SHIPPED" | "DELIVERED";
  trackingNumber: string | null;
  carrier: string | null;
  totalAmount: number;
  createdAt: string;
  orderItems: Array<{
    id: string;
    productId: string;
    quantity: number;
    price: number;
    product: {
      id: string;
      title: string;
    };
  }>;
};

type OrdersDashboardProps = {
  initialOrders: AdminOrder[];
};

const CARRIER_OPTIONS = [
  "Australia Post",
  "Sendle",
  "DHL",
  "Aramex",
  "Personal Delivery (Brisbane Local)",
  "Other",
] as const;

type CarrierOption = (typeof CARRIER_OPTIONS)[number];

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "AUD",
  }).format(value);
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-AU", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export default function OrdersDashboard({ initialOrders }: OrdersDashboardProps) {
  const [orders, setOrders] = useState(initialOrders);
  const [activeOrderId, setActiveOrderId] = useState<string | null>(null);
  const [trackingNumber, setTrackingNumber] = useState("");
  const [carrier, setCarrier] = useState<CarrierOption>("Australia Post");
  const [customCarrier, setCustomCarrier] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const activeOrder = useMemo(
    () => orders.find((order) => order.id === activeOrderId) ?? null,
    [orders, activeOrderId],
  );

  function openFulfillModal(orderId: string) {
    setActiveOrderId(orderId);
    setTrackingNumber("");
    setCarrier("Australia Post");
    setCustomCarrier("");
    setErrorMessage(null);
  }

  function closeModal() {
    setActiveOrderId(null);
    setErrorMessage(null);
  }

  function handleMarkShipped() {
    if (!activeOrder) return;

    const normalizedTracking = trackingNumber.trim();
    const normalizedCarrier = (carrier === "Other" ? customCarrier : carrier).trim();

    if (!normalizedTracking) {
      setErrorMessage("Tracking number is required.");
      return;
    }

    if (!normalizedCarrier) {
      setErrorMessage("Carrier is required.");
      return;
    }

    startTransition(async () => {
      try {
        await fulfillOrder(activeOrder.id, normalizedTracking, normalizedCarrier);

        setOrders((prev) =>
          prev.map((order) =>
            order.id === activeOrder.id
              ? {
                  ...order,
                  status: "SHIPPED",
                  trackingNumber: normalizedTracking,
                  carrier: normalizedCarrier,
                }
              : order,
          ),
        );

        closeModal();
      } catch (error) {
        setErrorMessage(error instanceof Error ? error.message : "Failed to fulfill order.");
      }
    });
  }

  return (
    <section className="relative min-h-screen overflow-hidden bg-[#0B0E13] px-4 py-10 sm:px-6 lg:px-10">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_14%,rgba(132,107,77,0.22),transparent_36%),radial-gradient(circle_at_84%_12%,rgba(110,128,152,0.16),transparent_38%)]" />

      <div className="relative mx-auto max-w-7xl space-y-6">
        <header className="rounded-2xl border border-zinc-800 bg-zinc-950/80 p-6 shadow-[0_30px_60px_rgba(0,0,0,0.45)]">
          <p className="text-xs uppercase tracking-[0.24em] text-zinc-500">Pera Dynamics</p>
          <h1 className="mt-2 text-3xl font-semibold text-zinc-100">Order Management</h1>
          <p className="mt-2 text-sm text-zinc-400">Monitor successful payments and dispatch shipments with tracking notifications.</p>
          <div className="mt-4">
            <div className="flex flex-wrap gap-2">
              <Link
                href="/admin/products"
                className="inline-flex items-center rounded-full border border-zinc-700 px-4 py-2 text-xs uppercase tracking-[0.16em] text-zinc-200 transition-colors hover:border-zinc-500 hover:bg-zinc-900"
              >
                Back to Products
              </Link>
              <Link
                href="/admin/custom"
                className="inline-flex items-center rounded-full border border-zinc-700 px-4 py-2 text-xs uppercase tracking-[0.16em] text-zinc-200 transition-colors hover:border-zinc-500 hover:bg-zinc-900"
              >
                Custom Requests
              </Link>
            </div>
          </div>
        </header>

        <div className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950/80 shadow-[0_20px_48px_rgba(0,0,0,0.35)]">
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-zinc-900/90 text-zinc-300">
                <tr>
                  <th className="px-4 py-3 font-medium">Customer</th>
                  <th className="px-4 py-3 font-medium">Address</th>
                  <th className="px-4 py-3 font-medium">Date</th>
                  <th className="px-4 py-3 font-medium">Total</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Fulfillment</th>
                </tr>
              </thead>
              <tbody>
                {orders.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-12 text-center text-zinc-500">
                      No successful orders yet.
                    </td>
                  </tr>
                ) : (
                  orders.map((order) => (
                    <tr key={order.id} className="border-t border-zinc-800 text-zinc-200 align-top">
                      <td className="px-4 py-3">
                        <p className="font-medium text-zinc-100">{order.customerName}</p>
                        <p className="text-xs text-zinc-400">{order.customerEmail}</p>
                      </td>
                      <td className="px-4 py-3 text-xs leading-5 text-zinc-300">{order.shippingAddress}</td>
                      <td className="px-4 py-3 text-xs text-zinc-300">{formatDate(order.createdAt)}</td>
                      <td className="px-4 py-3 font-medium text-amber-300">{formatCurrency(order.totalAmount)}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`rounded-full border px-3 py-1 text-xs ${
                            order.status === "SHIPPED"
                              ? "border-emerald-700 bg-emerald-950/50 text-emerald-300"
                              : order.status === "DELIVERED"
                                ? "border-cyan-700 bg-cyan-950/50 text-cyan-300"
                                : "border-zinc-700 bg-zinc-900 text-zinc-300"
                          }`}
                        >
                          {order.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {order.status === "PENDING" ? (
                          <button
                            type="button"
                            onClick={() => openFulfillModal(order.id)}
                            className="inline-flex items-center gap-1 rounded-lg border border-amber-700 bg-amber-900/20 px-3 py-1.5 text-xs font-medium text-amber-300 transition-colors hover:bg-amber-900/35"
                          >
                            <PackageCheck size={14} />
                            Fulfill Order
                          </button>
                        ) : (
                          <div className="space-y-1 text-xs text-zinc-400">
                            <p>
                              <strong className="text-zinc-300">Carrier:</strong> {order.carrier ?? "-"}
                            </p>
                            <p>
                              <strong className="text-zinc-300">Tracking:</strong> {order.trackingNumber ?? "-"}
                            </p>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {activeOrder ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-lg rounded-2xl border border-zinc-800 bg-zinc-950 p-6 shadow-[0_35px_80px_rgba(0,0,0,0.6)]">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-xl font-semibold text-zinc-100">Fulfill Order</h2>
                <p className="mt-1 text-sm text-zinc-400">Enter tracking details to mark as shipped and send email.</p>
              </div>
              <button
                type="button"
                onClick={closeModal}
                className="rounded-lg border border-zinc-700 p-2 text-zinc-300 transition-colors hover:border-zinc-500"
              >
                <X size={16} />
              </button>
            </div>

            <div className="mt-5 space-y-4">
              <div className="space-y-2">
                <label className="text-sm text-zinc-200">Carrier</label>
                <select
                  value={carrier}
                  onChange={(event) => {
                    setCarrier(event.target.value as CarrierOption);
                    setErrorMessage(null);
                  }}
                  className="h-11 w-full rounded-xl border border-zinc-700 bg-zinc-900 px-3 text-sm text-zinc-100 outline-none focus:border-amber-400"
                >
                  {CARRIER_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>

              {carrier === "Other" ? (
                <div className="space-y-2">
                  <label className="text-sm text-zinc-200">Custom Carrier</label>
                  <input
                    value={customCarrier}
                    onChange={(event) => {
                      setCustomCarrier(event.target.value);
                      setErrorMessage(null);
                    }}
                    className="h-11 w-full rounded-xl border border-zinc-700 bg-zinc-900 px-3 text-sm text-zinc-100 outline-none focus:border-amber-400"
                    placeholder="Enter carrier name"
                  />
                </div>
              ) : null}

              <div className="space-y-2">
                <label className="text-sm text-zinc-200">Tracking Number</label>
                <input
                  value={trackingNumber}
                  onChange={(event) => {
                    setTrackingNumber(event.target.value);
                    setErrorMessage(null);
                  }}
                  className="h-11 w-full rounded-xl border border-zinc-700 bg-zinc-900 px-3 text-sm text-zinc-100 outline-none focus:border-amber-400"
                  placeholder="e.g. 6AUS123456789"
                />
              </div>

              {errorMessage ? (
                <p className="rounded-lg border border-red-800 bg-red-950/40 px-3 py-2 text-sm text-red-200">{errorMessage}</p>
              ) : null}
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={closeModal}
                disabled={isPending}
                className="h-10 rounded-xl border border-zinc-700 px-4 text-sm text-zinc-200 transition-colors hover:border-zinc-500 disabled:opacity-60"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleMarkShipped}
                disabled={isPending}
                className="inline-flex h-10 items-center gap-2 rounded-xl bg-[#C7A36B] px-4 text-sm font-semibold text-[#101214] transition-colors hover:bg-[#D5B37A] disabled:opacity-60"
              >
                {isPending ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={14} />}
                Mark as Shipped
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
