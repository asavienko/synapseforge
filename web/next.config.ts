import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";
import { withSentryConfig } from "@sentry/nextjs";

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

const nextConfig: NextConfig = {
  outputFileTracingIncludes: {
    "/api/**/*": [
      "./node_modules/.prisma/client/libquery_engine-rhel-openssl-3.0.x.so.node",
      "./node_modules/.prisma/client/query_engine-rhel-openssl-3.0.x.so.node",
    ],
  },
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default withSentryConfig(withNextIntl(nextConfig) as any, {
  org: "synapseforge",
  project: "synapseforge-web",
  silent: true,
  disableLogger: true,
  tunnelRoute: "/monitoring",
  sourcemaps: { disable: true },
  authToken: process.env.SENTRY_AUTH_TOKEN,
});
