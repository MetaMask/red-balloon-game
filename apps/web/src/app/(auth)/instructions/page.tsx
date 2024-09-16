/* eslint-disable react/no-unescaped-entities */
import Image from "next/image";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { BALLOON_COUNT, PRIZE_ETH } from "@/lib/constants";

export default async function InstructionsPage({
  searchParams,
}: {
  searchParams: { redirect?: string };
}) {
  return (
    <main className="flex flex-1 flex-col p-6 text-foreground">
      <div className="relative flex flex-1 items-center text-primary-foreground">
        <h1 className="relative z-10 pb-6 text-[4rem] font-bold leading-[94%]">
          How to
          <br />
          play
        </h1>
        <Image
          className="absolute right-0 top-4 z-0"
          src="/images/red-balloon-large.png"
          alt="Red Balloon"
          priority={true}
          width={120}
          height={258}
        />
      </div>
      <div className="relative z-10 flex-1">
        <h3 className="text-lg font-bold">Play to win {PRIZE_ETH} ETH</h3>
        <p className="mb-6 leading-6">
          {BALLOON_COUNT} balloons are hidden around the event. Find them all
          and win the prize.
        </p>
        <h3 className="text-lg font-bold">You can't do it alone</h3>
        <p className="mb-6 leading-6">
          Share the balloons you've found and ask for a commission. If someone
          uses your balloons to win, you'll earn some ETH too.
        </p>
        <h3 className="text-lg font-bold">No wallet or crypto required</h3>
        <p className="mb-16 leading-6">
          Start playing now, no wallet connect or install needed.
        </p>
      </div>
      <Link
        className={cn(
          buttonVariants({ variant: "secondary", size: "lg" }),
          "justify-self-end text-base font-bold",
        )}
        href={`/sign-up?${searchParams.redirect ? "redirect=" + encodeURIComponent(searchParams.redirect) : ""}`}
      >
        Next
      </Link>
    </main>
  );
}
