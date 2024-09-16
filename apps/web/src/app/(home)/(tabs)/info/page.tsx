/* eslint-disable react/no-unescaped-entities */
import { Header } from "@/components/header";
import {
  BalloonIcon,
  CalendarIcon,
  GamePadIcon,
  LocationIcon,
  TrophyIcon,
  TwitterIcon,
} from "@/components/icons";
import { InviteActions } from "@/components/invite";
import { Button } from "@/components/ui/button";
import { BALLOON_COUNT, PRIZE_ETH } from "@/lib/constants";
import { api } from "@/trpc/server";
import Link from "next/link";

export default async function InfoTab() {
  const userCount = await api.user.count();

  return (
    <>
      <Header title="Info" />
      <main className="mb-14 grid gap-6 overflow-y-auto px-6 pb-6 pt-6">
        <div className="grid gap-2">
          <div className="flex items-center gap-2">
            <TrophyIcon className="w-6" />
            <p>{PRIZE_ETH} ETH</p>
          </div>
          <div className="flex items-center gap-2">
            <BalloonIcon className="w-6 text-primary-foreground" />
            <p>Total Balloons: {BALLOON_COUNT}</p>
          </div>
          <div className="flex items-center gap-2">
            <GamePadIcon className="w-6" />
            <p>
              {userCount} {userCount === 1 ? " Player" : " Players"}.
            </p>
          </div>
        </div>
        <Link href="https://x.com/playredballoon" target="_blank">
          <Button variant="action" className="w-fit">
            <TwitterIcon /> Follow PlayRedBalloon
          </Button>
        </Link>
        <div className="flex flex-col items-center rounded-md bg-primary p-4 text-center">
          <h1 className="text-sm text-secondary">
            <span className="text-primary-foreground">
              Want your friends to join the fun?
            </span>
            <span className="mb-4 block text-white">Invite them!</span>
          </h1>
          <InviteActions />
        </div>
        <div>
          <h1 className="mb-4 text-lg text-white">How to Play</h1>
          <h2 className="font-bold text-white">Find Balloons</h2>
          <p className="mb-4 text-muted-foreground">
            {BALLOON_COUNT} balloons are scattered throughout the event. Each
            balloon has a QR code that you need to scan to claim. But beware,
            it's impossible for an individual to find them all!
          </p>
          <h2 className="font-bold text-white">Share &amp; Accept Balloons</h2>
          <p className="mb-4 text-muted-foreground">
            Get others to share their balloons to complete your set and claim a
            win!
          </p>
          <p className="mb-4 text-muted-foreground">
            Found some balloons? Share them with others and charge a commission.
            If they win using your shared balloons, you'll get a share of the
            ETH prize too!
          </p>
          <h2 className="font-bold text-white">{PRIZE_ETH} ETH, really?</h2>
          <p className="mb-4 text-muted-foreground">
            Yup! However, the ETH is split up between those that share balloons
            with the winner. Find them all by yourself, and the ETH is all
            yours.
          </p>
          <h2 className="font-bold text-white">Time Limit</h2>
          <p className="mb-4 text-muted-foreground">
            The game ends when the player who collects all {BALLOON_COUNT}{" "}
            balloons proceeds to Claim Win.
          </p>
        </div>
        <div className="gap-3 rounded-md bg-primary px-2 py-4 text-center">
          <h1 className="text-sm text-secondary">
            <span className="mb-4 block text-accent">
              Do not clear browser cache &amp; history.
            </span>
            <span className="text-white">
              You will lose your progress in the game &amp; have to start over.
            </span>
          </h1>
        </div>
        <div>
          <h1 className="mb-4 text-lg text-white">Tips</h1>
          <h2 className="font-bold text-white">Value of Offers</h2>
          <p className="mb-4 text-muted-foreground">
            Your offers will only be as valuable as the balloons are rare. If
            you share a picture of a balloon publicly, it allows someone else to
            claim a win without including you in their team. Be strategic about
            who you share your discoveries with!
          </p>
          <h2 className="font-bold text-white">Negotiate</h2>
          <p className="mb-4 text-muted-foreground">
            When you receive an offer for a balloon you already have, the
            cheaper offer (i.e., lower commission) replaces the previous offer.
            Practice your negotiation skills when offering balloons and
            accepting offers.
          </p>
        </div>
      </main>
    </>
  );
}
