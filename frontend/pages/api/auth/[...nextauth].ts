import NextAuth, { type AuthOptions } from "next-auth";
import EmailProvider from "next-auth/providers/email";
import { PrismaAdapter } from "@auth/prisma-adapter"; // or "@next-auth/prisma-adapter"
import { prisma } from "../../../lib/prisma";

export const authOptions: AuthOptions = {
  adapter: PrismaAdapter(prisma) as any,
  providers: [
    EmailProvider({
      server: process.env.EMAIL_SERVER!,  // smtp://USER:PASS@sandbox.smtp.mailtrap.io:2525
      from: process.env.EMAIL_FROM!,      // "Your App <no-reply@yourdomain.test>"
      maxAge: 24 * 60 * 60,
    }),
  ],
  session: { strategy: "jwt" },
  // pages: { signIn: "/login" }, // comment out if you use the built-in page
  callbacks: {
    async jwt({ token, user }) {
      if (user?.email) {
        const u = await prisma.user.findUnique({ where: { email: user.email } });
        console.log("JWT callback - user:", u);
        if (u) {
          token.plan = u.plan;
          token.stripeCustomerId = u.stripeCustomerId;
          token.subscriptionStatus = u.subscriptionStatus;
          token.monthlyMinutesLimit = u.monthlyMinutesLimit;
          token.monthlyMinutesUsed = u.monthlyMinutesUsed;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).plan = token.plan || "FREE";
        (session.user as any).stripeCustomerId = token.stripeCustomerId || null;
        (session.user as any).subscriptionStatus = token.subscriptionStatus || null;
        (session.user as any).monthlyMinutesLimit = token.monthlyMinutesLimit ?? 30;
        (session.user as any).monthlyMinutesUsed = token.monthlyMinutesUsed ?? 0;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};

export default NextAuth(authOptions);
