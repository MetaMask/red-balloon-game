"use client";

import { Button } from "@/components/ui/button";
import { LoadingButton } from "@/components/ui/loading-button";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { api, type RouterOutputs } from "@/trpc/react";
import { useCallback, useMemo, useState } from "react";
import { WalletAddressDrawerContent } from "@/components/wallet-address";
import toast from "react-hot-toast";
import { BALLOON_CONTRACTS, PRIZE_ETH } from "@/lib/constants";
import { useBalloons } from "@/providers/Balloon";
import { stringify } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { claimWin, type DelegationChains } from "@/lib/delegator";

type ClaimWinDrawerProps = {
  chains: RouterOutputs["delegation"]["chains"];
  user: RouterOutputs["user"]["profile"];
  userBalloons: RouterOutputs["userBalloon"]["all"];
};

export function ClaimWinDrawer({
  chains,
  user,
  userBalloons,
}: ClaimWinDrawerProps) {
  const [isClaiming, setIsClaiming] = useState(false);
  const [showDrawer, setShowDrawer] = useState(false);
  const { balloons } = useBalloons();
  const router = useRouter();
  const { mutateAsync: registerWin } = api.game.claimWin.useMutation();
  const [prize, commissions] = useMemo(() => {
    const totalPrize = PRIZE_ETH;
    const commissions = userBalloons.reduce(
      (acc, { totalCommission }) => acc + totalCommission,
      0,
    );
    const totalCommissions = (commissions * totalPrize) / 100;
    return [totalPrize - totalCommissions, totalCommissions];
  }, [userBalloons]);

  const handleClaimTheWin = () => {
    if (prize <= 0) {
      toast("Prize can not be claimed. Find cheaper balloon commissions.");
      return;
    }
    setShowDrawer(true);
  };

  const handleSubmit = useCallback(async () => {
    if (!user?.walletAddress) {
      return;
    }

    const delegationChains = Object.entries(balloons).reduce(
      (prev, [index, balloon]) => {
        const balloonAddress = BALLOON_CONTRACTS[Number(index)]?.address;
        const delegations = chains[index];
        if (!delegations) {
          throw new Error("Missing delegation chain");
        }
        if (!balloonAddress) {
          throw new Error("Missing balloon address");
        }
        prev.set(balloonAddress, {
          delegations,
          leafPk: balloon.pk,
        });
        return prev;
      },
      new Map() as DelegationChains,
    );

    console.info("Claiming win:", user);

    setIsClaiming(true);

    try {
      const receipt = await claimWin(delegationChains, user.walletAddress);
      console.info("Claimed win successfully", stringify(receipt));
      await registerWin({
        winnerAddress: receipt.sender,
        receiptHash: receipt.receipt.transactionHash,
      });
      console.log("Registered win successfully");
      router.push("/congrats");
    } catch (error) {
      toast("Error claiming prize. Please try again");
      console.error("claimWin failed:", stringify(error));
    } finally {
      setIsClaiming(false);
    }
  }, [balloons, chains, registerWin, router, user]);

  let content;

  if (!user.walletAddress) {
    content = <WalletAddressDrawerContent />;
  } else {
    content = (
      <>
        <DrawerHeader className="text-left">
          <DrawerTitle className="mb-6">Claim win</DrawerTitle>
          <DrawerDescription className="text-foreground">
            By submitting these{" "}
            <span className="font-bold">
              you will win {prize.toFixed(2)} ETH
            </span>{" "}
            and{" "}
            <span className="font-bold">
              {commissions.toFixed(2)} ETH will be paid to others
            </span>{" "}
            that have shared balloons with you.
          </DrawerDescription>
        </DrawerHeader>
        <DrawerFooter>
          <LoadingButton
            variant="secondary"
            className="w-full text-base font-bold"
            size="lg"
            loading={isClaiming}
            onClick={handleSubmit}
          >
            Submit
          </LoadingButton>
        </DrawerFooter>
      </>
    );
  }

  return (
    <Drawer open={showDrawer} onClose={() => setShowDrawer(false)}>
      <DrawerTrigger asChild>
        <Button
          variant="secondary"
          size="lg"
          className="fixed bottom-20 w-[85%] self-center text-base font-bold drop-shadow-[0_1px_35px_rgba(0,0,0,1)] fade-in-0"
          onClick={handleClaimTheWin}
        >
          Claim the Win
        </Button>
      </DrawerTrigger>
      <DrawerContent className="max-h-[75vh]">{content}</DrawerContent>
    </Drawer>
  );
}
