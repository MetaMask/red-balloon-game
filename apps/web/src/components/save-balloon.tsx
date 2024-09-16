"use client";

import { delegationToString } from "@/lib/delegator";
import { useBalloons } from "@/providers/Balloon";
import { useEffect } from "react";
import type { DelegationStruct, Hex } from "@codefi/delegator-core-viem";

type Address = Hex;

export const SaveBalloon = ({
  delegations,
}: {
  delegations: {
    delegation: DelegationStruct;
    hash: Address;
    pk: Hex;
    index: number;
  }[];
}) => {
  const { saveBalloon } = useBalloons();

  useEffect(() => {
    for (const d of delegations) {
      saveBalloon({
        index: d.index.toString(),
        hash: d.hash,
        pk: d.pk,
        delegation: delegationToString(d.delegation),
      });
    }
  }, [delegations, saveBalloon]);

  return null;
};
