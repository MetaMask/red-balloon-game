import { api } from "@/trpc/server";
import { redirect } from "next/navigation";
import { MaybeRedirect } from "./layout-client";

export default async function HomeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let doRedirect = false;
  try {
    await api.user.profile();
  } catch (error) {
    console.log("Failed to fetch user profile:", error);
    doRedirect = true;
  }

  const over = await api.game.over();
  if (!doRedirect && over) {
    redirect("/congrats");
  }

  return <MaybeRedirect redirect={doRedirect}>{children}</MaybeRedirect>;
}
