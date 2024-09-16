import {
  AddFriendIcon,
  CompanyName,
  DoorIcon,
  ExternalUrlIcon,
  GasLessIcon,
  FoxIcon,
} from "@/components/icons";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { api } from "@/trpc/server";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function GameOverPage() {
  const winnings = await api.game.winnings();

  if (!winnings) {
    return redirect("/");
  }

  const wonPrize = !!winnings?.prize;

  return (
    <main className="fullscreen flex flex-col overflow-y-auto bg-white font-euclid text-black">
      <div className="flex items-center justify-between gap-4 bg-secondary-foreground px-6 py-8">
        {wonPrize ? (
          <div className="flex flex-col gap-2">
            <h1 className="text-4xl font-bold text-primary-foreground">
              Congrats!
            </h1>
            <p className="text-[18px] font-medium text-white">
              Prize should be delivered on Linea soon.
              <Link
                href={`http://localhost:5100/tx/${winnings.receiptHash}`}
                className="flex items-center gap-2 text-base uppercase text-muted-foreground"
                target="_blank"
              >
                View Transaction <ExternalUrlIcon />
              </Link>
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            <h1 className="text-4xl text-primary-foreground">Game Over</h1>
            <p className="text-[18px] font-medium text-white">
              Sorry you didn’t win.
              <Link
                href={`https://lineascan.build/tx/${winnings.receiptHash}`}
                className="flex items-center gap-2 text-muted-foreground"
                target="_blank"
              >
                See TX <ExternalUrlIcon />
              </Link>
            </p>
          </div>
        )}
        <FoxIcon className="h-24 w-auto" />
      </div>
      <div className="flex flex-col gap-6 p-6">
        <div>
          <div>
            <h3 className="text-lg font-bold">
              Built with the new MetaMask Delegation Toolkit
            </h3>
            <p>
              The quickest path to your users&apos; first aha moments in web3.
            </p>
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <h3 className="text-sm font-medium uppercase">FEATURES USED</h3>
          <div className="flex flex-col gap-4">
            <div className="flex gap-2">
              <DoorIcon className="shrink-0" />
              <div>
                <h3 className="font-bold">Instant onboarding</h3>
                <p className="font-medium">
                  An embedded experience; no installs or connect, no wallet
                  logos, no crypto.
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <GasLessIcon className="shrink-0" />
              <div>
                <h3 className="font-bold">Flexible gas fee sponsorship</h3>
                <p className="font-medium">
                  Defer and reassign gas costs. Build your next viral Dapp with
                  Delegation Toolkit.
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <AddFriendIcon className="shrink-0" />
              <div>
                <h3 className="font-bold">Innovate with new use-cases</h3>
                <p className="font-medium">
                  Invite and engage far reaching social networks with multi-hop
                  delegations.
                </p>
              </div>
            </div>
          </div>
        </div>
        <Link href="/breakdown" className="w-full">
          <Button
            variant="outline"
            size="lg"
            className="w-full border-2 border-black bg-transparent text-base font-bold text-black"
          >
            View Commission Breakdown
          </Button>
        </Link>
        <Link
          href="https://metamask.io/developer/delegation-toolkit"
          className={cn(
            buttonVariants({ variant: "default", size: "lg" }),
            "text-base font-bold text-white",
          )}
        >
          Learn More
        </Link>
        <div className="flex flex-col items-center">
          <h3 className="text-[13px] font-bold text-black">
            BROUGHT TO YOU BY
          </h3>
          <div className="flex items-center gap-3">
            <FoxIcon className="h-6 w-6" />
            <CompanyName />
          </div>
        </div>
        <p className="text-center text-sm">
          Learn more and collect limited edition swag at the{" "}
          <Link href="https://lu.ma/metamaskspotlight" className="underline">
            MetaMask Spotlight event
          </Link>
        </p>
      </div>
    </main>
  );
}
