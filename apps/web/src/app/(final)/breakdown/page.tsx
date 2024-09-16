import { Header } from "@/components/header";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatCommission, getFallbackName } from "@/lib/utils";
import { type RouterOutputs } from "@/trpc/react";
import { api } from "@/trpc/server";
import { MoveDownIcon } from "lucide-react";

const BalloonBreakdown = async ({
  chain: { chain, index },
}: {
  chain: RouterOutputs["game"]["breakdown"]["chains"][number];
}) => {
  const balloonCollectedByWinner = chain.length === 1;

  if (balloonCollectedByWinner) return null;

  return (
    <div className="flex w-full flex-col gap-1">
      <h3 className="text-sm font-medium">BALLOON {index + 1}</h3>
      <div className="grid gap-1 rounded-md bg-[#1C1C1E] p-4">
        <div className="flex justify-between text-sm font-medium leading-[22px] text-muted-foreground">
          <h4>SHARED BY</h4>
          <h4>COMMISSION</h4>
        </div>
        <div className="trucate flex w-full min-w-0 flex-col">
          {chain.slice(0, -1).map(({ avatarUrl, prize, username }, i) => (
            <div key={avatarUrl}>
              <div className="flex justify-between gap-1 text-sm">
                <div className="flex items-center gap-2 truncate p-0.5">
                  <Avatar className="h-6 w-6 ring-2 ring-white">
                    <AvatarImage src={avatarUrl} alt="avatar" />
                    <AvatarFallback>
                      {username.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <h4 className="truncate">{username}</h4>
                </div>
                <div className="flex items-center gap-3 text-nowrap">
                  <div>{`-${formatCommission(prize).percentage}`}</div>
                  <div className="text-[#95949B]">
                    {formatCommission(prize).eth}
                  </div>
                </div>
              </div>
              {i < chain.length - 2 && (
                <MoveDownIcon className="-mt-0.5 ml-0.5 text-muted-foreground" />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default async function BreakdownPage() {
  const { winner, chains } = await api.game.breakdown();

  return (
    <>
      <Header title="Breakdown of win" backPath="/over" />
      <div className="flex min-w-0 flex-1 flex-col gap-8 overflow-y-auto bg-background px-6 py-4">
        <div className="flex flex-col gap-1">
          <h3 className="text-sm font-medium">OVERALL WINNER</h3>
          <div className="flex justify-between rounded-md bg-secondary-foreground p-4 text-sm">
            <div className="flex items-center gap-2 truncate p-0.5">
              <Avatar className="h-6 w-6 ring-2 ring-white">
                <AvatarImage src={winner.avatarUrl} alt="avatar" />
                <AvatarFallback>
                  {getFallbackName(winner.username)}
                </AvatarFallback>
              </Avatar>
              <h4 className="truncate">{winner.username}</h4>
            </div>
            <div className="flex items-center text-nowrap">
              {formatCommission(winner.prize).eth}
            </div>
          </div>
        </div>
        <div className="grid gap-6">
          {chains.map((chain) => (
            <BalloonBreakdown key={chain.index} chain={chain} />
          ))}
        </div>
      </div>
    </>
  );
}
