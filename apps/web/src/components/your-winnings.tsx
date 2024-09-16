"use client";

import { cn, formatCommission } from "@/lib/utils";
import { type RouterOutputs } from "@/trpc/react";

type YourWinningsProps = {
  userBalloons: RouterOutputs["userBalloon"]["all"];
  hasAllBalloons: boolean;
};

export const YourWinnings = ({
  userBalloons,
  hasAllBalloons,
}: YourWinningsProps) => {
  const data = userBalloons.reduce(
    (acc, balloon) => {
      acc.prize -= balloon.totalCommission;
      acc.commission += balloon.totalCommission;
      return acc;
    },
    { prize: 100, commission: 0 },
  );
  const prize = formatCommission(data.prize);
  const commission = formatCommission(data.commission);
  return (
    <div className="col-span-2 m-6 mb-2 rounded-lg bg-primary px-4 py-2 font-medium">
      {hasAllBalloons && (
        <div
          className={cn(
            "flex justify-between",
            data.prize <= 0 && "text-accent",
          )}
        >
          <h3>YOUR WINNINGS</h3>
          <div className="flex gap-2">
            <p>{prize.percentage}</p>
            <p>{prize.eth}</p>
          </div>
        </div>
      )}
      <div className="flex justify-between text-muted-foreground">
        <h3>TOTAL COMMISSION</h3>
        <div className="flex gap-2">
          <p>{commission.percentage}</p>
          <p>{commission.eth}</p>
        </div>
      </div>
    </div>
  );
};
