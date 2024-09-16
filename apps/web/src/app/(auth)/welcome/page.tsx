import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { api } from "@/trpc/server";
import { BALLOON_COUNT, PRIZE_ETH } from "@/lib/constants";

export default async function WelcomePage({
  searchParams,
}: {
  searchParams: { redirect?: string };
}) {
  const userCount = await api.user.count();

  return (
    <main className="flex flex-1 flex-col items-center p-6">
      <div
        className="bg-center-top flex flex-1 flex-col justify-end bg-contain bg-no-repeat text-center"
        style={{
          backgroundImage: "url('/images/atomium-balloon.png')",
        }}
      >
        <h1 className="mb-4 text-balance text-4xl font-bold text-primary-foreground">
          Welcome to Red Balloon
        </h1>
        <div className="mb-4 text-lg font-medium text-foreground">
          <p>Collect all {BALLOON_COUNT} balloons.</p>
          <p>Win {PRIZE_ETH} ETH.</p>
        </div>
        <div className="mb-6 text-sm font-medium text-foreground">
          <p>No wallet or crypto required.</p>
          <p>
            Play now with {userCount} other
            {userCount === 1 ? " player" : " players"}.
          </p>
        </div>
        <Link
          className={cn(
            buttonVariants({ variant: "secondary", size: "lg" }),
            "text-base font-bold",
          )}
          href={`/instructions?${searchParams.redirect ? "redirect=" + encodeURIComponent(searchParams.redirect) : ""}`}
        >
          Let&apos;s Play
        </Link>
      </div>
    </main>
  );
}
