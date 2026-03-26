import type { NextConfig } from "next";
import createNextIntlPlugin from 'next-intl/plugin';

const serverApiUrl = process.env.NEXT_PUBLIC_SERVER_API_URL;

const nextConfig: NextConfig = {
  ...(serverApiUrl
    ? {
        rewrites: async () => [
          {
            source: "/api/v1/:path*",
            destination: `${serverApiUrl}/v1/:path*`,
          },
          {
            source: "/api/instances/:path*",
            destination: `${serverApiUrl}/instances/:path*`,
          },
          {
            source: "/api/user/:path*",
            destination: `${serverApiUrl}/user/:path*`,
          },
          {
            source: "/api/billing/:path*",
            destination: `${serverApiUrl}/billing/:path*`,
          },
          {
            source: "/api/admin/:path*",
            destination: `${serverApiUrl}/admin/:path*`,
          },
          {
            source: "/api/internal/:path*",
            destination: `${serverApiUrl}/internal/:path*`,
          },
          {
            source: "/api/cron/:path*",
            destination: `${serverApiUrl}/cron/:path*`,
          },
          {
            source: "/api/webhooks/:path*",
            destination: `${serverApiUrl}/webhooks/:path*`,
          },
          {
            source: "/api/health/:path*",
            destination: `${serverApiUrl}/health/:path*`,
          },
          {
            source: "/api/stripe/:path*",
            destination: `${serverApiUrl}/stripe/:path*`,
          },
          {
            source: "/api/chat/:path*",
            destination: `${serverApiUrl}/chat/:path*`,
          },
          {
            source: "/api/manager/:path*",
            destination: `${serverApiUrl}/manager/:path*`,
          },
          {
            source: "/api/feedback/:path*",
            destination: `${serverApiUrl}/feedback/:path*`,
          },
          {
            source: "/api/templates/:path*",
            destination: `${serverApiUrl}/templates/:path*`,
          },
          {
            source: "/api/onboarding/:path*",
            destination: `${serverApiUrl}/onboarding/:path*`,
          },
          {
            source: "/api/invite/:path*",
            destination: `${serverApiUrl}/invite/:path*`,
          },
        ],
      }
    : {}),
};

const withNextIntl = createNextIntlPlugin();
export default withNextIntl(nextConfig);
