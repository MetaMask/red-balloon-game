import deployedContracts from "@/contracts/deployedContracts";
import { type GenericContract, getChainById } from "@/lib/contract";
import { env } from "@/env";
import { parseEther } from "viem";

export const BALLOON_CONTRACTS = Object.entries(
  deployedContracts[env.NEXT_PUBLIC_CHAIN_ID] as Record<
    string,
    GenericContract
  >,
)
  .filter(([key]) => key.match(/RedBalloon(\d+)/g))
  .map(([, contract]) => contract);

export const BALLOON_COUNT = BALLOON_CONTRACTS.length;

export const GAME_CONTRACT =
  deployedContracts[env.NEXT_PUBLIC_CHAIN_ID].TreasureHunt;

export const CHAIN = getChainById(env.NEXT_PUBLIC_CHAIN_ID);

export const PRIZE_ETH =
  deployedContracts[env.NEXT_PUBLIC_CHAIN_ID].TreasureHunt.linkedData.prizeEth;

export const PRIZE_WEI = parseEther(PRIZE_ETH.toString());

export const OFFER_LOWER_LIMIT = 0;
export const OFFER_UPPER_LIMIT = 100;
