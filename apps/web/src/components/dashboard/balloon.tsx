import type { RouterOutputs } from "@/trpc/react";

export function DashboardBalloon({
  balloon,
  userBalloonsFiltered,
  maxHops,
  delegationsOnThisBalloon,
}: {
  balloon: RouterOutputs["admin"]["getBalloons"][0];
  userBalloonsFiltered: RouterOutputs["admin"]["getUserBalloons"];
  maxHops: number;
  delegationsOnThisBalloon: RouterOutputs["admin"]["getDelegations"];
}) {
  const sortedDelegations = delegationsOnThisBalloon
    .filter((a) => a?.totalCommission > 0)
    .sort((a, b) => a?.totalCommission - b?.totalCommission);

  const lowCommission = sortedDelegations[0]?.totalCommission;
  const medianCommission = median(sortedDelegations);
  const highCommission =
    sortedDelegations[sortedDelegations.length - 1]?.totalCommission;

  return (
    <div style={{ marginTop: "10px" }}>
      <p>
        Balloon #{balloon.index + 1} collected {userBalloonsFiltered.length}{" "}
        times at hops:
        {[...Array(maxHops + 1).keys()].map(
          (hops) =>
            " " + userBalloonsFiltered.filter((b) => b.hops === hops).length,
        )}
      </p>
      <p>id: {balloon.id}</p>
      <p>
        Offers made: {sortedDelegations.length}&nbsp;&nbsp;Commissions: Low{" "}
        {lowCommission}%, Median {medianCommission}%, High {highCommission}%
      </p>
    </div>
  );
}

function median(arr: RouterOutputs["admin"]["getDelegations"]): number {
  if (arr.length === 0) {
    return 0;
  }
  const mid = arr.length >> 1;
  return arr.length % 2
    ? arr[mid]!.totalCommission
    : (arr[mid - 1]!.totalCommission + arr[mid]!.totalCommission) / 2;
}
