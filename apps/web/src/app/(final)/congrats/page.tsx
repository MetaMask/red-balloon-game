import { Confetti } from "@/components/confetti";
import { CompanyName, FoxIcon } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { formatCommission, formatWalletAddress } from "@/lib/utils";
import { api } from "@/trpc/server";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function CongratsPage() {
  let winnings;
  let toRedirect = false;

  const user = await api.user.profile();

  try {
    winnings = await api.game.winnings();
  } catch (error) {
    toRedirect = true;
  }

  if (toRedirect) {
    redirect("/");
  }

  if (!winnings?.prize) {
    redirect("/over");
  }

  const prize = formatCommission(winnings.prize);
  const commission = formatCommission(100 - winnings.prize);
  const isWinner = winnings.winner;

  return (
    <main className="flex flex-1 flex-col items-center justify-between overflow-y-auto bg-[#E9EBEE] p-6 pt-[14vh] text-center font-euclid">
      <FoxIcon className="shrink-0" />
      <div className="grid gap-4 text-black">
        <h1 className="text-[48px] font-bold leading-[60px]">
          You won <br /> {prize.eth}!
        </h1>
        {user.walletAddress && (
          <p className="text-md font-bold">
            Your prize was sent to the address:{" "}
            {formatWalletAddress(user.walletAddress)}
          </p>
        )}
        {isWinner ? (
          <p className="text-lg font-bold">
            {commission.eth} was awarded to those that helped you along the way.
          </p>
        ) : (
          <p className="text-lg font-bold">
            You were awarded this for sharing a balloon with{" "}
            {winnings?.winnerUsername}
          </p>
        )}
      </div>
      <div className="flex flex-col items-center">
        <h3 className="text-[13px] font-bold text-black">BROUGHT TO YOU BY</h3>
        <div className="flex items-center gap-3">
          <FoxIcon className="h-6 w-6" />
          <CompanyName />
        </div>
      </div>
      <div className="grid w-full gap-4">
        <Link href="/over" className="w-full">
          <Button
            variant="default"
            size="lg"
            className="w-full text-base font-bold text-white"
          >
            Next
          </Button>
        </Link>
      </div>
      <Confetti />
    </main>
  );
}
