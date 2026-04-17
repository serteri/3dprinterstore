import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Suspense } from "react";
import { NextSSRPlugin } from "@uploadthing/react/next-ssr-plugin";
import { extractRouterConfig } from "uploadthing/server";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import PageBreadcrumb from "@/components/layout/PageBreadcrumb";
import { CartProvider } from "@/components/cart/CartProvider";
import { ourFileRouter } from "@/app/api/uploadthing/core";
import { isAdminAuthenticated } from "@/lib/admin-session";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Pera Dynamics | Precision Art",
  description:
    "Pera Dynamics builds bespoke additive manufacturing products with precision engineering, minimalist craftsmanship, and industrial-grade materials.",
  icons: {
    icon: "/icon.svg",
    shortcut: "/icon.svg",
    apple: "/icon.svg",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const adminAuthenticated = await isAdminAuthenticated();

  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-zinc-950 text-white">
        <CartProvider>
          <Suspense>
            <NextSSRPlugin routerConfig={extractRouterConfig(ourFileRouter)} />
          </Suspense>
          <Navbar isAdminAuthenticated={adminAuthenticated} />
          <PageBreadcrumb />
          <main className="flex-1">{children}</main>
        </CartProvider>
      </body>
    </html>
  );
}
