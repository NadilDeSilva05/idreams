import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Repairs - iDreams POS",
};

export default function RepairsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
