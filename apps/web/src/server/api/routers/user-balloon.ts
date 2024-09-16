import { createTRPCRouter, privateProcedure } from "@/server/api/trpc";
import { userBalloons } from "@/server/db/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { delegationSchema } from "@/lib/validators";

export const userBalloonRouter = createTRPCRouter({
  all: privateProcedure
    .output(
      z.array(
        z.object({
          index: z.number(),
          delegationHash: z.string(),
          totalCommission: z.number(),
          delegation: delegationSchema,
          commission: z.number(),
          hops: z.number(),
          fromUser: z.string(),
          fromUserAvatar: z.string(),
        }),
      ),
    )
    .query(async ({ ctx }) => {
      const currentBalloons = await ctx.db.query.userBalloons.findMany({
        where: eq(userBalloons.userId, ctx.user.id),
        with: {
          balloon: { columns: { index: true } },
          delegation: {
            columns: {
              totalCommission: true,
              hash: true,
              delegation: true,
              hops: true,
              commission: true,
            },
            with: { user: { columns: { username: true, avatarUrl: true } } },
          },
        },
      });
      return currentBalloons
        .map((b) => ({
          index: b.balloon.index,
          delegationHash: b.delegation.hash,
          totalCommission: b.delegation.totalCommission,
          delegation: b.delegation.delegation,
          commission: b.delegation.commission,
          hops: b.delegation.hops,
          fromUser: b.delegation.user.username,
          fromUserAvatar: b.delegation.user.avatarUrl,
        }))
        .sort((a, b) => a.index - b.index);
    }),
});
