import { NetworkGraph } from "@/components/dashboard/network-graph";
import { Header } from "@/components/header";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { api } from "@/trpc/server";

export default async function GraphPage() {
  const usernames = await api.admin.getUsernames();
  const balloons = await api.admin.getBalloons();

  const mainUserId = usernames.find((u) => u.username === "main")!.id;
  const networkGraphLinks = await api.admin.getNetworkGraphLinks({
    mainUserId,
  });

  // Add fake users for balloon QR codes
  balloons.forEach((b) => {
    usernames.push({
      id: "main-" + b.id,
      // x: 2048 + Math.cos((b.index / balloons.length) * Math.PI * 2) * 100,
      // y: 2048 + Math.sin((b.index / balloons.length) * Math.PI * 2) * 100,
      username: "Balloon QR " + (b.index + 1),
      walletAddress: null,
    });
  });

  // Filter to only show users that have links
  const linkedUsernames = usernames.filter((u) =>
    networkGraphLinks.some(
      (item) => item.source === u.id || item.target === u.id,
    ),
  );
  return (
    <>
      <Header title="Graph" description="Viz it." />
      <a
        href="/dashboard"
        className={cn(buttonVariants({ variant: "default" }), "w-fit")}
      >
        Go to Admin Dashboard
      </a>
      <NetworkGraph nodes={linkedUsernames} links={networkGraphLinks} />
    </>
  );
}
