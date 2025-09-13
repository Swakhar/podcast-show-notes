import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "../pages/api/auth/[...nextauth]";
import { prisma } from "./prisma";

export async function requireAgencyPlan(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);
  
  if (!session?.user?.email) {
    return { error: { status: 401, message: "Sign in required" } };
  }

  const userId = (session.user as any).id;
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { plan: true, name: true, email: true }
  });

  if (!user) {
    return { error: { status: 404, message: "User not found" } };
  }

  if (user.plan !== "AGENCY") {
    return { 
      error: { 
        status: 403, 
        message: "Teams functionality is only available for Agency plan users. Please upgrade to access this feature.",
        requiresPlan: "AGENCY",
        currentPlan: user.plan
      } 
    };
  }

  return { user: { ...user, id: userId }, session };
}
