import { BALLOON_COUNT } from "@/lib/constants";
import { ROOT_AUTHORITY } from "@/lib/delegator";
import {
  createTRPCRouter,
  privateProcedure,
  publicProcedure,
} from "@/server/api/trpc";
import {
  balloons,
  delegations,
  userBalloons,
  winners,
} from "@/server/db/schema";
import { count, eq } from "drizzle-orm";
import { z } from "zod";

export const gameRouter = createTRPCRouter({
  over: publicProcedure.query(async ({ ctx }) => {
    const len = await ctx.db.select({ count: count() }).from(winners);
    return !!len[0]?.count;
  }),

  claimWin: privateProcedure
    .input(
      z.object({
        winnerAddress: z.custom<`0x${string}`>(),
        receiptHash: z.custom<`0x${string}`>(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      //Need to check if contract winner is the same as the winnerAddress input (this should be returned from the claimWin api function)
      console.log("Winner:", input.winnerAddress);

      const currentBalloons = await ctx.db.query.userBalloons.findMany({
        where: eq(userBalloons.userId, ctx.user.id),
        with: {
          balloon: { columns: { index: true } },
          delegation: {
            columns: {
              commission: true,
              hash: true,
              delegation: true,
              hops: true,
            },
            with: {
              user: true,
            },
          },
        },
      });

      currentBalloons.sort((a, b) => a.balloon.index - b.balloon.index);

      //We check if current user has all balloons
      if (currentBalloons.length !== BALLOON_COUNT) {
        throw new Error("Not all balloons collected");
      }

      //Initialize chains for every balloon
      const chains = currentBalloons.reduce(
        (acc, { balloon: { index } }) => {
          acc[index] = [];
          return acc;
        },
        {} as Record<
          string,
          {
            authority: string;
            commission: number;
            user: { id: string; username: string; avatarUrl: string };
          }[]
        >,
      );

      //Iterate over all balloons and create chains
      for (const {
        balloon: { index },
        delegation: {
          commission,
          delegation: { authority },
          user,
        },
      } of currentBalloons) {
        const delegationInfo = { authority, commission, user };
        chains[index]!.push({ authority, commission, user });

        let d = { ...delegationInfo };

        while (d.authority !== ROOT_AUTHORITY) {
          const parent = await ctx.db.query.delegations.findFirst({
            where: eq(delegations.hash, d.authority),
            with: {
              user: true,
            },
          });
          if (!parent) {
            throw new Error(`Delegation not found for hash: ${d.authority}`);
          }
          d = {
            authority: parent.delegation.authority,
            commission: parent.commission,
            user: parent.user,
          };
          chains[index]!.push({ ...d });
        }

        //Reverse the chain to get the correct order and update the winningChain in the database
        await ctx.db
          .update(balloons)
          .set({
            winningChain: chains[index]?.map(
              ({ user: { avatarUrl, username }, commission }) => ({
                avatarUrl,
                username,
                prize: commission,
              }),
            ),
          })
          .where(eq(balloons.index, index));
      }

      //Create winners object to store the winners and their prizes
      const userWinners: Record<
        string,
        { prize: number; winner: boolean; receiptHash: `0x${string}` | null }
      > = {};

      //Initialize the winner prize
      let winnerPrize = 100;

      //Iterate over all chains and calculate the prizes
      for (const [, chain] of Object.entries(chains)) {
        for (const {
          user: { id },
          commission,
        } of chain) {
          if (!userWinners[id]) {
            userWinners[id] = { prize: 0, winner: false, receiptHash: null };
          }
          userWinners[id].prize += commission;
          winnerPrize -= commission;
        }
      }

      //Update the winner user object with the winner prize and set the winner flag
      userWinners[ctx.user.id] = {
        winner: true,
        prize: winnerPrize,
        receiptHash: input.receiptHash,
      };

      //Insert the winners into the database
      await ctx.db.insert(winners).values(
        Object.entries(userWinners).map(
          ([userId, { prize, winner, receiptHash }]) => ({
            prize,
            userId,
            winner,
            receiptHash,
          }),
        ),
      );

      console.log("Winner Users");
      console.log(userWinners);

      return true;
    }),

  winnings: privateProcedure
    .output(
      z
        .object({
          prize: z.number(),
          winner: z.boolean(),
          winnerUsername: z.string(),
          receiptHash: z.custom<`0x${string}`>().nullable(),
        })
        .nullable(),
    )
    .query(async ({ ctx }) => {
      const winnerStats = await ctx.db.query.winners.findFirst({
        where: eq(winners.winner, true),
        with: { user: true },
      });

      if (!winnerStats) {
        return null;
      }

      const userStats = await ctx.db.query.winners.findFirst({
        where: eq(winners.userId, ctx.user.id),
      });

      if (!userStats) {
        return {
          prize: 0,
          winner: false,
          winnerUsername: winnerStats.user.username,
          receiptHash: winnerStats.receiptHash,
        };
      }

      return {
        prize: userStats.prize,
        winner: userStats.winner,
        winnerUsername: winnerStats.user.username,
        receiptHash: winnerStats.receiptHash,
      };
    }),

  breakdown: privateProcedure
    .output(
      z.object({
        winner: z.object({
          username: z.string(),
          avatarUrl: z.string(),
          prize: z.number(),
        }),
        chains: z.array(
          z.object({
            index: z.number(),
            chain: z.array(
              z.object({
                prize: z.number(),
                username: z.string(),
                avatarUrl: z.string(),
              }),
            ),
          }),
        ),
      }),
    )
    .query(async ({ ctx }) => {
      const balloonList = await ctx.db.query.balloons.findMany();
      const winner = await ctx.db.query.winners.findFirst({
        where: eq(winners.winner, true),
        with: { user: true },
      });
      if (!winner) {
        throw new Error("No winner found");
      }
      return {
        winner: {
          prize: winner.prize,
          avatarUrl: winner.user.avatarUrl,
          username: winner.user.username,
        },
        chains: balloonList.map(({ winningChain, index }) => {
          if (!winningChain) {
            throw new Error("No winning chain found");
          }
          return { index, chain: winningChain };
        }),
      };
    }),
});
