import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "System History | iDreams POS",
  description: "Operational audit log and history for iDreams inventory and sales",
};

export default function HistoryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
