import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Accessories - iDreams Store",
};

export default function AccessoriesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
