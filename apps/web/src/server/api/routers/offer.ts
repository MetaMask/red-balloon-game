import { delegationSchema } from "@/lib/validators";
import { createTRPCRouter, privateProcedure } from "@/server/api/trpc";
import {
  delegations,
  offers,
  transactions,
  userBalloons,
} from "@/server/db/schema";
import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { getDelegationHashOffchain } from "@codefi/delegator-core-viem";

export const offerRouter = createTRPCRouter({
  created: privateProcedure.query(async ({ ctx }) => {
    const res = await ctx.db.query.offers.findMany({
      where: eq(offers.createdBy, ctx.user.id),
    });
    return res.length;
  }),

  create: privateProcedure
    .input(
      z.object({
        delegations: z.array(
          z.object({
            delegation: delegationSchema,
            balloonIndex: z.number(),
            commission: z.number(),
          }),
        ),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const offer = await ctx.db
        .insert(offers)
        .values({
          createdBy: ctx.user.id,
        })
        .returning({ id: offers.id });

      if (!offer[0]) {
        throw new Error("Failed to create offer");
      }

      const offerId = offer[0].id;

      const newDelegations = [];

      for (const d of input.delegations) {
        const parentDelegation = await ctx.db.query.delegations.findFirst({
          where: eq(delegations.hash, d.delegation.authority),
        });

        if (!parentDelegation) {
          throw new Error("Invalid parent delegation");
        }

        newDelegations.push({
          offerId,
          hash: getDelegationHashOffchain(d.delegation),
          balloonId: parentDelegation.balloonId,
          commission: d.commission,
          totalCommission: parentDelegation.totalCommission + d.commission,
          hops: parentDelegation.hops + 1,
          userId: ctx.user.id,
          delegation: d.delegation,
          authority: d.delegation.authority,
        });
      }

      await ctx.db.insert(delegations).values(newDelegations);

      return {
        offerId,
      };
    }),

  claim: privateProcedure
    .input(
      z.object({
        offerId: z.string().uuid(),
      }),
    )
    .output(
      z.object({
        sender: z.object({
          username: z.string(),
          avatarUrl: z.string(),
        }),
        balloons: z.array(
          z.object({
            index: z.number(),
            accepted: z.boolean(),
            incoming: z.object({
              commission: z.number(),
              hash: z.custom<`0x${string}`>(),
              delegation: delegationSchema,
            }),
            current: z
              .object({
                commission: z.number(),
                hash: z.custom<`0x${string}`>(),
              })
              .optional(),
          }),
        ),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const offerDelegations = await ctx.db.query.delegations.findMany({
        where: eq(delegations.offerId, input.offerId),
        with: {
          balloon: { columns: { index: true } },
          user: { columns: { id: true, username: true, avatarUrl: true } },
        },
      });
      if (offerDelegations.length === 0) {
        throw new Error("Invalid offerId");
      }

      // Check that this user has not already claimed this offer
      const offerTx = await ctx.db.query.transactions.findFirst({
        where: and(
          eq(transactions.senderId, offerDelegations[0]!.user.id),
          eq(transactions.recipientId, ctx.user.id),
          eq(transactions.offerId, input.offerId),
        ),
      });
      if (offerTx) {
        throw new Error("User already claimed this offer");
      }

      const currentBalloons = await ctx.db.query.userBalloons.findMany({
        where: eq(userBalloons.userId, ctx.user.id),
        with: {
          balloon: { columns: { index: true } },
          delegation: { columns: { totalCommission: true, hash: true } },
        },
      });

      const offerInfo = {
        sender: {
          username: offerDelegations[0]!.user.username,
          avatarUrl: offerDelegations[0]!.user.avatarUrl,
        },
        balloons: new Array<{
          index: number;
          accepted: boolean;
          incoming: {
            commission: number;
            hash: `0x${string}`;
            delegation: z.infer<typeof delegationSchema>;
          };
          current?: {
            commission: number;
            hash: `0x${string}`;
          };
        }>(),
      };

      const insertTransactions = [];

      /*
       * For each offered balloon, check if we already have one and
       * compare the commissions to see if we want to accept it.
       */
      for (const d of offerDelegations) {
        let accepted = false;
        const currentBalloon = currentBalloons.find(
          (b) => b.balloonId === d.balloonId,
        );

        // If this is a new balloon OR a better balloon, accept it
        if (
          !currentBalloon ||
          d.totalCommission < currentBalloon.delegation.totalCommission
        ) {
          accepted = true;
          // Create new userBalloon or update current to point to the new/better delegation
          await ctx.db
            .insert(userBalloons)
            .values({
              balloonId: d.balloonId,
              userId: ctx.user.id,
              delegationId: d.id,
            })
            .onConflictDoUpdate({
              target: [userBalloons.userId, userBalloons.balloonId],
              set: {
                updatedAt: new Date(),
                delegationId: d.id,
              },
            });
        }

        offerInfo.balloons.push({
          index: d.balloon.index,
          accepted,
          incoming: {
            commission: d.totalCommission,
            hash: d.hash,
            delegation: d.delegation,
          },
          current: currentBalloon
            ? {
                commission: currentBalloon.delegation.totalCommission,
                hash: currentBalloon.delegation.hash,
              }
            : undefined,
        });

        insertTransactions.push({
          senderId: offerDelegations[0]!.user.id,
          recipientId: ctx.user.id,
          offerId: input.offerId,
          delegationId: d.id,
          balloonId: d.balloonId,
          accepted,
        });
      }

      // Update the transactions table
      await ctx.db.insert(transactions).values(insertTransactions);

      return offerInfo;
    }),
});
