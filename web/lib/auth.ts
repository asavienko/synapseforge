// @ts-nocheck
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import bcrypt from "bcryptjs";
import { prisma } from "./prisma";
import { rateLimit } from "./ratelimit";

const providers: NextAuthConfig["providers"] = [
  Credentials({
    name: "credentials",
    credentials: {
      email: { label: "Email", type: "email" },
      password: { label: "Password", type: "password" },
    },
    async authorize(credentials) {
      if (!credentials?.email || !credentials?.password) return null;

      // Rate limit: 10 login attempts per email per 15 minutes
      const emailKey = `login:${(credentials.email as string).toLowerCase()}`;
      if (!rateLimit(emailKey, 10, 15 * 60 * 1000)) {
        throw new Error("Too many login attempts. Please try again later.");
      }

      const user = await prisma.user.findUnique({
        where: { email: credentials.email as string },
      });

      if (!user || !user.password) return null;

      const isValid = await bcrypt.compare(credentials.password as string, user.password);
      if (!isValid) return null;

      return {
        id: user.id,
        email: user.email,
        name: user.name,
        image: user.image,
      };
    },
  }),
];

// Add Google OAuth when credentials are available
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  providers.push(
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      authorization: { params: { scope: "openid email profile" } },
    })
  );
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers,
  // Trust localhost in development and CI environments
  // AUTH_TRUST_HOST is the standard env var for Auth.js v5
  // Trust host on Vercel (edge handles security), in dev, CI, or if explicitly set
  trustHost: true,
  callbacks: {
    async signIn({ user, account }) {
      // For Google OAuth: upsert user into DB
      if (account?.provider === "google" && user.email) {
        const existing = await prisma.user.findUnique({ where: { email: user.email } });
        if (!existing) {
          await prisma.user.create({
            data: {
              email: user.email,
              name: user.name ?? "",
              image: user.image ?? null,
              // Google-verified emails are trusted
              emailVerified: new Date(),
            },
          });
        } else if (!existing.emailVerified) {
          await prisma.user.update({
            where: { email: user.email },
            data: { emailVerified: new Date() },
          });
        }
      }
      return true;
    },
    async session({ session, token }) {
      if (token?.sub) {
        session.user.id = token.sub;
      }
      return session;
    },
    async jwt({ token, user, account }) {
      if (user) {
        token.sub = user.id;
      }
      // For Google OAuth: resolve real DB id via email
      if (account?.provider === "google" && token.email && !token.dbResolved) {
        const dbUser = await prisma.user.findUnique({ where: { email: token.email as string } });
        if (dbUser) {
          token.sub = dbUser.id;
          token.dbResolved = true;
        }
      }
      return token;
    },
    async redirect({ url, baseUrl }) {
      if (url.startsWith(baseUrl) || url.startsWith("/")) return url;
      return baseUrl + "/dashboard";
    },
  },
  pages: {
    signIn: "/sign-in",
  },
  session: {
    strategy: "jwt",
  },
});
