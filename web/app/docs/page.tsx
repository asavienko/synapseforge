import { Metadata } from "next";
import { ApiDocsClient } from "./ApiDocsClient";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "API Documentation | OpenHelix AI",
    description: "Integrate with the OpenHelix AI API to build AI-powered applications",
  };
}

export default function ApiDocsPage() {
  return <ApiDocsClient />;
}
