import { BalloonList } from "@/components/balloon-list";
import { Header } from "@/components/header";
import { api } from "@/trpc/server";

export default async function ShareTab() {
  const userBalloons = await api.userBalloon.all();

  return (
    <>
      <Header
        title="Share"
        description="Select balloons, charge a commission, and increase your chances of walking away with some ETH."
      />
      <BalloonList userBalloons={userBalloons} selectable />
    </>
  );
}
