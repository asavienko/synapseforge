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
      try {
      console.log("[auth] Authorize called");
      
      const email = credentials?.email as string | undefined;
      const password = credentials?.password as string | undefined;
      
      if (!email || !password) {
        console.log("[auth] Missing credentials");
        return null;
      }

      const normalizedEmail = email.toLowerCase().trim();
      console.log("[auth] Looking up user:", normalizedEmail);

      // Rate limit: 10 login attempts per email per 15 minutes
      const emailKey = `login:${normalizedEmail}`;
      const isAllowed = await rateLimit(emailKey, 10, 15 * 60 * 1000);
      if (!isAllowed) {
        throw new Error("Too many login attempts. Please try again later.");
      }

      const user = await prisma.user.findUnique({
        where: { email: normalizedEmail },
      });

      if (!user) {
        console.log("[auth] User not found");
        return null;
      }

      if (!user.password) {
        console.log("[auth] User has no password");
        return null;
      }

      console.log("[auth] Comparing passwords...");
      const isValid = await bcrypt.compare(password, user.password);
      console.log("[auth] Password valid:", isValid);
      
      if (!isValid) {
        return null;
      }

      console.log("[auth] Login successful");
      return {
        id: user.id,
        email: user.email,
        name: user.name,
        image: user.image,
      };
      } catch (err) {
        console.error("[auth] Authorize exception:", err);
        return null;
      }
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
  secret: process.env.NEXTAUTH_SECRET ?? process.env.AUTH_SECRET,
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
  const { getServerSession } = await import("next-auth/next");
  return getServerSession(authOptions);
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
