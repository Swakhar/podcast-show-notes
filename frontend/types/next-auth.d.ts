// types/next-auth.d.ts
import NextAuth from "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      name?: string | null
      email?: string | null
      image?: string | null
      plan?: string
      stripeCustomerId?: string | null
      subscriptionStatus?: string | null
      monthlyMinutesLimit?: number
      monthlyMinutesUsed?: number
      is_admin?: boolean
    }
  }
}
