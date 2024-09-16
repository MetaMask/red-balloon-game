import type { Abi, Address } from "viem";
import { sepolia, type Chain } from "viem/chains";
import { hardhat, linea, lineaSepolia } from "viem/chains";
import type deployedContracts from "@/contracts/deployedContracts";

export type InheritedFunctions = Readonly<Record<string, string>>;

export type GenericContract = {
  address: Address;
  abi: Abi;
  value?: bigint;
  inheritedFunctions?: InheritedFunctions;
  external?: true;
};

export type GenericContractsDeclaration = Record<
  number,
  Record<string, GenericContract>
>;

export type ValidChainId = keyof typeof deployedContracts;

export function getChainById(chainId?: number): Chain {
  switch (chainId) {
    case hardhat.id:
      return hardhat;
    case sepolia.id:
      return sepolia;
    case lineaSepolia.id:
      return lineaSepolia;
    case linea.id:
      return linea;
    default:
      throw new Error(`Unsupported chainId: ${chainId}`);
  }
}
