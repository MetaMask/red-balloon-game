import { BalloonList } from "@/components/balloon-list";
import { ClaimWin } from "@/components/claim-win";
import { ErrorTrigger } from "@/components/error-trigger";
import { Header } from "@/components/header";
import { OfferDrawer } from "@/components/offer-drawer";
import { YourWinnings } from "@/components/your-winnings";
import { api } from "@/trpc/server";
import { redirect } from "next/navigation";
import { type Hex } from "@codefi/delegator-core-viem";
import { BALLOON_COUNT } from "@/lib/constants";

export default async function BalloonsTab({
  searchParams,
}: {
  searchParams: { offer?: string; pk?: Hex };
}) {
  const { offer: offerId, pk } = searchParams;
  const userBalloons = await api.userBalloon.all();

  let errorMessage = "";
  let offerData;

  try {
    offerData = offerId && pk ? await api.offer.claim({ offerId }) : undefined;
  } catch (error) {
    errorMessage =
      (error as { message: string }).message ?? "An error occurred";
  }

  if (errorMessage) {
    redirect(`/balloons?error=${errorMessage}`);
  }

  const hasAllBalloons = userBalloons.length === BALLOON_COUNT;

  return (
    <>
      <Header
        title="Your Balloons"
        description={`Find balloons and scan their QR codes. Collect all ${BALLOON_COUNT} to claim the win!`}
      />
      {!!userBalloons.length && (
        <YourWinnings
          userBalloons={userBalloons}
          hasAllBalloons={hasAllBalloons}
        />
      )}
      <BalloonList userBalloons={userBalloons} />
      {hasAllBalloons && <ClaimWin userBalloons={userBalloons} />}
      {offerData && pk && <OfferDrawer offer={offerData} pk={pk} />}
      <ErrorTrigger />
    </>
  );
}
