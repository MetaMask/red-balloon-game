import type deployedContracts from "@/contracts/deployedContracts";
import { z } from "zod";

export const delegationSchema = z.object({
  delegate: z.custom<`0x${string}`>(),
  delegator: z.custom<`0x${string}`>(),
  authority: z.custom<`0x${string}`>(),
  caveats: z.array(
    z.object({
      enforcer: z.custom<`0x${string}`>(),
      terms: z.custom<`0x${string}`>(),
      args: z.custom<`0x${string}`>(),
    }),
  ),
  salt: z.bigint(),
  signature: z.custom<`0x${string}`>(),
});

export const chainIdSchema = z.custom<keyof typeof deployedContracts>();
