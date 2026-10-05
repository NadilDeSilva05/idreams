import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Selling History - iDreams POS",
};

export default function SellingHistoryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
