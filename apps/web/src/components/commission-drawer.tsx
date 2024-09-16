import { type RouterOutputs } from "@/trpc/react";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "./ui/drawer";
import { type PropsWithChildren } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { getFallbackName } from "@/lib/utils";
import { ArrowDownShortWideIcon } from "./icons";

type CommissionDrawerProps = {
  userBalloon: RouterOutputs["userBalloon"]["all"][number];
};

export const CommissionDrawer = ({
  userBalloon,
  children,
}: PropsWithChildren<CommissionDrawerProps>) => {
  return (
    <Drawer>
      <DrawerTrigger asChild>{children}</DrawerTrigger>
      <DrawerContent className="max-h-[92%]">
        <DrawerHeader>
          <DrawerTitle className="text-left">Commission</DrawerTitle>
        </DrawerHeader>
        <div className="flex flex-col gap-4 px-6 pb-4">
          <div className="flex gap-2">
            <Avatar className="h-6 w-6 ring-2 ring-white">
              <AvatarImage src={userBalloon.fromUserAvatar} alt="avatar" />
              <AvatarFallback>
                {getFallbackName(userBalloon.fromUser)}
              </AvatarFallback>
            </Avatar>
            <div>{`Shared by ${userBalloon.fromUser}`}</div>
          </div>
          <div className="flex gap-1.5">
            <ArrowDownShortWideIcon className="shrink-0 text-primary-foreground" />
            <div>
              This balloon has been passed down {userBalloon.hops} times. Each
              person added a commission. The total commission is{" "}
              {userBalloon.totalCommission}%, including the{" "}
              {userBalloon.commission}% added by {userBalloon.fromUser}.
            </div>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
};
