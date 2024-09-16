import {
  createCallerFactory,
  createTRPCRouter,
  privateProcedure,
} from "@/server/api/trpc";
import { eq } from "drizzle-orm";
import { delegations } from "@/server/db/schema";
import { type DelegationStruct } from "@codefi/delegator-core-viem";
import { ROOT_AUTHORITY } from "@/lib/delegator";
import { userBalloonRouter } from "./user-balloon";
import { BALLOON_COUNT } from "@/lib/constants";

export const delegationRouter = createTRPCRouter({
  chains: privateProcedure.query(async ({ ctx }) => {
    const userBalloonApi = createCallerFactory(userBalloonRouter)(ctx);

    const userBalloons = await userBalloonApi.all();

    if (userBalloons.length < BALLOON_COUNT) {
      throw new Error("User does not have all balloons");
    }

    const chains = userBalloons.reduce(
      (acc, { index }) => {
        acc[index] = [];
        return acc;
      },
      {} as Record<string, DelegationStruct[]>,
    );

    for (const { index, delegation } of userBalloons) {
      chains[index]!.push({ ...delegation });
      let d = delegation;

      while (d.authority !== ROOT_AUTHORITY) {
        const parent = await ctx.db.query.delegations.findFirst({
          where: eq(delegations.hash, d.authority),
        });
        if (!parent) {
          throw new Error(`Delegation not found for hash: ${d.authority}`);
        }
        d = parent.delegation;
        chains[index]!.push({ ...d });
      }
    }

    return chains;
  }),
});
