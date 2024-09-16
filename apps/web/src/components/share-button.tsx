import { Button } from "@/components/ui/button";
import { api } from "@/trpc/react";
import { useState } from "react";
import { CreateOfferDrawer } from "./create-offer-drawer";
import { QRCodeDrawer } from "./qr-code-drawer";
import { WalletAddressDrawer } from "./wallet-address-drawer";

const TRANSITION_WAIT = 300;

type Delegation = { index: string; commission: number };

type ShareButtonProps = {
  delegations: Delegation[];
};

export const ShareButton = ({ delegations }: ShareButtonProps) => {
  const [showCreateOffer, setShowCreateOffer] = useState(false);
  const [showWalletAddress, setShowWalletAddress] = useState(false);
  const [offerUrl, setOfferUrl] = useState<string | null>(null);

  const { data: user } = api.user.profile.useQuery();
  const { data: offerCount } = api.offer.created.useQuery();

  if (!user || offerCount === undefined) return null;

  const resetDrawers = () => {
    setOfferUrl(null);
    setShowCreateOffer(false);
    setShowWalletAddress(false);
  };

  const onClick = () => {
    resetDrawers();
    if (!user.walletAddress) {
      setShowWalletAddress(true);
    } else {
      setShowCreateOffer(true);
    }
  };

  const onWalletAddressSuccess = () => {
    setShowWalletAddress(false);
    setTimeout(() => {
      setShowCreateOffer(true);
    }, TRANSITION_WAIT);
  };

  const onOfferCreate = (offerUrl: string) => {
    setShowCreateOffer(false);
    setTimeout(() => {
      setOfferUrl(offerUrl);
    }, TRANSITION_WAIT);
  };

  const onOfferClose = () => {
    setOfferUrl(null);
  };

  return (
    <>
      <div className="absolute bottom-20 w-full px-6 fade-in-0">
        <Button
          variant="secondary"
          size="lg"
          className="w-full text-base font-bold drop-shadow-[0_1px_35px_rgba(0,0,0,1)]"
          onClick={onClick}
        >
          Share Balloons
        </Button>
      </div>
      <WalletAddressDrawer
        open={showWalletAddress}
        onSuccess={onWalletAddressSuccess}
        onOpenChange={setShowWalletAddress}
      />
      <CreateOfferDrawer
        open={showCreateOffer}
        onOfferCreate={onOfferCreate}
        onOpenChange={setShowCreateOffer}
        delegations={delegations}
      />
      {offerUrl && (
        <QRCodeDrawer
          open={!!offerUrl}
          onClose={onOfferClose}
          url={offerUrl}
          title="Share with Recipient"
          message={
            <p className="text-center">
              Share in person or social media.
              <br /> Adapt your strategy whether you are playing to collect all
              balloons or leveraging your balloons to win a share of 5 ETH.
            </p>
          }
        />
      )}
    </>
  );
};
