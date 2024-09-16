"use client";

import { type RouterOutputs, api } from "@/trpc/react";
import { ClaimWinDrawer } from "@/components/claim-win/drawer";
import { BALLOON_COUNT } from "@/lib/constants";

type ClaimWinProps = {
  userBalloons: RouterOutputs["userBalloon"]["all"];
};

export function ClaimWin({ userBalloons }: ClaimWinProps) {
  const { data: chains } = api.delegation.chains.useQuery();
  const { data: user } = api.user.profile.useQuery();

  if (!chains || !user || !userBalloons) return null;

  if (userBalloons.length !== BALLOON_COUNT) return null;

  return (
    <ClaimWinDrawer chains={chains} user={user} userBalloons={userBalloons} />
  );
}
