import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../../lib/prisma";
import { requireAgencyPlan } from "../../../lib/teamMiddleware";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "GET") {
    const auth = await requireAgencyPlan(req, res);
    if (auth.error) {
      return res.status(auth.error.status).json(auth.error);
    }

    try {
      const teams = await prisma.team.findMany({
        where: {
          OR: [
            { ownerId: auth.user.id },
            { 
              memberships: {
                some: { userId: auth.user.id }
              }
            }
          ]
        },
        include: {
          owner: { select: { name: true, email: true } },
          memberships: {
            include: {
              user: { select: { name: true, email: true } }
            }
          },
          _count: { select: { memberships: true } }
        }
      });

      return res.status(200).json(teams);
    } catch (error) {
      console.error("Error fetching teams:", error);
      return res.status(500).json({ error: "Failed to fetch teams" });
    }
  }

  if (req.method === "POST") {
    const auth = await requireAgencyPlan(req, res);
    if (auth.error) {
      return res.status(auth.error.status).json(auth.error);
    }

    const { name, description } = req.body;

    if (!name || typeof name !== "string") {
      return res.status(400).json({ error: "Team name is required" });
    }

    try {
      const team = await prisma.team.create({
        data: {
          name: name.trim(),
          description: description?.trim() || null,
          ownerId: auth.user.id,
        },
        include: {
          owner: { select: { name: true, email: true } },
          _count: { select: { memberships: true } }
        }
      });

      return res.status(201).json(team);
    } catch (error) {
      console.error("Error creating team:", error);
      return res.status(500).json({ error: "Failed to create team" });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}
