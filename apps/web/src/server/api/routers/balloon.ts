import { createTRPCRouter, privateProcedure } from "@/server/api/trpc";
import { balloons } from "@/server/db/schema";
import { createCallerFactory } from "@/server/api/trpc";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { offerRouter } from "./offer";
import { delegationSchema } from "@/lib/validators";

export const balloonRouter = createTRPCRouter({
  byId: privateProcedure
    .input(z.object({ balloonId: z.string().uuid() }))
    .output(
      z
        .object({
          index: z.number(),
          pk: z.string(),
          offerId: z.string().uuid(),
        })
        .nullable()
        .optional(),
    )
    .query(async ({ ctx, input }) => {
      return await ctx.db.query.balloons.findFirst({
        where: eq(balloons.id, input.balloonId),
      });
    }),

  claim: privateProcedure
    .input(z.object({ balloonId: z.string().uuid() }))
    .output(
      z.object({
        index: z.number(),
        pk: z.custom<`0x${string}`>(),
        hash: z.custom<`0x${string}`>(),
        delegation: delegationSchema,
        replaces: z
          .object({
            hash: z.string(),
            commission: z.number(),
          })
          .optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const balloon = await ctx.db.query.balloons.findFirst({
        where: eq(balloons.id, input.balloonId),
      });
      if (!balloon) {
        throw new Error("Balloon not found");
      }
      const offerApi = createCallerFactory(offerRouter)(ctx);
      const res = await offerApi.claim({ offerId: balloon.offerId });
      return {
        index: balloon.index,
        pk: balloon.pk,
        hash: res.balloons[0]!.incoming.hash,
        delegation: res.balloons[0]!.incoming.delegation,
        replaces: res.balloons[0]!.current,
      };
    }),
});
