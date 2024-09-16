import { z } from "zod";
import { createTRPCRouter, privateProcedure } from "@/server/api/trpc";
import { eq } from "drizzle-orm";
import { delegations, transactions } from "@/server/db/schema";

export const transactionRouter = createTRPCRouter({
  create: privateProcedure
    .input(
      z.object({
        offerId: z.string().uuid(),
        /** Map of offer balloons and whether they were accepted or not
         * (index is balloon ID and value means whether it was accepted or not)
         */
        accepted: z.map(z.string().uuid(), z.boolean()),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const offerDelegations = await ctx.db.query.delegations.findMany({
        where: eq(delegations.offerId, input.offerId),
      });
      if (offerDelegations.length === 0) {
        throw new Error("Invalid offerId");
      }

      const tx = [];

      for (const d of offerDelegations) {
        tx.push({
          senderId: d.userId,
          recipientId: ctx.user.id,
          offerId: input.offerId,
          delegationId: d.id,
          accepted: input.accepted.get(d.balloonId) ?? false,
        });
      }

      await ctx.db.insert(transactions).values(tx);
    }),
});
