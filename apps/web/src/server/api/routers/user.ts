import { z } from "zod";
import { cookies } from "next/headers";

import {
  createTRPCRouter,
  privateProcedure,
  publicProcedure,
} from "@/server/api/trpc";
import { users } from "@/server/db/schema";
import { count, eq } from "drizzle-orm";

export const userRouter = createTRPCRouter({
  create: publicProcedure
    .input(
      z.object({
        username: z.string().min(3).max(20),
        avatarUrl: z.string().url(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const [user] = await ctx.db
        .insert(users)
        .values({
          username: input.username,
          avatarUrl: input.avatarUrl,
        })
        .returning({ id: users.id });

      if (!user) {
        throw new Error("Failed to create user");
      }

      // expires in 7 days
      cookies().set("session", user.id, {
        expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      });
    }),

  profile: privateProcedure.query(async ({ ctx }) => {
    const user = await ctx.db.query.users.findFirst({
      where: eq(users.id, ctx.user.id),
    });

    if (!user) {
      // Delete existing (invalid) session cookie
      cookies().delete("session");
      throw new Error("User not found");
    }

    return {
      id: user.id,
      username: user.username,
      walletAddress: user.walletAddress,
    };
  }),

  update: privateProcedure
    .input(z.object({ walletAddress: z.custom<`0x${string}`>() }))
    .mutation(async ({ ctx, input }) => {
      const user = await ctx.db.query.users.findFirst({
        where: eq(users.id, ctx.user.id),
      });

      if (!user) {
        throw new Error("User not found");
      }

      await ctx.db
        .update(users)
        .set({
          walletAddress: input.walletAddress,
        })
        .where(eq(users.id, ctx.user.id))
        .returning({ id: users.id });

      return { user };
    }),

  count: publicProcedure.query(async ({ ctx }) => {
    const queryResult = await ctx.db.select({ count: count() }).from(users);

    // Subtract 1 to exclude the user named "main"
    const userCount = (queryResult[0]?.count ?? 1) - 1;

    return userCount;
  }),
});
