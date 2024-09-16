"use client";

import { useCallback, useMemo, useState } from "react"; // Import the useState function from React
import { type RouterOutputs } from "@/trpc/react";
import { BalloonCard } from "@/components/balloon-card";
import { EmptyCard } from "@/components/empty-card";
import { ShareButton } from "@/components/share-button";

export type UserBalloonsType = RouterOutputs["userBalloon"]["all"];

export const BalloonList = ({
  userBalloons,
  selectable,
}: {
  userBalloons: UserBalloonsType;
  selectable?: boolean;
}) => {
  const [selectedBalloons, setSelectedBalloons] = useState<Set<string>>(
    new Set(),
  );

  const hasBalloons = Array.isArray(userBalloons) && userBalloons.length > 0;

  const onSelectBalloon = useCallback((index: number) => {
    setSelectedBalloons((prevSelectedBalloons) => {
      const newSelectedBalloons = new Set(prevSelectedBalloons);
      if (newSelectedBalloons.has(index.toString())) {
        newSelectedBalloons.delete(index.toString());
      } else {
        newSelectedBalloons.add(index.toString());
      }
      return newSelectedBalloons;
    });
  }, []);

  const delegations = useMemo(
    () =>
      [...selectedBalloons].map((index) => ({
        index,
        commission:
          userBalloons.find((b) => b.index === Number(index))
            ?.totalCommission ?? 0,
      })),
    [selectedBalloons, userBalloons],
  );

  return (
    <>
      {hasBalloons ? (
        <main className="relative flex-1 overflow-y-auto px-6 py-4">
          <div className="grid grid-cols-2 gap-6 pb-32 md:grid-cols-4 lg:grid-cols-5">
            {userBalloons.map((userBalloon) => (
              <BalloonCard
                key={userBalloon.index}
                enabledSelection={selectable}
                selected={selectedBalloons.has(userBalloon.index.toString())}
                onSelect={onSelectBalloon}
                userBalloon={userBalloon}
              />
            ))}
          </div>
        </main>
      ) : (
        <EmptyCard>
          <>
            <div className="text-xl font-semibold">No balloons found yet</div>
            <div className="text-sm text-muted-foreground">
              Find balloons and scan their QR codes, or find a friend and have
              them share a balloon with you.
            </div>
          </>
        </EmptyCard>
      )}
      {!!selectedBalloons.size && selectable && (
        <ShareButton delegations={delegations} />
      )}
    </>
  );
};
