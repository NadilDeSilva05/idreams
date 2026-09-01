import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Billing - iDreams POS",
};

export default function BillingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
