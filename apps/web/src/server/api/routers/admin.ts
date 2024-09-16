import { env } from "@/env";
import {
  adminProcedure,
  createTRPCRouter,
  publicProcedure,
} from "@/server/api/trpc";
import { delegations, userBalloons, users } from "@/server/db/schema";
import { TRPCError } from "@trpc/server";
import { count, desc, eq, sum } from "drizzle-orm";
import { cookies } from "next/headers";
import { z } from "zod";

export const adminRouter = createTRPCRouter({
  authenticate: publicProcedure
    .input(z.object({ password: z.string() }))
    .mutation(async ({ input }) => {
      if (input.password !== env.ADMIN_PASSWORD) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }

      // expires in 7 days
      cookies().set("adminPassword", input.password, {
        expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      });
    }),

  authenticated: adminProcedure.query(async () => {
    return true;
  }),

  getBalloons: adminProcedure.query(async ({ ctx }) => {
    const balloons = await ctx.db.query.balloons.findMany();
    balloons.sort((a, b) => a.index - b.index);

    return balloons;
  }),

  getUserBalloons: adminProcedure
    .output(
      z.array(
        z.object({
          index: z.number(),
          userId: z.string(),
          hops: z.number(),
        }),
      ),
    )
    .query(async ({ ctx }) => {
      const currentBalloons = await ctx.db.query.userBalloons.findMany({
        columns: { userId: true },
        with: {
          balloon: { columns: { index: true } },
          delegation: {
            columns: {
              hops: true,
            },
          },
        },
      });
      return currentBalloons.map((b) => ({
        index: b.balloon.index,
        userId: b.userId,
        hops: b.delegation.hops,
      }));
    }),

  getNetworkGraphLinks: adminProcedure
    .input(z.object({ mainUserId: z.string().uuid() }))
    .output(
      z.array(
        z.object({
          source: z.string(),
          target: z.string(),
        }),
      ),
    )
    .query(async ({ ctx, input }) => {
      const userBalloons = await ctx.db.query.userBalloons.findMany({
        columns: { userId: true, balloonId: true },
        with: {
          delegation: {
            columns: { userId: true },
          },
        },
      });
      return userBalloons.map((ub) => {
        return {
          source:
            ub.delegation.userId === input.mainUserId
              ? "main-" + ub.balloonId
              : ub.delegation.userId,
          target: ub.userId,
        };
      });
    }),

  getUsernames: adminProcedure
    .output(
      z.array(
        z.object({
          id: z.string(),
          username: z.string(),
          walletAddress: z.string().nullable(),
        }),
      ),
    )
    .query(async ({ ctx }) => {
      return await ctx.db.query.users.findMany({
        columns: { id: true, username: true, walletAddress: true },
      });
    }),

  getDelegations: adminProcedure.query(async ({ ctx }) => {
    const delegations = await ctx.db.query.delegations.findMany({
      columns: { commission: true, totalCommission: true },
      with: {
        balloon: { columns: { index: true } },
      },
    });
    return delegations.map((d) => ({
      balloonIndex: d.balloon.index,
      commission: d.commission,
      totalCommission: d.totalCommission,
    }));
  }),

  getLeaderboard: adminProcedure.query(async ({ ctx }) => {
    const userBalloonCount = await ctx.db
      .select({
        userId: userBalloons.userId,
        username: users.username,
        totalCommission: sum(delegations.totalCommission),
        count: count(),
      })
      .from(userBalloons)
      .innerJoin(users, eq(userBalloons.userId, users.id))
      .innerJoin(delegations, eq(userBalloons.delegationId, delegations.id))
      .groupBy(userBalloons.userId, users.username);

    const sortedUserBalloonCount = userBalloonCount.sort(
      (a, b) => b.count - a.count,
    );
    const topUsers = sortedUserBalloonCount.slice(0, 10);

    return topUsers;
  }),

  getOffersCount: adminProcedure.query(async ({ ctx }) => {
    return await ctx.db
      .select({ count: count() })
      .from(delegations)
      .groupBy(delegations.userId)
      .orderBy(desc(count()));
  }),
});
