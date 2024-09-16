"use client";

import { cn, formatCommission } from "@/lib/utils";
import { CheckmarkIcon, CircleInfoIcon } from "./icons";
import { CommissionDrawer } from "./commission-drawer";
import { type RouterOutputs } from "@/trpc/react";

type BalloonCardProps = {
  enabledSelection?: boolean;
  selected?: boolean;
  onSelect?: (number: number) => void;
  userBalloon: RouterOutputs["userBalloon"]["all"][number];
};

export const BalloonCard = ({
  enabledSelection,
  selected,
  onSelect,
  userBalloon,
}: BalloonCardProps) => {
  const isSelected = enabledSelection && selected;
  const isUnselected = enabledSelection && !selected;
  const { percentage, eth } = formatCommission(
    userBalloon.totalCommission ?? 0,
  );

  const onClick = () => {
    onSelect?.(userBalloon.index);
  };

  return (
    <div
      className={cn(
        "flex flex-col gap-1 animate-in fade-in-0",
        enabledSelection && "cursor-pointer",
      )}
      onClick={onClick}
    >
      <div
        className={cn(
          "relative flex max-w-56 justify-end rounded-xl bg-primary bg-contain bg-right-bottom bg-no-repeat outline outline-1 transition-all",
          isSelected ? "outline-secondary" : "outline-transparent",
        )}
        style={{
          backgroundImage: "url('/images/red-balloon.png')",
        }}
      >
        <div className="relative h-0 w-full pt-[100%]">
          <div className="absolute bottom-0 left-0 right-0 top-0">
            <div className="absolute left-3 top-3">
              {isUnselected && (
                <div className="h-6 w-6 rounded-full border border-secondary" />
              )}
              {isSelected && (
                <CheckmarkIcon className="h-6 w-6 text-secondary" />
              )}
            </div>
            <div className="absolute bottom-0 left-4 text-4xl font-bold leading-[64px] text-muted-foreground">
              {userBalloon.index + 1}
            </div>
          </div>
        </div>
      </div>
      {!!userBalloon.totalCommission && (
        <CommissionDrawer userBalloon={userBalloon}>
          <div className="flex cursor-pointer flex-col">
            <div className="flex justify-between">
              <div className="text-sm font-medium text-muted-foreground">
                COMMISSION
              </div>
              <CircleInfoIcon className="h-4 w-4 text-secondary" />
            </div>

            <div className="flex items-center gap-4 font-medium">
              <span>{percentage}</span>
              <span>{eth}</span>
            </div>
          </div>
        </CommissionDrawer>
      )}
    </div>
  );
};
