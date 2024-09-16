import { createCallerFactory, createTRPCRouter } from "@/server/api/trpc";
import { balloonRouter } from "@/server/api/routers/balloon";
import { delegationRouter } from "@/server/api/routers/delegation";
import { offerRouter } from "@/server/api/routers/offer";
import { transactionRouter } from "@/server/api/routers/transaction";
import { userRouter } from "@/server/api/routers/user";
import { userBalloonRouter } from "@/server/api/routers/user-balloon";
import { adminRouter } from "@/server/api/routers/admin";
import { gameRouter } from "@/server/api/routers/game";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  admin: adminRouter,
  game: gameRouter,
  balloon: balloonRouter,
  delegation: delegationRouter,
  offer: offerRouter,
  transaction: transactionRouter,
  user: userRouter,
  userBalloon: userBalloonRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;

/**
 * Create a server-side caller for the tRPC API.
 * @example
 * const trpc = createCaller(createContext);
 * const res = await trpc.post.all();
 *       ^? Post[]
 */
export const createCaller = createCallerFactory(appRouter);
