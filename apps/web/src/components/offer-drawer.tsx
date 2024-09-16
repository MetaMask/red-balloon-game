"use client";

import { useState } from "react";
import type { RouterOutputs } from "@/trpc/react";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { buttonVariants } from "@/components/ui/button";
import { ArrowUpDownIcon, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { SaveBalloon } from "@/components/save-balloon";
import { useRouter } from "next/navigation";
import { type Hex } from "@codefi/delegator-core-viem";
import { PRIZE_ETH } from "@/lib/constants";

export type OfferDrawerProps = {
  offer: RouterOutputs["offer"]["claim"];
  pk: Hex;
};

export function OfferDrawer({ offer, pk }: OfferDrawerProps) {
  const router = useRouter();
  const [drawerOpen, setDrawerOpen] = useState(true);
  const [balloonIndex, setBalloonIndex] = useState(0);

  const isLastBalloon = offer.balloons.length - 1 === balloonIndex;

  if (!offer.balloons.length || balloonIndex > offer.balloons.length - 1)
    return null;

  const balloon = offer.balloons[balloonIndex]!;

  return (
    <>
      <Drawer open={drawerOpen}>
        <DrawerContent className="bg-primary">
          <DrawerHeader>
            <DrawerTitle className="text-left">
              Balloon #{balloon.index + 1}{" "}
              {balloon.accepted ? "Accepted" : "Rejected"}
              {!balloon.current && " (New)"}
            </DrawerTitle>
          </DrawerHeader>
          <div className="relative flex flex-col gap-4 pl-6 pr-6">
            {balloon.current ? (
              <>
                <div className="absolute left-[50%] top-[50%] flex -translate-x-[50%] -translate-y-[50%] items-center justify-center rounded-full bg-foreground p-2 text-background">
                  {balloon.accepted ? (
                    <ArrowUpDownIcon className="h-6 w-6" />
                  ) : (
                    <X className="h-6 w-6" />
                  )}
                </div>
                <div className="fg-foreground grid grid-cols-[4fr,1fr,2fr] rounded-lg bg-background p-3">
                  <div className="flex items-center text-sm">CURRENT</div>
                  <div className="flex items-center justify-end">
                    {balloon.current.commission}%
                  </div>
                  <div className="flex items-center justify-end text-muted-foreground">
                    {((PRIZE_ETH * balloon.current.commission) / 100).toFixed(
                      2,
                    )}{" "}
                    ETH
                  </div>
                </div>
                <div className="fg-foreground grid grid-cols-[4fr,1fr,2fr] rounded-lg bg-background p-3">
                  <div className="flex items-center text-sm">OFFERED</div>
                  <div className="flex items-center justify-end">
                    {balloon.incoming.commission}%
                  </div>
                  <div className="flex items-center justify-end text-muted-foreground">
                    {((PRIZE_ETH * balloon.incoming.commission) / 100).toFixed(
                      2,
                    )}{" "}
                    ETH
                  </div>
                </div>
              </>
            ) : (
              <div className="fg-foreground grid grid-cols-[4fr,1fr,2fr] rounded-lg bg-background p-3">
                <div className="flex items-center text-sm">OFFERED</div>
                <div className="flex items-center justify-end">
                  {balloon.incoming.commission}%
                </div>
                <div className="flex items-center justify-end text-muted-foreground">
                  {((PRIZE_ETH * balloon.incoming.commission) / 100).toFixed(2)}{" "}
                  ETH
                </div>
              </div>
            )}
          </div>
          <DrawerFooter>
            <DrawerClose
              className={cn(
                buttonVariants({ variant: "secondary", size: "lg" }),
                "flex flex-1 font-bold",
              )}
              onClick={() => {
                if (isLastBalloon) {
                  setDrawerOpen(false);
                  router.replace("/balloons");
                  router.refresh();
                } else {
                  setBalloonIndex(balloonIndex + 1);
                }
              }}
            >
              {isLastBalloon ? "OK" : "Next"}
            </DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
      {balloon.accepted && (
        <SaveBalloon
          delegations={[
            {
              delegation: balloon.incoming.delegation,
              index: balloon.index,
              hash: balloon.incoming.hash,
              pk,
            },
          ]}
        />
      )}
    </>
  );
}
