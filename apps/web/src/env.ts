import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";
import { chainIdSchema } from "./lib/validators";

export const env = createEnv({
  /**
   * Specify your server-side environment variables schema here. This way you can ensure the app
   * isn't built with invalid env vars.
   */
  server: {
    NODE_ENV: z
      .enum(["development", "test", "production"])
      .default("development"),
    ADMIN_PASSWORD: z.string().min(3),
    DATABASE_URL: z.string().url(),
    DEPLOYER_PRIVATE_KEY: z.custom<`0x${string}`>(),
  },

  /**
   * Specify your client-side environment variables schema here. This way you can ensure the app
   * isn't built with invalid env vars. To expose them to the client, prefix them with
   * `NEXT_PUBLIC_`.
   */
  client: {
    NEXT_PUBLIC_BUNDLER_URL: z.string().url(),
    NEXT_PUBLIC_CHAIN_ID: chainIdSchema.default(31337),
    NEXT_PUBLIC_CHAIN_URL: z.string().url().default("http://127.0.0.1:8545"),
    NEXT_PUBLIC_PAYMASTER_URL: z.string().url(),
  },

  /**
   * You can't destruct `process.env` as a regular object in the Next.js edge runtimes (e.g.
   * middlewares) or client-side so we need to destruct manually.
   */
  runtimeEnv: {
    NODE_ENV: process.env.NODE_ENV,
    ADMIN_PASSWORD: process.env.ADMIN_PASSWORD,
    DATABASE_URL: process.env.DATABASE_URL,
    DEPLOYER_PRIVATE_KEY: process.env.DEPLOYER_PRIVATE_KEY,
    NEXT_PUBLIC_BUNDLER_URL: process.env.NEXT_PUBLIC_BUNDLER_URL,
    NEXT_PUBLIC_CHAIN_ID: Number(process.env.NEXT_PUBLIC_CHAIN_ID),
    NEXT_PUBLIC_CHAIN_URL: process.env.NEXT_PUBLIC_CHAIN_URL,
    NEXT_PUBLIC_PAYMASTER_URL: process.env.NEXT_PUBLIC_PAYMASTER_URL,
  },
  /**
   * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially
   * useful for Docker builds.
   */
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
  /**
   * Makes it so that empty strings are treated as undefined. `SOME_VAR: z.string()` and
   * `SOME_VAR=''` will throw an error.
   */
  emptyStringAsUndefined: true,
});
