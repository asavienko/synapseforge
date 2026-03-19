import { Metadata } from "next";
import { ApiDocsClient } from "./ApiDocsClient";

export const metadata: Metadata = {
  title: "API Documentation | SynapseForge",
  description: "Integrate with the SynapseForge API to build AI-powered applications",
};

export default function ApiDocsPage() {
  return <ApiDocsClient />;
}
