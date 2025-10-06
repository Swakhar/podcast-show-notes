import NextAuth, { type AuthOptions } from "next-auth";
import EmailProvider from "next-auth/providers/email";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "../../../lib/prisma";
import bcrypt from "bcryptjs";

export const authOptions: AuthOptions = {
  adapter: PrismaAdapter(prisma) as any,
  session: { strategy: "jwt" },
  providers: [
    EmailProvider({
      server: process.env.EMAIL_SERVER!,
      from: process.env.EMAIL_FROM!,
      maxAge: 24 * 60 * 60,
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email = (credentials?.email || "").toString().trim().toLowerCase();
        const password = (credentials?.password || "").toString();

        if (!email || !password) return null;

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user || !user.password) return null;

        const ok = await bcrypt.compare(password, user.password);
        if (!ok) return null;

        return { id: user.id, email: user.email, name: user.name || undefined };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user?.email) {
        const u = await prisma.user.findUnique({ where: { email: user.email } });
        if (u) {
          token.sub = u.id;
          token.plan = u.plan;
          token.stripeCustomerId = u.stripeCustomerId;
          token.subscriptionStatus = u.subscriptionStatus;
          token.monthlyMinutesLimit = u.monthlyMinutesLimit;
          token.monthlyMinutesUsed = u.monthlyMinutesUsed;
          token.is_admin = u.is_admin;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.sub;
        (session.user as any).plan = token.plan || "FREE";
        (session.user as any).stripeCustomerId = token.stripeCustomerId || null;
        (session.user as any).subscriptionStatus = token.subscriptionStatus || null;
        (session.user as any).monthlyMinutesLimit = token.monthlyMinutesLimit ?? 30;
        (session.user as any).monthlyMinutesUsed = token.monthlyMinutesUsed ?? 0;
        (session.user as any).is_admin = token.is_admin || false;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};

export default NextAuth(authOptions);
