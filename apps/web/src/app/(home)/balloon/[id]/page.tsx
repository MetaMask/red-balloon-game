import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import { api } from "@/trpc/server";
import { SaveBalloon } from "@/components/save-balloon";
import { redirect } from "next/navigation";
import { BALLOON_COUNT } from "@/lib/constants";

export default async function BalloonPage({
  params,
}: {
  params: { id: string };
  searchParams: { redirect?: string };
}) {
  let errorMessage = "";
  let foundBalloon;
  try {
    foundBalloon = await api.balloon.claim({ balloonId: params.id });
  } catch (error) {
    const message =
      (error as { message: string }).message ?? "An error occurred";
    if (message == "User already claimed this offer") {
      errorMessage = "You already have this balloon";
    } else {
      errorMessage = message;
    }
  }

  if (errorMessage) {
    redirect(`/balloons?error=${errorMessage}`);
  }

  const userBalloons = await api.userBalloon.all();

  if (!foundBalloon) {
    throw new Error("Balloon not found");
  }

  return (
    <main className="flex flex-1 flex-col items-center justify-between p-6">
      <div className="flex flex-1 flex-col items-center justify-center">
        <Image
          src="/images/atomium-balloon.png"
          alt="Atomium Balloon"
          priority={true}
          width={341}
          height={447}
        />
      </div>
      <div className="flex flex-col justify-between gap-6 text-balance text-center">
        <h1 className="text-balance text-4xl font-bold text-secondary">
          You found a balloon
        </h1>
        <div>
          You now have {userBalloons.length}/{BALLOON_COUNT} balloons
        </div>
        <SaveBalloon
          delegations={[
            {
              index: foundBalloon.index,
              hash: foundBalloon.hash,
              pk: foundBalloon.pk,
              delegation: foundBalloon.delegation,
            },
          ]}
        />
        <Link
          className={cn(
            buttonVariants({ variant: "secondary", size: "lg" }),
            "w-full font-bold",
          )}
          href="/balloons"
        >
          Awesome
        </Link>
      </div>
    </main>
  );
}
