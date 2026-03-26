import type { NextConfig } from "next";
import createNextIntlPlugin from 'next-intl/plugin';

const serverApiUrl = process.env.NEXT_PUBLIC_SERVER_API_URL;

const nextConfig: NextConfig = {
  ...(serverApiUrl
    ? {
        rewrites: async () => [
          {
            source: "/api/:path*",
            destination: `${serverApiUrl}/:path*`,
          },
        ],
      }
    : {}),
};

const withNextIntl = createNextIntlPlugin();
export default withNextIntl(nextConfig);
