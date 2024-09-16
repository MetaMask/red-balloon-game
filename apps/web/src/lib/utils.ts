import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
export { stringify, parse } from "superjson";
import { createPublicClient, fromHex, type Hex, http } from "viem";
import { mainnet } from "viem/chains";
import { v4 as uuidv4 } from "uuid";
import {
  OFFER_LOWER_LIMIT,
  OFFER_UPPER_LIMIT,
  PRIZE_ETH,
} from "@/lib/constants";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const buildOfferUrl = ({
  id,
  pk,
}: {
  id: string;
  pk: `0x${string}`;
}) => {
  if (typeof window === "undefined") return "";
  const baseUrl =
    window.location.protocol +
    "//" +
    window.location.hostname +
    (window.location.port ? ":" + window.location.port : "");
  return `${baseUrl}/offer/${id}?pk=${pk}`;
};

export const buildInviteLink = () => {
  if (typeof window === "undefined") return "";
  const baseUrl =
    window.location.protocol +
    "//" +
    window.location.hostname +
    (window.location.port ? ":" + window.location.port : "");
  return baseUrl;
};

export const formatCommission = (commission: number) => {
  if (!commission) return { percentage: "0%", eth: "0 ETH" };
  const eth = PRIZE_ETH * (commission / 100);
  return {
    percentage: `${parseFloat(commission.toFixed(2))}%`,
    eth: `${eth.toFixed(2)} ETH`,
  };
};

export const commissionInWei = (prizePoolWei: bigint, commission: bigint) => {
  return (prizePoolWei * commission) / BigInt(100);
};

export const getFallbackName = (name: string) =>
  name.substring(0, 2).toUpperCase();

export const validateAddress = async (address: string) => {
  if (address.startsWith("0x") && address.length === 42) {
    return true;
  }
  if (address.endsWith(".eth")) {
    return true;
  }
  return false;
};

export const transformAddress = async (address: string) => {
  if (address.startsWith("0x") && address.length === 42) {
    return address;
  }
  const publicClient = createPublicClient({
    chain: mainnet,
    transport: http(),
  });
  const walletAddress = await publicClient.getEnsAddress({ name: address });
  if (!walletAddress) {
    throw new Error("Invalid ENS address");
  }
  return walletAddress;
};

export const isCommissionInRange = (commission?: string) => {
  return (
    Number(commission) >= OFFER_LOWER_LIMIT &&
    Number(commission) <= OFFER_UPPER_LIMIT
  );
};

export const isCommissionInteger = (commission?: string) => {
  return Number.isInteger(Number(commission));
};

export const formatWalletAddress = (address: string) => {
  return `${address.substring(0, 6)}...${address.substring(38)}`;
};

export function generateUuids(count: number): string[] {
  const uuids: string[] = [];
  for (let i = 0; i < count; i++) {
    uuids.push(uuidv4());
  }
  console.table(uuids);
  return uuids;
}

// Define valid Solidity types
type SolidityType =
  | "address"
  | "uint256"
  | "int256"
  | "bytes32"
  | "string"
  | "bool";

// Map Solidity types to TypeScript types
type SolidityTypeMap<T> = T extends "address"
  ? string
  : T extends "uint256" | "int256" | "bytes32"
    ? bigint
    : T extends "bool"
      ? boolean
      : T extends "string"
        ? string
        : never;

// Convert an array of Solidity types into a tuple of corresponding TypeScript types
type DecodedTypes<T extends SolidityType[]> = {
  [K in keyof T]: SolidityTypeMap<T[K]>;
};

/**
 * Decodes packed data back to its original values.
 * @param packedData The packed hexadecimal string.
 * @param types An array of Solidity types corresponding to the original data structure.
 * @returns The decoded values as a tuple of the appropriate TypeScript types.
 */
export function decodePacked<T extends SolidityType[]>(
  packedData: Hex,
  types: [...T],
): DecodedTypes<T> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const decodedValues: any[] = [];
  let currentOffset = 0;

  const data = packedData.slice(2);

  for (const type of types) {
    let value;
    switch (type) {
      case "address":
        value = "0x" + data.slice(currentOffset, currentOffset + 40);
        currentOffset += 40;
        break;
      case "uint256":
      case "int256":
      case "bytes32":
        value = BigInt("0x" + data.slice(currentOffset, currentOffset + 64));
        currentOffset += 64;
        break;
      case "bool":
        value = data.slice(currentOffset, currentOffset + 2) === "01";
        currentOffset += 2;
        break;
      case "string":
        let endOffset = data.indexOf("00", currentOffset);
        if (endOffset === -1) endOffset = data.length;
        value = fromHex(data.slice(currentOffset, endOffset) as Hex, "string");
        currentOffset = endOffset;
        break;
      default:
        throw new Error(`Unsupported Solidity type: ${type}`);
    }

    decodedValues.push(value);
  }

  return decodedValues as DecodedTypes<T>;
}
