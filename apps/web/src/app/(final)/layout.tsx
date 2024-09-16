import { api } from "@/trpc/server";
import { redirect } from "next/navigation";

export default async function FinalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const over = await api.game.over();
  if (!over) {
    redirect("/");
  }
  return <>{children}</>;
}
