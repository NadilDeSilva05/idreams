import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/app/providers";
import { CartProvider } from "@/context/cart-context";
import { NavigationDrawer } from "@/components/navigation/drawer-navigation";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "iDreams POS & Shop Management",
  description:
    "Professional POS, repair, inventory, billing, and analytics management system for iDreams.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full">
        <Providers>
          <CartProvider>
            <NavigationDrawer>{children}</NavigationDrawer>
          </CartProvider>
        </Providers>
      </body>
    </html>
  );
}