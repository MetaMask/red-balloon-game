import { DashboardBalloonList } from "@/components/dashboard/balloon-list";
import { CommissionDistribution } from "@/components/dashboard/commission-distribution";
import Leaderboard from "@/components/dashboard/leaderboard";
import { OffersHistogram } from "@/components/dashboard/offers-histogram";
import { PlayerBalloonHistogram } from "@/components/dashboard/player-balloon-histogram";
import { Header } from "@/components/header";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { api } from "@/trpc/server";

export default async function DashboardPage() {
  const allBalloons = await api.admin.getBalloons();
  const userBalloons = await api.admin.getUserBalloons();
  const delegations = await api.admin.getDelegations();
  const userCount = await api.user.count();
  const offersCount = await api.admin.getOffersCount();

  return (
    <>
      <Header title="Dashboard" description="For the game masters." />
      <a
        href="/graph"
        className={cn(buttonVariants({ variant: "default" }), "w-fit")}
      >
        Go to Network Graph
      </a>
      Number of players: {userCount}
      <br />
      <br />
      <DashboardBalloonList
        allBalloons={allBalloons}
        userBalloons={userBalloons}
        delegations={delegations}
      />
      <br />
      <Leaderboard />
      <br />
      <PlayerBalloonHistogram userBalloons={userBalloons} />
      <br />
      <OffersHistogram offersCount={offersCount} />
      <br />
      <CommissionDistribution
        delegations={delegations}
        field="commission"
        title="Added Commission Distribution"
      />
      <br />
      <CommissionDistribution
        delegations={delegations}
        field="totalCommission"
        title="Total Commission Distribution"
      />
    </>
  );
}
