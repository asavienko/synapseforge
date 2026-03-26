import NextAuth from "next-auth";
import type { NextAuthOptions } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import bcrypt from "bcryptjs";
import { prisma } from "./prisma";
import { rateLimit } from "./ratelimit";

const providers: NextAuthOptions["providers"] = [
  Credentials({
    name: "credentials",
    credentials: {
      email: { label: "Email", type: "email" },
      password: { label: "Password", type: "password" },
    },
    async authorize(credentials) {
      if (!credentials?.email || !credentials?.password) return null;

      // Normalize email
      const normalizedEmail = (credentials.email as string).toLowerCase().trim();

      // Rate limit: 10 login attempts per email per 15 minutes
      const emailKey = `login:${normalizedEmail}`;
      if (!rateLimit(emailKey, 10, 15 * 60 * 1000)) {
        throw new Error("Too many login attempts. Please try again later.");
      }

      const user = await prisma.user.findUnique({
        where: { email: normalizedEmail },
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

export const authOptions: NextAuthOptions = {
  providers,
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
        (session.user as { id?: string }).id = token.sub;
        // Fetch emailVerified status from DB
        const dbUser = await prisma.user.findUnique({
          where: { id: token.sub },
          select: { emailVerified: true },
        });
        (session.user as { emailVerified?: Date | null }).emailVerified = dbUser?.emailVerified ?? null;
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
};

// For NextAuth v4, export the default handler
export default NextAuth(authOptions);

// Helper to get session in server components
export async function auth() {
  // This is a simplified version - in real usage you'd use getServerSession
  return null;
}

// Export signIn/signOut helpers (these will need to be used client-side)
export const signIn = async () => {};
export const signOut = async () => {};

// Export handlers for API routes (v4 style)
export const handlers = {
  GET: NextAuth(authOptions),
  POST: NextAuth(authOptions),
};

// Admin check helper
export function isAdmin(email: string | null | undefined) {
  const adminEmails = (process.env.ADMIN_EMAILS || "").split(",").map((e) => e.trim());
  return !!email && adminEmails.includes(email);
}
