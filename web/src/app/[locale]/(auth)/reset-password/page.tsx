import { Metadata } from "next";
import { ResetPasswordClient } from "./ResetPasswordClient";

export const metadata: Metadata = {
  title: "Reset Password | OpenHelix AI",
  description: "Create a new password for your OpenHelix AI account",
};

interface PageProps {
  searchParams: Promise<{ token?: string }>;
}

export default async function ResetPasswordPage({
  searchParams,
}: PageProps) {
  const params = await searchParams;
  return <ResetPasswordClient token={params.token} />;
}
