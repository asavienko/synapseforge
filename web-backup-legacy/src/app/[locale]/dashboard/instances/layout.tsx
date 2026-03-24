import { Metadata } from "next";

export const metadata: Metadata = {
  title: "My Instances | Dashboard",
};

export default function InstancesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
