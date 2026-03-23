import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Messages | Dashboard",
};

export default function MessagesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
