import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Instance Details | Dashboard",
};

export default function InstanceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
