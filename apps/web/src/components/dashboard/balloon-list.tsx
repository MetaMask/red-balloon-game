"use client";

import { DashboardBalloon } from "@/components/dashboard/balloon";
import { BALLOON_COUNT } from "@/lib/constants";
import type { RouterOutputs } from "@/trpc/react";
import { useMemo } from "react";

export function DashboardBalloonList({
  allBalloons,
  userBalloons,
  delegations,
}: {
  allBalloons: RouterOutputs["admin"]["getBalloons"];
  userBalloons: RouterOutputs["admin"]["getUserBalloons"];
  delegations: RouterOutputs["admin"]["getDelegations"];
}) {
  const maxHops =
    userBalloons.length === 0
      ? 0
      : Math.max(...userBalloons.map((b) => b.hops));

  const delegationsByBalloonIndex = useMemo(
    () => getDelegationsByBalloonIndex(delegations, BALLOON_COUNT),
    [delegations],
  );

  return (
    <>
      <p className="text-sm font-medium leading-5 text-muted-foreground">
        Interpretation note: these lines tell you the total number of times
        collected, and then a breakdown of hops. That first number at hops=0 is
        the number of direct finds, when the balloon’s QR code was scanned. The
        second number is people who found it through one delegation. The numbers
        after the colon sum up to the number on the left.
      </p>
      {allBalloons.map((balloon) => (
        <DashboardBalloon
          key={balloon.index}
          balloon={balloon}
          userBalloonsFiltered={userBalloons.filter(
            (b) => b.index === balloon.index,
          )}
          maxHops={maxHops}
          delegationsOnThisBalloon={
            delegationsByBalloonIndex[balloon.index] ?? []
          }
        />
      ))}
    </>
  );
}

function getDelegationsByBalloonIndex(
  delegations: RouterOutputs["admin"]["getDelegations"],
  balloonCount: number,
) {
  const delegationsByBalloonIndex = new Array<
    RouterOutputs["admin"]["getDelegations"]
  >(balloonCount);

  for (let i = 0; i < delegationsByBalloonIndex.length; i++) {
    delegationsByBalloonIndex[i] = [];
  }

  for (const delegation of delegations) {
    const balloonIndex = delegation.balloonIndex;
    delegationsByBalloonIndex[balloonIndex]?.push(delegation);
  }

  return delegationsByBalloonIndex;
}
