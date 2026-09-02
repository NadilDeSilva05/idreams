import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Smartphones - iDreams Store",
};

export default function SmartphonesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
