import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import {
  buildOfferUrl,
  commissionInWei,
  isCommissionInRange,
  isCommissionInteger,
} from "@/lib/utils";
import { useBalloons } from "@/providers/Balloon";
import { api } from "@/trpc/react";
import { useEffect, useState, type PropsWithChildren } from "react";
import toast from "react-hot-toast";
import {
  delegationFromString,
  redelegate,
  type DelegationCommission,
  type DelegationWithPk,
} from "@/lib/delegator";
import { generatePrivateKey, privateKeyToAddress } from "viem/accounts";
import { CommissionCard } from "@/components/commission-card";
import { LoadingButton } from "@/components/ui/loading-button";
import {
  OFFER_LOWER_LIMIT,
  OFFER_UPPER_LIMIT,
  PRIZE_WEI,
} from "@/lib/constants";

type Delegation = { index: string; commission: number };

type CreateOfferDrawerProps = {
  delegations: Delegation[];
  onClose?: () => void;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onOfferCreate?: (offerUrl: string) => void;
};

export const CreateOfferDrawer = ({
  children,
  delegations,
  open,
  onClose,
  onOpenChange,
  onOfferCreate,
}: PropsWithChildren<CreateOfferDrawerProps>) => {
  const [commissions, setCommissions] = useState<Record<string, string>>({});
  const { balloons } = useBalloons();
  const { mutateAsync: createOffer, isPending } =
    api.offer.create.useMutation();
  const { data: user } = api.user.profile.useQuery();
  const { data: offerCount } = api.offer.created.useQuery();

  useEffect(() => {
    setCommissions(
      delegations
        .sort((a, b) => Number(a.index) - Number(b.index))
        .reduce(
          (acc, { index }) => {
            acc[index] = "";
            return acc;
          },
          {} as Record<string, string>,
        ),
    );
  }, [delegations]);

  if (!user || offerCount === undefined) return null;

  const isCommissionsValid = Object.values(commissions).every(
    (commission) =>
      !!commission &&
      isCommissionInRange(commission) &&
      isCommissionInteger(commission),
  );

  const onShare = async () => {
    const burnerPk = generatePrivateKey();
    const signedDelegations = [];

    for (const [index, commission] of Object.entries(commissions)) {
      const delegation = delegationFromString(
        balloons[index]?.delegation ?? "",
      );

      delegation.delegate = delegation.delegate.toLowerCase() as `0x${string}`;
      delegation.delegator =
        delegation.delegator.toLowerCase() as `0x${string}`;

      const pk = balloons[index]?.pk;

      if (delegation && pk && user.walletAddress) {
        const parent: DelegationWithPk = {
          delegation,
          pk,
        };

        let amount;

        try {
          amount = commissionInWei(PRIZE_WEI, BigInt(commission));
        } catch (error) {
          toast.error("Error creating offer");
          return console.error("Error creating offer", error);
        }

        const delegationCommission: DelegationCommission = {
          beneficiary: user.walletAddress,
          amount,
        };

        const toAddress = privateKeyToAddress(burnerPk);
        const signedDelegation = await redelegate(
          parent,
          toAddress,
          delegationCommission,
        );

        signedDelegations.push({
          balloonIndex: Number(index),
          commission: Number(commission),
          delegation: signedDelegation,
        });
      }
    }

    try {
      const { offerId } = await createOffer({ delegations: signedDelegations });
      onOfferCreate?.(buildOfferUrl({ id: offerId, pk: burnerPk }));
    } catch (error) {
      toast.error("Error creating offer");
      console.error("Error creating offer", error);
    }
  };

  const handleClose = () => {
    setCommissions(
      delegations.reduce(
        (acc, { index }) => {
          acc[index] = "";
          return acc;
        },
        {} as Record<string, string>,
      ),
    );
    onClose?.();
  };

  return (
    <Drawer open={open} onClose={handleClose} onOpenChange={onOpenChange}>
      <DrawerTrigger asChild>{children}</DrawerTrigger>
      <DrawerContent className="min-h-auto max-h-[92%]">
        <DrawerHeader className="text-left">
          <DrawerTitle>Enter commission</DrawerTitle>
          <DrawerDescription>
            Consider charging a reasonable commission, unless you think your
            balloon is worth more. Min: {OFFER_LOWER_LIMIT}%, Max:{" "}
            {OFFER_UPPER_LIMIT}%
          </DrawerDescription>
        </DrawerHeader>
        <div className="flex flex-col gap-6 overflow-y-scroll px-6">
          {delegations.map(({ commission, index }) => (
            <CommissionCard
              key={index}
              commission={commission}
              index={index}
              value={commissions[index]}
              onChange={(value) =>
                setCommissions({
                  ...commissions,
                  [index]: value,
                })
              }
            />
          ))}
        </div>
        <p className="block px-6 pt-6 text-center text-xs text-muted-foreground">
          Commissions are a % of the total prize
        </p>
        <DrawerFooter>
          <DrawerClose asChild>
            <Button variant="outline" className="flex-1">
              Cancel
            </Button>
          </DrawerClose>
          <LoadingButton
            variant="secondary"
            className="flex-1"
            onClick={onShare}
            disabled={!isCommissionsValid}
            loading={isPending}
          >
            Share Balloons
          </LoadingButton>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
};
